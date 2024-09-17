import fs from 'fs';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import { getData, setData, getSessions, setSessions } from './dataStore';
import {
  User,
  Quiz,
  QuizList,
  QuizListReturn,
  QuizCreateReturn,
  QuizInfoReturn,
  EmptyReturn,
  ErrorObject,
  QuizSessionViewReturn,
  State,
  QuizSessionCreateReturn,
  QuestionResult,
  QuizSession,
  ActionType,
  Result,
  ResultCSV,
  QuizSessionInfoReturn,
} from './returnedInterfaces';
import {
  getUserId,
  checkQuizName,
  getCurrentUTC,
  generateIds,
  getQuiz,
  getAllQuizzes,
  checkQuizNameExists,
  checkQuizDescription,
  updateQuizData,
  getSession,
  actionFailure,
  updateSessionData,
  getSessionIndex,
  calculateResult,
  findSession
} from './helperFunctions';
import HTTPError from 'http-errors';

// constant for invalid index
const INVALID = -1;

// constant for converting time to milliseconds
const TO_MILLISECONDS = 1000;

// num of seconds the question countdown lasts for
const COUNTDOWN_DURATION = 3;

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} token - the stringified sessionId
 *
 * @returns {
 *  Array<{
 *    quizzes: [
 *      {
 *        quizId: number,
 *        name: string,
 *      }
 *    ]
 *  }>
 * } - list of quizzes
 * @returns {error: string}   - returns error
 */
export const adminQuizList = (token: string): QuizListReturn | ErrorObject => {
  const data = getData();

  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);

  if (authUserId === INVALID) {
    throw HTTPError(401, 'invalid token');
  }

  // Add all the quizes that belongs to the given authUserId and return it
  const quizzes: QuizList[] = data.quizzes.filter(item => item.authUserId === authUserId && !item.isTrashed)
    .map(data => {
      return {
        quizId: data.quizId,
        name: data.name
      };
    });

  return {
    quizzes: quizzes
  };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {string} token        - the stringified sessionId
 * @param {string} name         - name of the quiz
 * @param {string} description  - description of the quiz
 *
 * @returns {quizId: number}    - the quiz id for the new quiz
 * @returns {error: string}     - returns error
 */
export const adminQuizCreate = (token: string, name: string, description: string, version: string): QuizCreateReturn | ErrorObject => {
  const data = getData();

  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);

  if (authUserId === INVALID) {
    throw HTTPError(401, 'invalid token');
  }

  // check if the name length, characters and already exists or not
  checkQuizName(authUserId, name, INVALID);

  // Check if the description has more than 100 characters
  checkQuizDescription(description);

  // Add the new quiz into the quizzes array to store data
  const time = getCurrentUTC();
  const allQuizIds = data.quizzes.map(item => item.quizId);
  const quizId = generateIds(allQuizIds);

  const newQuiz: Quiz = {
    authUserId: authUserId,
    quizId: quizId,
    name: name,
    description: description,
    timeCreated: time,
    timeLastEdited: time,
    numQuestions: 0,
    duration: 0,
    questions: [],
    isTrashed: false
  };

  if (version === 'v2') {
    newQuiz.thumbnailUrl = 'http://google.com/some/image/path.jpg';
  }

  data.quizzes.push(newQuiz);
  setData(data);
  return {
    quizId: quizId
  };
};

