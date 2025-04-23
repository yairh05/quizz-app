import React, { useEffect } from 'react';
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
  IonIcon
} from '@ionic/react';
import { home, trophy } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router';
import './Result.css';

interface LocationState {
  score: number;
  totalQuestions: number;
  quizId: string;
}

const Result: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { score = 0, totalQuestions = 10, quizId = '' } = location.state || {};

  useEffect(() => {
    // Si no hay puntuación, redirigir al inicio
    if (!location.state) {
      history.replace('/home');
    }
  }, [location.state, history]);

  const getPerformanceMessage = () => {
    const percentage = (score / (totalQuestions * 30)) * 100;
    
    if (percentage >= 80) {
      return '¡Excelente! Eres un experto.';
    } else if (percentage >= 60) {
      return '¡Muy bien! Tienes buenos conocimientos.';
    } else if (percentage >= 40) {
      return 'Buen intento, pero puedes mejorar.';
    } else {
      return 'Sigue practicando para mejorar tu puntuación.';
    }
  };

  const goToHome = () => {
    history.replace('/home');
  };

  const goToRanking = () => {
    history.push('/ranking', { quizId });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Resultados</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard className="result-card">
                <IonCardHeader>
                  <IonCardTitle>¡Quiz Completado!</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="result-container">
                    <h1 className="score-text">{score} puntos</h1>
                    <p className="quiz-info">Quiz: {quizId}</p>
                    <p className="performance-message">{getPerformanceMessage()}</p>
                    
                    <div className="max-score-info">
                      <p>Puntuación máxima posible: {totalQuestions * 30}</p>
                    </div>
                    
                    <div className="username-info">
                      <p>Jugador: {localStorage.getItem('quiz_username') || 'Anónimo'}</p>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol size="12">
              <IonButton 
                expand="block" 
                color="secondary" 
                onClick={goToRanking}
              >
                <IonIcon icon={trophy} slot="start" />
                Ver Ranking
              </IonButton>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol size="12">
              <IonButton 
                expand="block" 
                color="primary" 
                onClick={goToHome}
              >
                <IonIcon icon={home} slot="start" />
                Volver al Inicio
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Result;