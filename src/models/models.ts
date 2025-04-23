// src/models/models.ts

export interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface QuizScore {
    username: string;
    score: number;
    date: string;
    quizId: string;
  }
  
  export interface Quiz {
    id: string;
    name: string;
    questions: Question[];
  }