/**
  * Given a particular quiz, add the quiz to the trash.
  *
  * @param {number} authUserId  - number data which identifies user based on id
  * @param {number} quizId      - number data which identifies quiz based on id
  *
  * @returns {{}}               - returns an empty object
  * @returns {error: string}    - returns error
*/
export const adminQuizRemove = (token: string, quizId: number, version: string): EmptyReturn | ErrorObject => {
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  if (version === 'v2' && findSession(quizId)) {
    throw HTTPError(400, 'Any session for this quiz is not in END state');
  }

  // Update the timeLastEdited
  quiz.timeLastEdited = getCurrentUTC();

  // Remove the quiz from quizzes array and update the dataStore
  quiz.isTrashed = true;

  updateQuizData(quiz);

  return {};
};

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param {number} authUserId  - number data which identifies user based on id
  * @param {number} quizId      - number data which identifies quiz based on id
  *
  * @returns {
  *   {
  *     quizId: number,
  *     name: string,
  *     timeCreated: number,
  *     timeLastEdited: number,
  *     description: string
  *   }
  * }                           - returns relevant quiz's info object
  * @returns {error: string}    - returns error
*/
export const adminQuizInfo = (token: string, quizId: number, version: string): QuizInfoReturn | ErrorObject => {
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const quizInfo: QuizInfoReturn = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
  if (version === 'v2') {
    quizInfo.thumbnailUrl = quiz.thumbnailUrl;
  }

  // returns the details of the quiz
  return {
    ...quizInfo
  };
};

/**
  * Update the name of the relevant quiz.
  *
  * @param {string} token         - the stringified sessionId
  * @param {integer} quizId       - The quiz for which the name is being
  *                                 changed
  * @param {string} name          - New name to replace old quiz name
  *
  * @returns {{}}                 - returns empty object
  * @returns {error: string}      - returns error
*/
export const adminQuizNameUpdate = (token: string, quizId: number, name: string): EmptyReturn | ErrorObject => {
  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Invalid token');
  }

  // Check if the given quizId exists or not
  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // check if the name length, characters and already exists or not
  checkQuizName(authUserId, name, quiz.quizId);

  // Update name and timeLastEdited of the quiz to update data in dataStore
  quiz.name = name;
  quiz.timeLastEdited = getCurrentUTC();

  updateQuizData(quiz);

  return {};
};

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} authUserId   - the authenticated user id
 * @param {number} quizId       - the relavent quiz id
 * @param {string} description  - new description for quiz
 *
 * @returns {{}}                - returns an empty object
 * @returns {error: string}     - returns error
 */
export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): EmptyReturn | ErrorObject => {
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  // Check if the description has more than 100 characters
  checkQuizDescription(description);

  // Update description and timeLastEdited of the quiz to update data in
  // dataStore
  quiz.description = description;
  quiz.timeLastEdited = getCurrentUTC();

  updateQuizData(quiz);

  return {};
};

/**
 *
 * @param quizId
 * @param token
 * @returns
 */
export const adminQuizRestore = (quizId: number, token: string): EmptyReturn | ErrorObject => {
  // Validate token and find user
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Invalid token');
  }

  // Check if the given quizId exists or the quiz is owned by the given user
  // and if not return error
  const quiz = getAllQuizzes(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Invalid quizId');
  }

  // Checks if user owns the quiz
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // Checks if quiz is in trash
  if (!quiz.isTrashed) {
    throw HTTPError(400, 'Quiz is not currently in the trash');
  }

  // Check for name conflict
  checkQuizNameExists(authUserId, quiz.name, quiz.quizId);

  // Restore the quiz
  quiz.isTrashed = false;
  quiz.timeLastEdited = getCurrentUTC();

  updateQuizData(quiz);

  return {};
};

// function empties trash
/**
 *
 * @param token
 * @param quizIds
 * @returns
 */
export const adminQuizTrashEmpty = (token: string, quizIds: number[]): EmptyReturn | ErrorObject => {
  const data = getData();
  // Validate token and find user
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Invalid token');
  }

  for (const quizId of quizIds) {
    // Check if the given quizId exists or the quiz is owned by the given user
    // and if not return error
    const quiz: Quiz = getAllQuizzes(quizId);
    if (!quiz) {
      throw HTTPError(403, 'QuizId invalid');
    }

    // Checks if user owns the quiz
    if (quiz.authUserId !== authUserId) {
      throw HTTPError(403, 'user does not own quiz');
    }

    // Checks if quiz is in trash
    if (!quiz.isTrashed) {
      throw HTTPError(400, 'Quiz is not currently in the trash');
    }
  }

  // Proceed to delete quizzes from the trash
  data.quizzes = data.quizzes.filter(quiz => !quizIds.includes(quiz.quizId) || quiz.authUserId !== authUserId);
  setData(data);

  return {};
};

