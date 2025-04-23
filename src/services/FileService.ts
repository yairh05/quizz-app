import * as XLSX from 'xlsx';
import StorageService from './StorageService';

type Question = {
  question: string;
  options: string[];
  answer: string;
};

const FileService = {
  processFile: async (file: File, quizId: string): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convertir hoja a JSON
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

          // Transformar al formato esperado
          const questions: Question[] = jsonData.map((row) => {
            const answer = row.correctAnswer || row.CorrectAnswer || '';
            const question: Question = {
              question: row.question || row.Question || '',
              answer,
              options: [
                answer,
                row.option2 || row.Option2 || '',
                row.option3 || row.Option3 || '',
                row.option4 || row.Option4 || ''
              ]
            };
            return question;
          });

          // Guardar en almacenamiento
          await StorageService.saveQuiz(quizId, questions);

          resolve(questions);
        } catch (error) {
          reject(`Error procesando archivo: ${error}`);
        }
      };

      reader.onerror = () => {
        reject('Error leyendo archivo');
      };

      reader.readAsBinaryString(file);
    });
  },

  getRandomQuestions: async (quizId: string, count = 10): Promise<Question[]> => {
    const questions = await StorageService.getQuiz(quizId);

    if (!questions || questions.length === 0) {
      throw new Error('No hay preguntas disponibles');
    }

    // Seleccionar aleatoriamente
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  shuffleOptions: (question: Question): Question => {
    const shuffledOptions = [...question.options].sort(() => 0.5 - Math.random());
    return {
      ...question,
      options: shuffledOptions
    };
  }
};

export default FileService;
