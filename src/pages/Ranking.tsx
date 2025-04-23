import React, { useEffect, useState } from 'react';
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
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonBadge
} from '@ionic/react';
import { home, trophy } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router';
import StorageService from '../services/StorageService';
import './Ranking.css';

interface ScoreEntry {
  username: string;
  score: number;
  date: string;
}

interface LocationState {
  quizId?: string;
}

const Ranking: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizzes = async () => {
      const availableQuizzes = await StorageService.listQuizzes();
      setQuizzes(availableQuizzes);
      
      // Seleccionar quiz por defecto (desde la ubicación o el primero disponible)
      const defaultQuiz = location.state?.quizId || availableQuizzes[0];
      if (defaultQuiz) {
        setSelectedQuiz(defaultQuiz);
        loadScores(defaultQuiz);
      } else {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [location.state]);

  const loadScores = async (quizId: string) => {
    setLoading(true);
    const topScores = await StorageService.getTopScores(quizId);
    setScores(topScores);
    setLoading(false);
  };

  const handleQuizChange = (e: CustomEvent) => {
    const quizId = e.detail.value;
    setSelectedQuiz(quizId);
    loadScores(quizId);
  };

  const goToHome = () => {
    history.replace('/home');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ranking de Puntuaciones</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={trophy} className="trophy-icon" />
                    Top 10 Mejores Puntuaciones
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {quizzes.length > 0 ? (
                    <IonItem>
                      <IonLabel>Seleccionar Quiz</IonLabel>
                      <IonSelect 
                        value={selectedQuiz} 
                        onIonChange={handleQuizChange}
                        interface="action-sheet"
                      >
                        {quizzes.map(quiz => (
                          <IonSelectOption key={quiz} value={quiz}>
                            {quiz}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  ) : (
                    <p>No hay quizzes disponibles.</p>
                  )}
                  
                  {loading ? (
                    <p>Cargando puntuaciones...</p>
                  ) : scores.length > 0 ? (
                    <IonList>
                      {scores.map((entry, index) => (
                        <IonItem key={index} className={index < 3 ? `rank-${index + 1}` : ''}>
                          <IonBadge slot="start" color={
                            index === 0 ? 'gold' :
                            index === 1 ? 'silver' :
                            index === 2 ? 'bronze' : 'medium'
                          }>
                            {index + 1}
                          </IonBadge>
                          <IonLabel>
                            <h2>{entry.username}</h2>
                            <p>{formatDate(entry.date)}</p>
                          </IonLabel>
                          <IonBadge slot="end" color="primary">{entry.score} pts</IonBadge>
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <p>No hay puntuaciones para mostrar.</p>
                  )}
                </IonCardContent>
              </IonCard>
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

export default Ranking;