/**
 *
 * @param quizId
 * @param token
 * @param userEmail
 * @returns
 */
export const adminQuizTransfer = (quizId: number, token: string, userEmail: string, version: string): EmptyReturn | ErrorObject => {
  const data = getData();

  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Invalid token');
  }

  // Check if the given quizId exists or the quiz is owned by the given user
  // and if not return error
  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Invalid quizId');
  }
  /// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// pretty sure these 403's aren't tested
  // Checks if user owns the quiz
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  // Find target user based on userEmail
  const targetUser: User = data.users.find(user => user.email === userEmail);
  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }

  if (targetUser.authUserId === authUserId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  if (data.quizzes.some(q => q.name === quiz.name && q.authUserId === targetUser.authUserId)) {
    throw HTTPError(400, 'Quiz name is already used by the target user');
  }

  if (version === 'v2' && findSession(quizId)) {
    throw HTTPError(400, 'Any session for this quiz is not in END state');
  }

  // Transfer ownership
  quiz.authUserId = targetUser.authUserId;

  updateQuizData(quiz);

  return {};
};

/**
 *
 * @param token
 * @returns
 */
export const adminQuizTrash = (token: string): QuizListReturn | ErrorObject => {
  const data = getData();

  // Check if the given token is empty or invalid
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Invalid token');
  }

  // this filters the quizzes that are trashed and belonging to the authenticated user
  const trashedQuizzes: QuizList[] = data.quizzes.filter(quiz => quiz.isTrashed &&
    quiz.authUserId === authUserId)
    .map(quiz => {
      return { quizId: quiz.quizId, name: quiz.name };
    });

  // returns the quizzes
  return { quizzes: trashedQuizzes };
};

/**
 * Updates the given quiz sessions state
 *
 * @param token string
 * @param quizId number
 * @param sessionId number
 * @param action ActionType enum
 * @returns empty object
 */
export const quizSessionUpdate = (token: string, quizId: number, sessionId: number, action: ActionType): EmptyReturn => {
  let session = getSession(sessionId);
  if (!session) {
    throw HTTPError(400, 'The sessionId does not refer to a valid session in this quiz');
  }

  if (actionFailure(session.state, action)) {
    throw HTTPError(400, 'The action cannot be applied in the current state');
  }

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz = getQuiz(quizId);
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  if (action === ActionType.END) {
    if (session.state === State.QUESTION_COUNTDOWN || session.state === State.QUESTION_OPEN) {
      clearTimeout(session.timerId);
      session.timerId = INVALID;
    }
    session.atQuestion = 0;
    session.state = State.END;

    // remove session from active sessions store and store in dataStore
    const sessions = getSessions();
    const sessionIndex = getSessionIndex(sessionId);
    sessions.sessions.splice(sessionIndex, 1);

    const data = getData();
    data.inactiveSessions.push(session);
    setData(data);
  } else if (action === ActionType.GO_TO_ANSWER) {
    if (session.state === State.QUESTION_OPEN) {
      clearTimeout(session.timerId);
      session.timerId = INVALID;
      session = calculateResult(session);
    }
    session.state = State.ANSWER_SHOW;
  } else if (action === ActionType.SKIP_COUNTDOWN) {
    clearTimeout(session.timerId);
    session.timeStart = Date.now();
    session.state = State.QUESTION_OPEN;
    session.timerId = setTimeout(quizSessionUpdate, session.metaData.questions[session.atQuestion - 1].duration * TO_MILLISECONDS, token, quizId, sessionId, ActionType.QUESTION_CLOSE);
  } else if (action === ActionType.GO_TO_FINAL_RESULTS) {
    session.state = State.FINAL_RESULTS;
    session.atQuestion = 0;
  } else if (action === ActionType.NEXT_QUESTION) {
    if (session.state === State.LOBBY) {
      clearTimeout(session.timerId);
    }
    session.atQuestion += 1;
    session.state = State.QUESTION_COUNTDOWN;
    session.timerId = setTimeout(quizSessionUpdate, COUNTDOWN_DURATION * TO_MILLISECONDS, token, quizId, sessionId, ActionType.SKIP_COUNTDOWN);
  } else if (action === ActionType.QUESTION_CLOSE) {
    session.state = State.QUESTION_CLOSE;
    session = calculateResult(session);
  }

  updateSessionData(session);

  return {};
};

