import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert,
  IonIcon,
  IonList
} from '@ionic/react';
import { trophy, playCircle, addCircle } from 'ionicons/icons';
import { useHistory } from 'react-router';
import StorageService from '../services/StorageService';
import FileService from '../services/FileService';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
 // const [selectedQuiz, setSelectedQuiz] = useState('');
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [quizName, setQuizName] = useState('');

  useEffect(() => {
    const loadQuizzes = async () => {
      const availableQuizzes = await StorageService.listQuizzes();
      setQuizzes(availableQuizzes);
    };
    loadQuizzes();

    const savedUsername = localStorage.getItem('quiz_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Ahora recibimos directamente un FileList
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !quizName) {
      setAlertMessage('Por favor, seleccione un archivo y proporcione un nombre para el quiz');
      setShowAlert(true);
      return;
    }

    try {
      await FileService.processFile(files[0], quizName);
      setAlertMessage('Quiz cargado exitosamente');
      setShowAlert(true);
      setShowUploadPrompt(false);
      const availableQuizzes = await StorageService.listQuizzes();
      setQuizzes(availableQuizzes);
    } catch (error) {
      setAlertMessage(`Error al cargar el archivo: ${error}`);
      setShowAlert(true);
    }
  };

  const startQuiz = (quizId: string) => {
    if (!username.trim()) {
      setAlertMessage('Por favor, ingrese un nombre de usuario');
      setShowAlert(true);
      return;
    }
    localStorage.setItem('quiz_username', username);
    history.push(`/game/${quizId}`);
  };

  const viewRanking = () => {
    history.push('/ranking');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Quiz Multijugador</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Bienvenido al Quiz</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="floating">Nombre de Usuario</IonLabel>
                    <IonInput 
                      value={username} 
                      onIonChange={e => setUsername(e.detail.value!)} 
                      required
                    />
                  </IonItem>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Quizzes Disponibles</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {quizzes.length > 0 ? (
                    <IonList>
                      {quizzes.map(quiz => (
                        <IonItem key={quiz}>
                          <IonLabel>{quiz}</IonLabel>
                          <IonButton 
                            fill="outline" 
                            slot="end" 
                            onClick={() => startQuiz(quiz)}
                          >
                            <IonIcon icon={playCircle} slot="start" />
                            Jugar
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <p>No hay quizzes disponibles. ¡Carga uno nuevo!</p>
                  )}
                  
                  <IonButton 
                    expand="full" 
                    color="tertiary" 
                    onClick={() => setShowUploadPrompt(true)}
                  >
                    <IonIcon icon={addCircle} slot="start" />
                    Cargar Nuevo Quiz
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonButton 
                expand="full" 
                color="secondary" 
                onClick={viewRanking}
              >
                <IonIcon icon={trophy} slot="start" />
                Ver Ranking
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showUploadPrompt}
          onDidDismiss={() => setShowUploadPrompt(false)}
          header={'Cargar Quiz'}
          inputs={[
            {
              name: 'quizName',
              type: 'text',
              placeholder: 'Nombre del Quiz'
            }
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Seleccionar Archivo',
              handler: (data: { quizName: string }) => {
                const name = data.quizName?.trim();
                if (!name) {
                  setAlertMessage('Por favor ingresa un nombre para el quiz');
                  setShowAlert(true);
                  return false; // mantiene el alert abierto
                }
                setQuizName(name);

                // Creamos y disparamos el input de archivo
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
                fileInput.onchange = (e) => {
                  const inputEl = e.currentTarget as HTMLInputElement;
                  handleFileUpload(inputEl.files);
                };
                fileInput.click();

                return true;
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
