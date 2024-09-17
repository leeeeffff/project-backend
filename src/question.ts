import HTTPError from 'http-errors';
import {
  Question,
  QuestionBody,
  QuestionCreateReturn,
  QuestionDuplicateReturn,
  EmptyReturn,
  ErrorObject
} from './returnedInterfaces';
import {
  getUserId,
  getCurrentUTC,
  generateIds,
  getQuiz,
  getQuestionIndex,
  updateQuizData,
  questionErrorChecking,
  processQuestion,
  findSession,
} from './helperFunctions';

// constant for invalid index
const INVALID = -1;
/**
 * Create the question in a particular quiz
 *
 * @param {string} token               - the stringified sessionId
 * @param {number} quizId              - the relavent quiz id
 * @param {QuestionBody} questionBody  - questionBody object to create
 *                                       new question in a particular quiz
 *
 * @returns {questionId: number} - the question id for the new question
 * @returns {error: string}      - returns error
 */
export const adminCreateQuestion = (token: string, quizId: number,
  questionBody: QuestionBody): QuestionCreateReturn => {
  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  // Check if the given quizId exists and if not return error
  const quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  // Check if the given quizId is owned by the given user,
  // if not return error
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'not owned by user');
  }

  const duration = quiz.duration + questionBody.duration;

  // Check all status 400 errors of adminCreateQuestion function
  const error: ErrorObject | EmptyReturn = questionErrorChecking(questionBody, duration);
  if ('error' in error) {
    throw HTTPError(400, 'questionErrorChecking');
  }

  quiz.timeLastEdited = getCurrentUTC();
  quiz.numQuestions += 1;
  quiz.duration = duration;

  const allQuestionIds = quiz.questions.map(item => item.questionId);
  const questionId = generateIds(allQuestionIds);

  const question = processQuestion(questionBody, questionId, 'no');
  quiz.questions.push(question);

  updateQuizData(quiz);

  return {
    questionId: questionId
  };
};

/**
 * Update the particular question in a particular quiz
 *
 * @param {string} token               - the stringified sessionId
 * @param {number} quizId              - the relavent quiz id
 * @param {number} questionId          - given questionId to update
 * @param {QuestionBody} questionBody  - questionBody object to create
 *                                       new question in a particular quiz
 *
 * @returns {{}}            - returns empty object
 * @returns {error: string} - returns error
 */
export const adminUpdateQuestion = (token: string, quizId: number,
  questionId: number, questionBody: QuestionBody): EmptyReturn => {
  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  // Check if the given quizId exists and if not return error
  const quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'invalid quizId');
  }

  // Check if the given quizId is owned by the given user,
  // if not return error
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // Check if the given questionId exists, if not return error
  const questionIndex = getQuestionIndex(quiz, questionId);
  if (questionIndex === INVALID) {
    throw HTTPError(400, 'invalid questionId');
  }

  const duration = quiz.duration - quiz.questions[questionIndex].duration + questionBody.duration;

  // Check all status 400 errors of adminCreateQuestion function
  const error: ErrorObject | EmptyReturn = questionErrorChecking(questionBody, duration);
  if ('error' in error) {
    throw HTTPError(400, 'questionErrorChecking');
  }

  quiz.timeLastEdited = getCurrentUTC();
  quiz.duration = duration;

  const question = processQuestion(questionBody, questionId, 'yes');
  quiz.questions[questionIndex] = question;

  updateQuizData(quiz);

  return {};
};

/**
 * Delete the particular question from a particular quiz
 *
 * @param {string} token               - the stringified sessionId
 * @param {number} quizId              - the relavent quiz id
 * @param {number} questionId          - given questionId to update
 *
 * @returns {{}}            - returns empty object
 * @returns {error: string} - returns error
 */
export const adminDeleteQuestion = (token: string, quizId: number,
  questionId: number, version: string): EmptyReturn => {
  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  // Check if the given quizId exists and if not return error
  const quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'invalid quizId');
  }

  // Check if the given quizId is owned by the given user,
  // if not return error
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // Check if the given questionId exists, if not return error
  const questionIndex = getQuestionIndex(quiz, questionId);
  if (questionIndex === INVALID) {
    throw HTTPError(400, 'invalid questionId');
  }

  if (version === 'v2' && findSession(quizId)) {
    throw HTTPError(400, 'Any session for this quiz is not in END state');
  }

  // update numQuestins, duration and remove the question from array
  quiz.numQuestions -= 1;
  quiz.duration -= quiz.questions[questionIndex].duration;
  quiz.questions.splice(questionIndex, 1);

  updateQuizData(quiz);

  return {};
};

/**
 *
 * @param quizId
 * @param questionId
 * @param token
 * @param newPosition
 * @returns
 */
export const adminQuizQuestionMove = (
  quizId: number,
  questionId: number,
  token: string, newPosition: number
): EmptyReturn => {
  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  // Check if the given quizId exists or the quiz is owned by the given user
  // and if not return error
  const quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'invalid quizId');
  }

  // Checks if user owns the quiz
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  /// ////////////// work on if user does not own the quiz
  const questionIndex = getQuestionIndex(quiz, questionId);
  if (questionIndex === INVALID) {
    throw HTTPError(400, 'invalid questionId');
  }

  if (newPosition < 0 || newPosition >= quiz.numQuestions) {
    throw HTTPError(400, 'NewPosition is out of bounds');
  }

  if (newPosition === questionIndex) {
    throw HTTPError(400, 'NewPosition is the position of the current question');
  }

  const removedQuestion: Question = quiz.questions[questionIndex];
  quiz.questions.splice(questionIndex, 1);
  quiz.questions.splice(newPosition, 0, removedQuestion);

  quiz.timeLastEdited = getCurrentUTC();

  updateQuizData(quiz);

  return {};
};

/**
 *
 * @param quizId
 * @param questionId
 * @param token
 * @returns
 */
export const adminQuizQuestionDuplicate = (quizId: number, questionId: number, token: string): QuestionDuplicateReturn => {
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'invalid quizId');
  }

  const questionIndex = getQuestionIndex(quiz, questionId);
  if (questionIndex === INVALID) {
    throw HTTPError(400, 'invalid questionId');
  }

  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // update timeLastEdited
  quiz.timeLastEdited = getCurrentUTC();
  quiz.numQuestions += 1;

  // duplicate question with a new questionId
  const newQuestion: Question = { ...quiz.questions[questionIndex] };
  quiz.duration = quiz.duration + newQuestion.duration;

  // generate a new questionId
  const allQuestionIds = quiz.questions.map(item => item.questionId);
  const newQuestionId = generateIds(allQuestionIds);
  newQuestion.questionId = newQuestionId;

  quiz.questions.push(newQuestion);
  updateQuizData(quiz);

  return {
    newQuestionId: newQuestionId
  };
};
