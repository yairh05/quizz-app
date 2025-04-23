import React, { useEffect, useState , useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonProgressBar,
  IonText
} from '@ionic/react';
import { useParams, useHistory } from 'react-router';
import FileService from '../services/FileService';
import StorageService from '../services/StorageService';
import Timer from '../components/Timer';
import './Game.css';

interface GameParams {
  quizId: string;
}

interface QuestionData {
  question: string;
  options: string[];
  answer: string;
}

const Game: React.FC = () => {
  const { quizId } = useParams<GameParams>();
  const history = useHistory();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Cargar preguntas al iniciar
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const randomQuestions = await FileService.getRandomQuestions(quizId, 10);
        setQuestions(randomQuestions);
      } catch (error) {
        setAlertMessage(`Error al cargar las preguntas: ${error}`);
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [quizId]);

  // Actualizar pregunta actual o finalizar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      setCurrentQuestion(FileService.shuffleOptions(q));
      setIsAnswering(true);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(30);
    } else if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      finishQuiz();
    }
  }, [questions, currentQuestionIndex]);

  // Manejo de respuesta
  const handleAnswer = (option: string) => {
    if (!isAnswering || !currentQuestion) return;
    setIsAnswering(false);
    setSelectedOption(option);

    const correct = option === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + timeLeft);
    }

    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1);
    }, 2000);
  };

  // Cuando se agota el tiempo
  const handleTimeout = () => {
    if (!isAnswering) return;
    setIsAnswering(false);
    setIsCorrect(false);
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1);
    }, 2000);
  };

  // Finalizar el quiz
  const finishQuiz = useCallback(async () => {
    const username = localStorage.getItem('quiz_username') || 'Anónimo';
    await StorageService.saveScore(quizId, username, score);
    history.push('/result', { score, totalQuestions: questions.length, quizId });
  }, [quizId, score, questions.length, history]);
  
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      finishQuiz();
    }
  }, [questions, currentQuestionIndex, finishQuiz]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{quizId} — Pregunta {currentQuestionIndex + 1} / {questions.length || 10}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading ? (
          <div className="loading-container">
            <p>Cargando preguntas...</p>
            <IonProgressBar type="indeterminate" />
          </div>
        ) : currentQuestion ? (
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonText color="primary">
                  <h2>Puntuación: {score}</h2>
                </IonText>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <Timer
                  duration={30}
                  onTimeout={handleTimeout}
                  isActive={isAnswering}
                  onTick={t => setTimeLeft(t)}
                />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>{currentQuestion.question}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {currentQuestion.options.map((opt, idx) => (
                      <IonButton
                        key={idx}
                        expand="block"
                        color={
                          !isAnswering && opt === currentQuestion.answer
                            ? 'success'
                            : !isAnswering && opt === selectedOption
                            ? 'danger'
                            : 'primary'
                        }
                        disabled={!isAnswering}
                        onClick={() => handleAnswer(opt)}
                        className="option-button"
                      >
                        {opt}
                      </IonButton>
                    ))}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {!isAnswering && (
              <IonRow>
                <IonCol size="12">
                  <IonCard color={isCorrect ? 'success' : 'danger'}>
                    <IonCardContent>
                      <h2>{isCorrect ? '¡Correcto!' : 'Incorrecto'}</h2>
                      <p>La respuesta correcta es: {currentQuestion.answer}</p>
                      {isCorrect && <p>Has ganado {timeLeft} puntos.</p>}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        ) : (
          <div className="error-container">
            <p>No se pudieron cargar las preguntas.</p>
            <IonButton onClick={() => history.push('/home')}>
              Volver al inicio
            </IonButton>
          </div>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => {
            setShowAlert(false);
            history.push('/home');
          }}
          header="Error"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Game;
