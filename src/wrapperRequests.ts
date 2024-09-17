import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
import {
  AnswerBody,
  ActionType
} from './returnedInterfaces';
import HTTPError from 'http-errors';

/**
 *
 * @param statusCode
 * @param responseString
 * @returns
 */
export const checkStatusAndReturn = (statusCode: number, responseString: string | Buffer) => {
  const body = JSON.parse(responseString.toString());
  // try {
  //   body = JSON.parse(responseString.toString());
  // } catch (error) {
  //   body = {
  //     error: JSON.parse(responseString.toString())
  //   };
  // }
  // if ('error' in body) {
  //   throw HTTPError(statusCode, body);
  //   return { statusCode, ...body };
  // }
  if (statusCode !== 200) {
    throw HTTPError(statusCode, body);
  }
  return body;
};

// Wrapper Request functions for User functions
/**
 *
 * @param email
 * @param password
 * @param nameFirst
 * @param nameLast
 * @returns
 */
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUserDetailsV1 = (token: string) => {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminAuthLogin = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email, password } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @returns
 */
export const adminUserDetails = (token: string) => {
  const res = request('GET', SERVER_URL + '/v2/admin/user/details', { headers: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUserDetailsUpdateV1 = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email, nameFirst, nameLast } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request('PUT', SERVER_URL + '/v2/admin/user/details', { headers: { token }, json: { email, nameFirst, nameLast } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUserPasswordUpdateV1 = (token: string, oldPassword: string, newPassword: string) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword, newPassword } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) => {
  const res = request('PUT', SERVER_URL + '/v2/admin/user/password', { headers: { token }, json: { oldPassword, newPassword } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminAuthLogoutV1 = (token: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminAuthLogout = (token: string) => {
  const res = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @returns
 */

export const adminQuizThumbnail = (quizId: number, token: string, imgUrl: string) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/quiz/' + quizId + '/thumbnail', { headers: { token }, json: { quizId, imgUrl } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizViewSessions = (token: string, quizId: number) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId + '/sessions', { headers: { token }, qs: { quizId } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

// Wrapper Request functions for Quiz functions

export const adminQuizListV1 = (token: string) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizList = (token: string) => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', { headers: { token } });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizCreateV1 = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        token,
        name,
        description
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizCreate = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    {
      headers: {
        token
      },
      json: {
        name,
        description
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizRemoveV1 = (token: string, quizId: number) => {
  const res = request(
    'DELETE', SERVER_URL + `/v1/admin/quiz/${quizId}`, {
      qs: {
        token: token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE', SERVER_URL + `/v2/admin/quiz/${quizId}`, {
      headers: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizInfoV1 = (token: string, quizId: number) => {
  const res = request(
    'GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, {
      qs: {
        token: token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @returns
 */
export const adminQuizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET', SERVER_URL + `/v2/admin/quiz/${quizId}`, {
      headers: {
        token: token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizNameUpdateV1 = (token: string, quizId: number, name: string) => {
  const res = request(
    'PUT', SERVER_URL + '/v1/admin/quiz/' + quizId + '/name',
    {
      json: {
        token: token,
        name: name
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param name
 * @returns
 */
export const adminQuizNameUpdate = (token: string, quizId: number, name: string) => {
  const res = request(
    'PUT', SERVER_URL + '/v2/admin/quiz/' + quizId + '/name',
    {
      headers: {
        token: token
      },
      json: {
        name: name
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizDescriptionUpdateV1 = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/description`, {
      json: {
        token: token,
        description: description
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param description
 * @returns
 */
export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/description`, {
      headers: {
        token
      },
      json: {
        description: description
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

// Wrapper Request functions for Question functions

export const adminCreateQuestionV1 = (token: string, quizId: number, question: string, duration: number,
  points: number, answers: AnswerBody[]) => {
  const res = request(
    'POST', SERVER_URL + '/v1/admin/quiz/' + quizId + '/question',
    {
      json: {
        token: token,
        questionBody: {
          question,
          duration,
          points,
          answers
        }
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminCreateQuestion = (token: string, quizId: number, question: string, duration: number,
  points: number, answers: AnswerBody[], thumbnailUrl: string) => {
  const res = request(
    'POST', SERVER_URL + '/v2/admin/quiz/' + quizId + '/question',
    {
      headers: {
        token
      },
      json: {
        questionBody: {
          question,
          duration,
          points,
          answers,
          thumbnailUrl
        }
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUpdateQuestionV1 = (token: string, quizId: number, questionId: number, question: string,
  duration: number, points: number, answers: AnswerBody[]) => {
  const res = request(
    'PUT', SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId,
    {
      json: {
        token,
        questionBody: {
          question,
          duration,
          points,
          answers
        }
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminUpdateQuestion = (token: string, quizId: number, questionId: number, question: string,
  duration: number, points: number, answers: AnswerBody[], thumbnailUrl: string) => {
  const res = request(
    'PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: {
        token
      },
      json: {
        questionBody: {
          question,
          duration,
          points,
          answers,
          thumbnailUrl
        }
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminDeleteQuestionV1 = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId,
    {
      qs: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminDeleteQuestion = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'DELETE', SERVER_URL + '/v2/admin/quiz/' + quizId + '/question/' + questionId,
    {
      headers: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizQuestionDuplicateV1 = (quizId: number, questionId: number, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token: token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizQuestionDuplicate = (quizId: number, questionId: number, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: {
        token: token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizRestoreV1 = (quizid: number, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v1/admin/quiz/${quizid}/restore`,
    {
      json: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param quizid
 * @param token
 * @returns
 */
export const adminQuizRestore = (quizid: number, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v2/admin/quiz/${quizid}/restore`,
    {
      headers: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizTrashV1 = (token: string) => {
  const res = request(
    'GET', SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @returns
 */
export const adminQuizTrash = (token: string) => {
  const res = request(
    'GET', SERVER_URL + '/v2/admin/quiz/trash',
    {
      headers: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizQuestionMoveV1 = (quizId: number, questionid: number, token: string, newPosition: number) => {
  const res = request(
    'PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionid}/move`,
    {
      json: {
        token,
        newPosition
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizQuestionMove = (quizId: number, questionid: number, token: string, newPosition: number) => {
  const res = request(
    'PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionid}/move`,
    {
      headers: {
        token
      },
      json: {
        newPosition
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @returns
 */
export const clear = () => {
  const res = request(
    'DELETE', SERVER_URL + '/v1/clear', { qs: {} }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizTrashEmptyV1 = (token: string, trashQuizIds: number[]) => {
  const quizIds = JSON.stringify(trashQuizIds);
  const res = request(
    'DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty',
    {
      qs: {
        token,
        quizIds
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param trashQuizIds
 * @returns
 */
export const adminQuizTrashEmpty = (token: string, trashQuizIds: number[]) => {
  const quizIds = JSON.stringify(trashQuizIds);
  const res = request(
    'DELETE', SERVER_URL + '/v2/admin/quiz/trash/empty',
    {
      headers: {
        token
      },
      qs: {
        quizIds
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const adminQuizTransferV1 = (quizId: number, userEmail: string, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token,
        userEmail
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param quizId
 * @param userEmail
 * @param token
 * @returns
 */
export const adminQuizTransfer = (quizId: number, userEmail: string, token: string) => {
  const res = request(
    'POST', SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`,
    {
      headers: {
        token
      },
      json: {
        userEmail
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param autoStartNum
 * @returns
 */
export const createQuizSession = (token: string, quizId: number, autoStartNum: number) => {
  const res = request(
    'POST', SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`,
    {
      headers: {
        token
      },
      json: {
        autoStartNum
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param sessionId
 * @param action
 * @returns
 */
export const quizSessionUpdate = (token: string, quizId: number, sessionId: number, action: ActionType) => {
  const res = request(
    'PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token
      },
      json: {
        action
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param sessionId
 * @returns
 */
export const getQuizSessionInfo = (token: string, quizId: number, sessionId: number) => {
  const res = request(
    'GET', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        token
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param sessionId
 * @returns
 */
export const getQuizSessionResults = (token: string, quizId: number, sessionId: number) => {
  const res = request(
    'GET', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results`,
    {
      headers: {
        token
      },
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param token
 * @param quizId
 * @param sessionId
 * @returns
 */
export const getQuizSessionResultsCSV = (token: string, quizId: number, sessionId: number) => {
  const res = request(
    'GET', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`,
    {
      headers: {
        token
      },
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param sessionId
 * @param name
 * @returns
 */
export const createPlayerSession = (sessionId: number, name: string) => {
  const res = request(
    'POST', SERVER_URL + '/v1/player/join',
    {
      json: {
        sessionId,
        name
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @returns
 */
export const getPlayerSession = (playerId: number) => {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}`);
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @param questionPostion
 * @returns
 */
export const getPlayerQuestionInfo = (playerId: number, questionPostion: number) => {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/question/${questionPostion}`);
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @param questionPostion
 * @param answers
 * @returns
 */
export const submitPlayerAnswers = (playerId: number, questionPostion: number, answers: number[]) => {
  const answerIds = JSON.stringify(answers);
  const res = request(
    'PUT', SERVER_URL + `/v1/player/${playerId}/question/${questionPostion}/answer`,
    {
      json: {
        answerIds
      }
    }
  );
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @param questionPostion
 * @returns
 */
export const getPlayerQuestionResult = (playerId: number, questionPostion: number) => {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/question/${questionPostion}/results`);
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @returns
 */
export const getFinalResults = (playerId: number) => {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/results`);
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @returns
 */
export const playerMessage = (playerId: number) => {
  const res = request('GET', SERVER_URL + `/v1/player/${playerId}/chat`);
  return checkStatusAndReturn(res.statusCode, res.body);
};

/**
 *
 * @param playerId
 * @param message
 * @returns
 */
export const playerChat = (playerId: number, message: string) => {
  const res = request('POST', SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: {
        message: {
          messageBody: message
        }
      }

    });
  return checkStatusAndReturn(res.statusCode, res.body);
};

export const invalidUrl = () => {
  const res = request('GET', SERVER_URL + '/v1/haaaa');
  return JSON.parse(res.body.toString());
};
