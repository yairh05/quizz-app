import { Storage } from '@ionic/storage';

type Score = {
  username: string;
  score: number;
  date: string;
};

type Question = {
  question: string;
  options: string[];
  answer: string;
};

class StorageService {
  private storage: Storage | null = null;

  constructor() {
    this.init();
  }

  async init() {
    const storage = new Storage();
    this.storage = await storage.create();
  }

  // Guardar una puntuación
  async saveScore(quizId: string, username: string, score: number): Promise<Score[]> {
    if (!this.storage) await this.init();

    const key = `quiz_${quizId}_scores`;
    const scores = await this.getScores(quizId) || [];

    scores.push({ username, score, date: new Date().toISOString() });
    await this.storage?.set(key, scores);

    return scores;
  }

  // Obtener todas las puntuaciones de un quiz
  async getScores(quizId: string): Promise<Score[]> {
    if (!this.storage) await this.init();

    const key = `quiz_${quizId}_scores`;
    return await this.storage?.get(key) || [];
  }

  // Obtener el top 10 de puntuaciones de un quiz
  async getTopScores(quizId: string, limit = 10): Promise<Score[]> {
    const scores = await this.getScores(quizId);
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Guardar un quiz cargado desde archivo
  async saveQuiz(quizId: string, questions: Question[]): Promise<void> {
    if (!this.storage) await this.init();
    await this.storage?.set(`quiz_${quizId}`, questions);
  }

  // Obtener un quiz
  async getQuiz(quizId: string): Promise<Question[] | null> {
    if (!this.storage) await this.init();
    return await this.storage?.get(`quiz_${quizId}`);
  }

  // Listar todos los quizzes disponibles
  async listQuizzes(): Promise<string[]> {
    if (!this.storage) await this.init();
    const keys = await this.storage?.keys() || [];
    return keys
      .filter(key => key.startsWith('quiz_') && !key.includes('_scores'))
      .map(key => key.replace('quiz_', ''));
  }
}

export default new StorageService();
