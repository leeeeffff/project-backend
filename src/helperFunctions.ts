import {
  Quiz,
  QuestionBody,
  AnswerBody,
  Question,
  Answer,
  Player,
  QuizSession,
  EmptyReturn,
  ErrorObject,
  ActionType,
  State,
  TempPlayerResult,
  TempAnswerTime
} from './returnedInterfaces';
import { getData, setData, getSessions, setSessions } from './dataStore';
import HTTPError from 'http-errors';

const INVALID = -1;
const THREE_MINS_IN_SECS = 180;
const MAX_WORD = 5;
const MAX_NUM = 3;
const ALPHABETS = 26;
const NUMBERS = 10;

export const getUserId = (token: string): number => {
  const users = getData().users;
  if (token === '') {
    return INVALID;
  }

  let userId = INVALID;
  for (const user of users) {
    for (const session of user.sessions) {
      if (JSON.stringify(session) === token) {
        userId = user.authUserId;
      }
    }
  }

  if (userId === INVALID) {
    return INVALID;
  }
  return userId;
};

/**
 * Check if the given name only contains alphanumeric and space with length
 * between 3 and 30
 *
 * @param {string} name                 - name to check whether it matches the
 *                                        reg exp
 *
 * @returns {ErrorObject | EmptyReturn} - return object depending on given
 *                                        string characters and length
 */
const validateQuizName = (name: string): boolean => {
  return /^[A-Za-z0-9 ]{3,30}$/.test(name);
};

export const checkQuizNameExists = (authUserId: number, name: string, quizId: number) => {
  const quiz = getData().quizzes.some(item => item.authUserId === authUserId &&
    item.name.localeCompare(name) === 0 && !item.isTrashed && item.quizId !== quizId);
  if (quiz) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz.');
  }
};

export const checkQuizName = (authUserId: number, name: string, quizId: number) => {
  // Check if the quiz name only contains alphanumeric and spaces with only
  // length between 3 and 30
  if (!validateQuizName(name)) {
    throw HTTPError(400, 'invalid quiz name');
  }

  // Check if the given name is already created by the current user
  checkQuizNameExists(authUserId, name, quizId);
};

export const checkQuizDescription = (description: string) => {
  if (checkLength(description, 0, 100)) {
    throw HTTPError(400, 'quiz description above 100 characters');
  }
};

/**
 * Check if the given inputString length is within the min and max range
 *
 * @param {string} inputString          - given string to check length
 * @param {number} min                  - minimum length
 * @param {number} max                  - maximum length
 *
 * @returns {ErrorObject | EmptyReturn} - return object depending on inputString length
 */
const checkLength = (inputString: string, min: number, max: number): boolean => {
  return (inputString.length < min || inputString.length > max);
};

/**
 * Get current Unix time stamps in seconds
 *
 * @param {string} type
 *
 * @returns {number}
 */
export const getCurrentUTC = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Generate id by removing duplication
 *
 * @param {Number[]} idArray
 *
 * @returns {number}
 */
export const generateIds = (idArray: number[]): number => {
  if (idArray.length === 0) {
    return idArray.length + 1;
  }

  let id = 1;
  let flag = true;
  while (flag) {
    for (const item of idArray) {
      if (id === item) {
        flag = true;
        break;
      } else {
        flag = false;
      }
    }
    if (flag === true) {
      id++;
    }
  }
  return id;
};

/**
 * Get the quiz of the given quizId
 *
 * @param {number} quizId   - the given quiz id
 * @param {Array} quizzes   - all quizzes in dataStore
 *
 * @returns {number}        - the quiz of the given quizId
 */
export const getQuiz = (quizId: number): Quiz => {
  return getData().quizzes.find(item => item.quizId === quizId && !item.isTrashed);
};

export const getAllQuizzes = (quizId: number): Quiz => {
  return getData().quizzes.find(item => item.quizId === quizId);
};

export const updateQuizData = (quiz: Quiz) => {
  const data = getData();
  data.quizzes = data.quizzes.filter(item => item.quizId !== quiz.quizId);
  data.quizzes.push(quiz);
  setData(data);
};

/**
 * Get the question of the given questionId
 *
 * @param {number} quizIndex  - the index of the given quiz
 * @param {number} questionId - the given question id
 * @param {Array} quizzes     - all quizzes in dataStore
 *
 * @returns {number}        - index of the given quizId
 */
export const getQuestionIndex = (quiz: Quiz, questionId: number): number => {
  return quiz.questions.findIndex(item => item.questionId === questionId);
};