/**
 * Returns info about the specified quiz session
 *
 * @param token string
 * @param quizId number
 * @param sessionId number
 * @returns QuizSession Object
 */
export const getQuizSessionInfo = (token: string, quizId: number, sessionId: number): QuizSessionInfoReturn => {
  const session = getSession(sessionId);
  if (!session) {
    throw HTTPError(400, 'The sessionId does not refer to a valid session in this quiz');
  }

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz = getQuiz(quizId);
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  const playerArray = [];
  for (const player of session.players) {
    playerArray.push(player.name);
  }

  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: playerArray,
    metadata: {
      quizId: session.metaData.quizId,
      name: session.metaData.name,
      timeCreated: session.metaData.timeCreated,
      timeLastEdited: session.metaData.timeLastEdited,
      description: session.metaData.description,
      numQuestions: session.metaData.numQuestions,
      questions: session.metaData.questions,
      duration: session.metaData.duration,
      thumbnailUrl: session.metaData.thumbnailUrl,
    }
  };
};

/**
 * Returns the results of the quiz session
 *
 * @param token string
 * @param quizId number
 * @param sessionId number
 * @returns
 */
export const getQuizSessionResults = (token: string, quizId: number, sessionId: number): Result => {
  const session = getSession(sessionId);
  if (!session) {
    throw HTTPError(400, 'The sessionId does not refer to a valid session in this quiz');
  }

  if (session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'The session is not in the final results state');
  }

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz = getQuiz(quizId);
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  return {
    usersRankedByScore: session.players.map(item => {
      return {
        name: item.name,
        score: Math.round(item.score)
      };
    }).sort((a, b) => b.score - a.score),
    questionResults: session.result,
  };
};

/**
 * Returns a link to the results of the session in a csv
 *
 * @param token string
 * @param quizId number
 * @param sessionId number
 * @returns ResultCSV object
 */
export const getQuizSessionResultsCSV = (token: string, quizId: number, sessionId: number): ResultCSV => {
  const session = getSession(sessionId);
  if (!session) {
    throw HTTPError(400, 'The sessionId does not refer to a valid session in this quiz');
  }

  if (session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'The session is not in the final results state');
  }

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz = getQuiz(quizId);
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'user does not own quiz');
  }

  let csvContent = 'Player';
  for (let i = 1; i <= session.metaData.questions.length; i++) {
    csvContent = csvContent + ',' + `question${i}score` + ',' + `question${i}rank`;
  }

  const sortedPlayerList = session.players.sort((a, b) => a.name.localeCompare(b.name));

  for (const player of sortedPlayerList) {
    csvContent += '\n';
    csvContent += player.name;
    for (let i = 0; i < session.metaData.questions.length; i++) {
      csvContent = csvContent + ',' + player.submissions[i].score + ',' + player.submissions[i].rank;
    }
  }

  fs.writeFileSync('./public/results.csv', csvContent);

  return { url: SERVER_URL + '/results.csv' };
};

