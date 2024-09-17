// Interfaces for Users
export interface UserSession {
  sessionId: number;
}

export interface User {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPasswords: string[];
  sessions: UserSession[];
}

export interface AuthLoginReturn {
  token: string;
}

export interface AdminUserDetailsReturn {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

export interface AuthRegisterReturn {
  token: string;
}

// Interfaces for Quizzes
export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface AnswerBody {
  answer: string;
  correct: boolean;
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  thumbnailUrl?: string;
  answers: Answer[];
}

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerBody[];
  thumbnailUrl?: string;
}

export interface QuestionBodyObject {
  token: string;
  questionBody: QuestionBody;
}

export interface Quiz {
  authUserId: number;
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  numQuestions: number;
  duration: number;
  questions: Question[];
  isTrashed: boolean;
  thumbnailUrl?: string;
}

export interface QuizList {
  quizId: number;
  name: string;
}

export interface QuizCreateReturn {
  quizId: number;
}

export interface QuizListReturn {
  quizzes: QuizList[];
}

export interface QuestionCreateReturn {
  questionId: number;
}

export interface QuestionDuplicateReturn {
  newQuestionId: number;
}

export interface QuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl?: string;
}

// Enum  for QuizSession states
export enum State {
  LOBBY = 'lobby',
  QUESTION_COUNTDOWN = 'question_countdown',
  QUESTION_OPEN = 'question_open',
  QUESTION_CLOSE = 'question_close',
  ANSWER_SHOW = 'answer_show',
  FINAL_RESULTS = 'final_results',
  END = 'end',
}

// Enum for key actions of QuizSessions
export enum ActionType {
  NEXT_QUESTION = 1,
  SKIP_COUNTDOWN,
  GO_TO_ANSWER,
  GO_TO_FINAL_RESULTS,
  END,
  QUESTION_CLOSE
}

export interface Submission {
  questionId: number;
  answerTime: number;
  score: number;
  rank: number;
  answerIds: number[];
}

export interface Player {
  playerId: number;
  name: string;
  score: number;
  submissions: Submission[];
}

export interface PlayerCreateReturn {
  playerId: number;
}

export interface PlayerInfoReturn {
  state: State;
  numQuestions: number;
  atQuestion: number;
}

export interface PlayerAnswerInfo {
  answerId: number;
  answer: string;
  colour: string;
}

export interface PlayerQuestionInfoReturn {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: PlayerAnswerInfo[];
}

export interface UserRank {
  name: string;
  score: number;
}

export interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface Result {
  usersRankedByScore: UserRank[];
  questionResults : QuestionResult[];
}

export interface QuizSessionViewReturn {
  activeSessions: number[];
  inactiveSessions: number[];
}

export interface QuizSessionInfoReturn {
  state: State;
  atQuestion: number;
  players: string[];
  metadata: QuizInfoReturn;
}

export interface ResultCSV {
  url: string;
}

export interface QuizSessionCreateReturn {
  sessionId: number;
}

export interface Message {
  playerId: number;
  playerName: string;
  messageBody: string;
  timeSent: number;
}

export interface QuizSessionMessageReturn {
  messages: Message[];
}

export interface QuizSession {
  sessionId: number;
  token: string;
  state: State;
  atQuestion: number;
  metaData: Quiz;
  autoStartNum: number;
  players: Player[];
  result: QuestionResult[];
  messages: Message[];
  timerId: number | ReturnType<typeof setTimeout>;
  timeStart: number;
}

// interfaces for dataStore
export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  inactiveSessions: QuizSession[];
}

export interface SessionStore {
  sessions: QuizSession[];
}

export interface TempPlayerResult{
  playerId: number;
  score: number;
  rank: number;
  isAnswer: boolean;
  checkCorrect: boolean;
  isRank: boolean;
  actualScore: number;
}

export interface TempAnswerTime {
  playerId: number;
  name: string;
  answerTime: number;
}

export interface ErrorObject {
  error: string;
}

export type EmptyReturn = Record<string, string>;