/**
 * Check all status 400 errors of adminQuestion related functions
 *
 * @param {QuestionBody} questionBody  - questionBody object to create
 *                                       new question in a particular quiz
 * @param {number} duration            - totalDuration of the given quiz
 *
 * @returns {{}}
 * @returns {error: string}      - returns error
 */
export const questionErrorChecking = (questionBody: QuestionBody, duration: number): EmptyReturn | ErrorObject => {
  // Check if the given question has length between 5 and 50,
  // if not return error
  if (checkLength(questionBody.question, 5, 50)) {
    return { error: 'Invalid question length' };
  }

  // Check if the total answers of the question is between 2 and 6,
  // if not return error
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return { error: 'Question has more than 6 answers or less than 2 answers' };
  }

  // Check if the given question duration is positive or not, if not return error
  if (questionBody.duration < 1) {
    return { error: 'Question duration is not a positive number' };
  }

  // Check if the total duration of the quesions in the quiz is within
  // 3 minutes, if not return error
  if (duration > THREE_MINS_IN_SECS) {
    return { error: 'Sum of the question durations in the quiz exceeds 3 minutes' };
  }

  // Check if the points given for the question is between 1 and 10,
  // if not return error
  if (questionBody.points < 1 || questionBody.points > 10) {
    return { error: 'Points awarded for the question are less than 1 or greater than 10' };
  }

  // Check if the length of any answer is between 1 and 30,
  // if not return error
  const answer = questionBody.answers.find(item => item.answer.length < 1 || item.answer.length > 30);
  if (answer) {
    return { error: 'The length of any answer is shorter than 1 or longer than 30 characters' };
  }

  // Check if the answer of the question has no duplication,
  // if not return error
  if (checkDuplicateAnswers(questionBody.answers)) {
    return { error: 'Any answer strings are duplicates of one another' };
  }

  // Check if there are correct answers, if not return error
  const correctAnswer = questionBody.answers.find(item => item.correct === true);
  if (!correctAnswer) {
    return { error: 'No correct answers' };
  }

  if ('thumbnailUrl' in questionBody && !checkThumnailUrl(questionBody.thumbnailUrl)) {
    return { error: 'Invalid thumbnailUrl' };
  }

  return {};
};

/**
 * check if the given thumbnailUrl is empty or does not satisfy with it starting
 * and ending conditions
 *
 * @param thumbnailUrl - given thumnailUrl
 * @returns {boolean}
 *
 */
const checkThumnailUrl = (thumbnailUrl: string): boolean => {
  if (thumbnailUrl === '' || !checkThumnailStart(thumbnailUrl) || !checkThumbnailEnd(thumbnailUrl)) {
    return false;
  }
  return true;
};

/**
 * Check if the given thumnailUrl starts with 'http://' or 'https://'
 *
 * @param thumbnailUrl - given thumnailUrl
 * @returns {boolean}
 */
const checkThumnailStart = (thumbnailUrl: string): boolean => {
  return /^http:\/\//.test(thumbnailUrl) || /^https:\/\//.test(thumbnailUrl);
};

/**
 * Check if the given thumbnailUrl ends with 'jpg', 'jpeg' or 'png'
 *
 * @param thumbnailUrl - given thumnailUrl
 * @returns {boolean}
 */
const checkThumbnailEnd = (thumbnailUrl: string): boolean => {
  return /jpg$/.test(thumbnailUrl) || /jpeg$/.test(thumbnailUrl) || /png$/.test(thumbnailUrl);
};

/**
 * Search whether the given answer arrays have duplicate answers or not,
 * if the duplication exists, return boolean
 *
 * @param {AnswerBody[]} answerBody  - answerBody object array stored in a new question
 *
 * @returns {boolean}
 */
const checkDuplicateAnswers = (answers: AnswerBody[]): boolean => {
  const allAnswerStrings = answers.map(item => { return item.answer; });
  const answer = allAnswerStrings.some((item, index) => {
    return allAnswerStrings.indexOf(item) !== index;
  });
  if (answer) {
    return true;
  }
  return false;
};

/**
 * Process the relevant ids for both answers and question and create objects
 * to add in a particular quiz
 *
 * @param {AnswerBody[]} answerBody  - answerBody object array stored in a new question
 * @param {number} questionId        - given questionId
 * @param {string} idExists          - string value to check whether the questionId is
 *                                     given or not
 *
 * @returns {QuestionBody} - constructed QuestionBody object for creating new question
 */