export function adminQuizThumbnail(quizId: number, token: string, imgUrl: string): EmptyReturn | ErrorObject {
  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const lowercaseImgUrl = imgUrl.toLowerCase();

  if (lowercaseImgUrl.endsWith('.jpg') === false &&
    lowercaseImgUrl.endsWith('.jpeg') === false &&
    lowercaseImgUrl.endsWith('.png') === false) {
    throw HTTPError(400, 'imgUrl does not end with a valid filetype');
  }

  if (lowercaseImgUrl.startsWith('http://') === false &&
    lowercaseImgUrl.startsWith('https://') === false) {
    throw HTTPError(400, 'imgUrl does not start with a valid filetype');
  }

  // Update the timeLastEdited
  quiz.timeLastEdited = getCurrentUTC();

  // Update the thumbnail
  quiz.thumbnailUrl = imgUrl;

  updateQuizData(quiz);

  return {};
}

/**
 * Updates the quiz thumbnail, and timeLastEdited
*
 * @param {string} token         - the stringified sessionId
 * @param {number} quizId        - id of chosen quiz
 *
 * @returns {{activeSessions: number[], inactiveSessions: number[]}}   - 2 arrays of active and inactive quizzes
 * @returns {error: string}      - returns error
 */
export function adminQuizViewSessions(token: string, quizId: number): ErrorObject | QuizSessionViewReturn {
  const data = getData();

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getQuiz(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const activeSessionArray: number[] = [];
  const inactiveSessionArray: number[] = [];

  for (const session of getSessions().sessions) {
    activeSessionArray.push(session.sessionId);
  }

  for (const session of data.inactiveSessions) {
    inactiveSessionArray.push(session.sessionId);
  }

  activeSessionArray.sort((a, b) => a - b);
  inactiveSessionArray.sort((a, b) => a - b);

  return {
    activeSessions: activeSessionArray,
    inactiveSessions: inactiveSessionArray
  };
}

/**
 * Starts a new quiz session
 *
 * @param {number} quizId        - id of chosen quiz
 * @param {string} token         - the stringified userId
 * @param {num} autoStartNum     - description of the quiz
 *
 * @returns {{sessionId: number}}     - sessionId
 * @returns {error: string}           - returns error
 */
export function adminQuizStartNewSession(quizId: number, token: string, autoStartNum: number): QuizSessionCreateReturn | ErrorObject {
  const sessions = getSessions();

  const authUserId = getUserId(token);
  if (authUserId === INVALID) {
    throw HTTPError(401, 'Token invalid');
  }

  const quiz: Quiz = getAllQuizzes(quizId);
  if (!quiz) {
    throw HTTPError(403, 'QuizId invalid');
  }

  // Check if the given quiz is owned by the given user
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum cannot be >50');
  }

  if (quiz.isTrashed) {
    throw HTTPError(400, 'quiz cannot be in trash');
  }

  // if there are no questions, throw error
  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'quiz must have questions');
  }

  // A maximum of 10 sessions that are not in END state currently exist for this quiz
  if (sessions.sessions.length >= 10) {
    throw HTTPError(400, 'There are more than 10 active sessions for this quiz');
  }

  // This copies the quiz, so that any edits whilst a session is running does not affect active session
  const sessionId = (Math.floor(Math.random() * 90001) + 10001);

  // creates the questionResults array,
  // by default, empty
  const questionResults: QuestionResult[] = [];

  for (const question of quiz.questions) {
    questionResults.push({
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
    });
  }

  const newSessionStart: QuizSession = {
    token: token,
    sessionId: sessionId,
    state: State.LOBBY,
    atQuestion: 0,
    metaData: quiz,
    autoStartNum: autoStartNum,
    players: [],
    result: questionResults,
    timerId: INVALID,
    messages: [],
    timeStart: 0
  };

  sessions.sessions.push(newSessionStart);
  setSessions(sessions);

  return {
    sessionId: sessionId
  };
}
