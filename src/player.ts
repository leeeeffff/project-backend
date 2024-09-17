import HTTPError from 'http-errors';
import {
  PlayerCreateReturn,
  State,
  Submission,
  QuizSession,
  Question,
  QuestionResult,
  PlayerInfoReturn,
  PlayerQuestionInfoReturn,
  PlayerAnswerInfo,
  EmptyReturn,
  Result,
  QuizSessionMessageReturn,
  ActionType
} from './returnedInterfaces';
import {
  generateIds,
  getSession,
  checkPlayerExists,
  generateName,
  updateSessionData,
  getPlayerSession,
  checkPlayerAnswers,
  getCurrentUTC,
  getPlayerIndex,
  calculateDuration
} from './helperFunctions';
import {
  quizSessionUpdate
} from './quiz';

/**
 * Create the player within the given session to participate the game
 *
 * @param sessionId              - given quizSessionId that player would like to join
 * @param name                   - given name of the player
 * @returns {PlayerCreateReturn} - returns the playerId after letting the
 *                                 player join the session
 */
export const adminPlayerCreate = (sessionId: number, name: string): PlayerCreateReturn => {
  const session = getSession(sessionId);
  if (!session) {
    throw HTTPError(400, 'Invalid SessionId');
  }

  if (checkPlayerExists(session, name)) {
    throw HTTPError(400, 'Name of user entered is not unique');
  }

  if (session.state !== State.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    name = generateName();
  }

  const allPlayerIds = session.players.map(item => item.playerId);
  const playerId = generateIds(allPlayerIds);

  // Predefined the submission array to recored the player's score
  // after answering the question
  const submissions: Submission[] = session.metaData.questions.map(item => {
    return {
      questionId: item.questionId,
      answerTime: 0,
      score: 0,
      rank: 0,
      answerIds: []
    };
  });

  session.players.push({
    playerId: playerId,
    name: name,
    score: 0,
    submissions: submissions
  });

  // Check if the session's autoStartNum exists
  // If exists, start the session by changing it's state
  // to Question Countown with setTimeout
  if (session.autoStartNum !== 0 && session.autoStartNum === session.players.length) {
    session.timerId = setTimeout(quizSessionUpdate, 0, session.token, session.metaData.quizId, session.sessionId, ActionType.NEXT_QUESTION);
  }

  updateSessionData(session);

  return {
    playerId: playerId
  };
};

/**
 *
 * @param playerId - given playerId
 * @returns {PlayerInfoReturn}       - get the status of the session that the
 *                                     player is in
 */
export const adminPlayerInfo = (playerId: number): PlayerInfoReturn => {
  const session: QuizSession = getPlayerSession(playerId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  return {
    state: session.state,
    numQuestions: session.metaData.numQuestions,
    atQuestion: session.atQuestion
  };
};

/**
 * Get the given questionInfo of session's question that the player is in
 *
 * @param playerId          - given playerId
 * @param questionPosition  - given questionPosition
 * @returns {PlayerQuestionInfoReturn} - return the question info that is
 *                                       current or before of the given session
 */
export const adminPlayerQuestionInfo = (playerId: number,
  questionPosition: number): PlayerQuestionInfoReturn => {
  const session: QuizSession = getPlayerSession(playerId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  if (questionPosition > session.metaData.numQuestions) {
    throw HTTPError(400, 'Invalid question position within this session');
  }

  if (questionPosition !== session.atQuestion) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  if (session.state === State.LOBBY || session.state === State.QUESTION_COUNTDOWN || session.state === State.END) {
    throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
  }

  const question: Question = session.metaData.questions[questionPosition - 1];
  const answers: PlayerAnswerInfo[] = question.answers.map(item => {
    return {
      answerId: item.answerId,
      answer: item.answer,
      colour: item.colour
    };
  });

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: answers
  };
};

/**
 * Submit the answer(s) of the player by giving the position of the
 * session's current question
 *
 * @param playerId         - given playerId
 * @param questionPosition - given questionPosition
 * @param answerIds        - given player's answers of the question
 * @returns {Empty Return} - returns nothing
 */
export const adminPlayerAnswersSubmit = (playerId: number, questionPosition: number, answerIds: number[]): EmptyReturn => {
  const session: QuizSession = getPlayerSession(playerId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  if (questionPosition > session.metaData.numQuestions) {
    throw HTTPError(400, 'Invalid question position within this session');
  }

  if (session.state !== State.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (questionPosition !== session.atQuestion) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  const question = session.metaData.questions[questionPosition - 1];

  checkPlayerAnswers(question.answers, answerIds);

  const playerIndex = getPlayerIndex(session, playerId);
  session.players[playerIndex].submissions[questionPosition - 1].answerIds = answerIds;
  session.players[playerIndex].submissions[questionPosition - 1].answerTime = calculateDuration(session.timeStart);
  updateSessionData(session);

  return {};
};

/**
 *
 * @param playerId
 * @param questionPostion
 * @returns
 */
export const getPlayerQuestionResult = (playerId: number, questionPosition: number): QuestionResult => {
  const session: QuizSession = getPlayerSession(playerId);

  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  if (questionPosition > session.metaData.numQuestions) {
    throw HTTPError(400, 'Invalid question position within this session');
  }

  if (session.state !== State.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (questionPosition !== session.atQuestion) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  const question: QuestionResult = session.result[questionPosition - 1];
  return {
    ...question
  };
};

/**
 *
 * @param playerId
 * @returns
 */
export const getFinalResults = (playerId: number): Result => {
  const session: QuizSession = getPlayerSession(playerId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  if (session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const usersRankedByScore = session.players.map(item => {
    return {
      name: item.name,
      score: Math.round(item.score)
    };
  }).sort((a, b) => b.score - a.score);
  return {
    usersRankedByScore: usersRankedByScore,
    questionResults: session.result,
  };
};

/**
 *
 * @param playerId
 * @returns
 */
export const playerMessage = (playerId: number): QuizSessionMessageReturn => {
  const session: QuizSession = getPlayerSession(playerId);

  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  const allMessages = [...session.messages].reverse();

  return {
    messages: allMessages
  };
};

/**
 *
 * @param playerId
 * @param message
 * @returns
 */
export const playerChat = (playerId: number, message: string): EmptyReturn => {
  const session: QuizSession = getPlayerSession(playerId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerId');
  }

  if (message.length > 100) {
    throw HTTPError(400, 'Message needs to be less than 100 characters');
  }

  if (message.length < 1) {
    throw HTTPError(400, 'Message needs to be more than 1 character');
  }

  const playerIndex: number = getPlayerIndex(session, playerId);

  const newMessage = {
    playerId: playerId,
    playerName: session.players[playerIndex].name,
    messageBody: message,
    timeSent: getCurrentUTC()
  };

  session.messages.push(newMessage);

  updateSessionData(session);

  return {};
};