export const processQuestion = (questionBody: QuestionBody, questionId: number, idExists: string): Question => {
  const allAnswers: Answer[] = [];
  let answerId = 1;
  const colours = ['red', 'yellow', 'green', 'blue', 'white', 'purple'];
  for (const item of questionBody.answers) {
    const num = Math.floor(Math.random() * colours.length);
    allAnswers.push({
      answerId: answerId++,
      answer: item.answer,
      colour: colours[num],
      correct: item.correct
    });
    colours.splice(num, 1);
  }

  const question: Question = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: allAnswers,
  };

  if ('thumbnailUrl' in questionBody) {
    question.thumbnailUrl = questionBody.thumbnailUrl;
  }

  return {
    ...question
  };
};

export const actionFailure = (state: State, action: ActionType): boolean => {
  if (state === State.LOBBY) {
    if (!(action === ActionType.NEXT_QUESTION || action === ActionType.END)) {
      return true;
    }
    return false;
  } else if (state === State.QUESTION_COUNTDOWN) {
    if (!(action === ActionType.NEXT_QUESTION || action === ActionType.SKIP_COUNTDOWN || action === ActionType.END)) {
      return true;
    }
    return false;
  } else if (state === State.QUESTION_OPEN) {
    if (!(action === ActionType.GO_TO_ANSWER || action === ActionType.END || action === ActionType.QUESTION_CLOSE)) {
      return true;
    }
    return false;
  } else if (state === State.ANSWER_SHOW) {
    if (!(action === ActionType.GO_TO_FINAL_RESULTS || action === ActionType.END || action === ActionType.NEXT_QUESTION)) {
      return true;
    }
    return false;
  } else if (state === State.QUESTION_CLOSE) {
    if (!(action === ActionType.GO_TO_ANSWER || action === ActionType.END)) {
      return true;
    }
    return false;
  } else if (state === State.FINAL_RESULTS) {
    if (!(action === ActionType.END)) {
      return true;
    }
    return false;
  } else if (state === State.END) {
    return true;
  }
};

/**
 * Get the session object with the given session Id
 *
 * @param sessionId       - given sessionId to find the valid session
 * @returns {QuizSession} - matching QuizSession Object
 */
export const getSession = (sessionId: number): QuizSession => {
  return getSessions().sessions.find(item => item.sessionId === sessionId);
};

/**
 * Get the index of the given session
 *
 * @param sessionId       - given sessionId to find the valid session
 * @returns {QuizSession} - matching QuizSession Object
 */
export const getSessionIndex = (sessionId: number): number => {
  return getSessions().sessions.findIndex(item => item.sessionId === sessionId);
};

/**
 * Check if the given player exists within the given session
 *
 * @param session    - given session to search the player
 * @param name       - given player's name
 * @returns {Player} - matching Player Object
 */
export const checkPlayerExists = (session: QuizSession, name: string): Player => {
  return session.players.find(item => item.name.localeCompare(name) === 0);
};

/**
 * Genearte player name of five words followed by three numbers which are all distinct
 *
 * @returns {string} - final name for the player
 */
export const generateName = (): string => {
  const words: number[] = generateNumberArray(MAX_WORD, ALPHABETS);
  const letters: string[] = words.map(item => String.fromCharCode(item + 97));
  const num: number[] = generateNumberArray(MAX_NUM, NUMBERS);
  return [...letters, ...num].join('');
};

/**
 *
 * @param max
 * @param count
 * @returns
 */
const generateNumberArray = (max: number, count: number): number[] => {
  const numbers: number[] = [];
  let i = 0;
  while (i < max) {
    let number = Math.floor(Math.random() * count);
    while (numbers.includes(number)) {
      number = Math.floor(Math.random() * count);
    }
    numbers.push(number);
    i++;
  }
  return numbers;
};

/**
 *
 * @param session
 */
export const updateSessionData = (session: QuizSession) => {
  const sessions = getSessions();
  sessions.sessions = sessions.sessions.filter(item => item.sessionId !== session.sessionId);
  sessions.sessions.push(session);
  setSessions(sessions);
};

/**
 *
 * @param playerId
 * @returns
 */
export const getPlayerSession = (playerId: number): QuizSession => {
  let session: QuizSession;
  for (const item of getSessions().sessions) {
    const player = item.players.find(data => data.playerId === playerId);
    if (player) {
      session = item;
      break;
    }
  }
  return session;
};

/**
 * Check the answers of the player
 *
 * @param answers    - answers of the question
 * @param answerIds  - player's answers
 * @returns {}       - returns nothing
 */
export const checkPlayerAnswers = (answers: Answer[], answerIds: number[]) => {
  const allAnswers = answers.map(item => item.answerId);
  for (const item of answerIds) {
    if (!allAnswers.includes(item)) {
      throw HTTPError(400, 'Answer IDs are not valid for this particular question');
    }
  }

  const duplciateExists = answerIds.some((item, index) => {
    return answerIds.indexOf(item) !== index;
  });
  if (duplciateExists) {
    throw HTTPError(400, 'There are duplicate answer IDs provided');
  }

  if (answerIds.length === 0) {
    throw HTTPError(400, 'Less than 1 answerID was submitted');
  }
};

/**
 * Get the index of the player within the given session
 *
 * @param session    - given session
 * @param playerId   - given playerId
 * @returns {}       - returns index of the player
 */
export const getPlayerIndex = (session: QuizSession, playerId: number): number => {
  return session.players.findIndex(item => item.playerId === playerId);
};

/**
 * Calculate the score of each player of the current question
 * including rank, update total score and score of the current question
 *
 * @param session           - given session
 * @returns {Quiz Session}  - updates and return the quiz session
 */
export const calculateResult = (session: QuizSession): QuizSession => {
  const pos = session.atQuestion - 1;
  const question = session.metaData.questions[pos];
  const players = session.players;
  const playerCount = players.length;
  let correctAnswerTime: TempAnswerTime[] = [];
  let playerResult: TempPlayerResult[] = [];
  let averageAnswerTime = 0;
  let answerPlayerCount = 0;
  const allCorrectAnswers = question.answers.filter(item => item.correct).map(item => {
    return item.answerId;
  });

  // Check all players who got wrong, correct or do not submit the answers
  for (const player of players) {
    const tempPlayer: TempPlayerResult = {
      playerId: player.playerId,
      score: 0,
      rank: 0,
      isAnswer: false,
      checkCorrect: false,
      isRank: false,
      actualScore: 0,
    };
    if (player.submissions[pos].answerIds.length === 0) {
      tempPlayer.isRank = true;
    } else {
      averageAnswerTime += player.submissions[pos].answerTime;
      answerPlayerCount += 1;
      let flag = true;
      if (player.submissions[pos].answerIds.length === allCorrectAnswers.length) {
        for (const id of player.submissions[pos].answerIds) {
          if (!allCorrectAnswers.includes(id)) {
            flag = false;
            break;
          }
        }
      } else {
        flag = false;
      }
      if (!flag) {
        tempPlayer.score = 0;
        tempPlayer.checkCorrect = false;
      } else {
        tempPlayer.score = question.points;
        tempPlayer.checkCorrect = true;
        correctAnswerTime.push({
          playerId: player.playerId,
          name: player.name,
          answerTime: player.submissions[pos].answerTime,
        });
      }
      tempPlayer.isAnswer = true;
    }
    playerResult.push(tempPlayer);
  }

  // Sort  in ascending order who answers correctly
  correctAnswerTime = correctAnswerTime.sort((a, b) => a.answerTime - b.answerTime);

  // Updates the correct players' score by calculating score * (players' correct answer order)
  for (const item of playerResult) {
    if (item.checkCorrect) {
      const index = correctAnswerTime.findIndex(data => data.playerId === item.playerId) + 1;
      item.actualScore = item.score * (1 / index);
      item.score = Math.round(item.score * (1 / index));
    }
  }

  // get the final result by sorting in descending order
  // and update the rank of the players
  playerResult = playerResult.sort((a, b) => b.score - a.score);
  let rank = 1;
  let start = 0;
  for (const item of playerResult) {
    if (item.isAnswer) {
      if (start === 0) {
        item.rank = rank;
      } else {
        if (item.score === playerResult[start - 1].score) {
          item.rank = rank;
        } else {
          rank = start + 1;
          item.rank = rank;
        }
      }
    }
    start += 1;
  }

  // update each player total score and the score and rank of each player
  for (const player of players) {
    const getPlayer = playerResult.find(data => data.playerId === player.playerId);
    player.score += getPlayer.actualScore;
    player.submissions[pos].score = getPlayer.score;
    player.submissions[pos].rank = getPlayer.rank;
  }

  // finally update calculate averageAnswertime, percentCorrect and update
  // correct player's list
  session.result[pos].averageAnswerTime = Math.round(averageAnswerTime / answerPlayerCount);
  session.result[pos].percentCorrect = Math.round((correctAnswerTime.length / playerCount) * 100);
  session.result[pos].playersCorrectList = correctAnswerTime.map(item => item.name).sort();

  return {
    ...session
  };
};

export const calculateDuration = (startTime: number): number => {
  return Math.round((Date.now() - startTime) / 1000);
};

export const findSession = (quizId: number): boolean => {
  return getSessions().sessions.some(item => item.metaData.quizId === quizId);
};
