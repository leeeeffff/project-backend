import HTTPError from 'http-errors';
import {
  ActionType,
  AnswerBody,
  AuthRegisterReturn,
  PlayerCreateReturn,
  QuizCreateReturn,
  QuizSessionCreateReturn,
  State,
} from '../returnedInterfaces';
import {
  adminAuthRegister,
  adminQuizList,
  adminQuizListV1,
  adminQuizCreate,
  adminQuizCreateV1,
  adminQuizRemove,
  adminQuizRemoveV1,
  adminQuizInfo,
  adminQuizInfoV1,
  adminQuizNameUpdate,
  adminQuizNameUpdateV1,
  adminQuizDescriptionUpdate,
  adminQuizDescriptionUpdateV1,
  adminQuizRestore,
  adminQuizRestoreV1,
  adminQuizTrash,
  adminQuizTrashV1,
  adminQuizTrashEmpty,
  adminQuizTrashEmptyV1,
  adminQuizTransfer,
  adminQuizTransferV1,
  quizSessionUpdate,
  clear,
  createQuizSession,
  getQuizSessionInfo,
  getQuizSessionResults,
  getQuizSessionResultsCSV,
  adminQuizThumbnail,
  adminQuizViewSessions,
  adminCreateQuestion,
  createPlayerSession,
  submitPlayerAnswers,
} from '../wrapperRequests';
import { sleepSync } from './player.test';

beforeEach(() => clear());

describe('GET /v1/admin/quiz/list', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('scott007@gmail.com', 'password12345', 'Scott', 'Kyaw');
    const user2 = adminAuthRegister('kyaw007@gmail.com', 'password12345', 'Aung Khant', 'Kyaw');
    adminQuizCreateV1(user1.token, 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.');
    adminQuizCreateV1(user1.token, 'Brain Blitz', 'Rapid-fire questions to ignite your intellect. Quick, sharp, and intense!');
    const quiz3 = adminQuizCreateV1(user2.token, 'FactDash', 'Race against time with this fast-paced trivia. How many facts can you conquer?');
    const quiz4 = adminQuizCreateV1(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
    expect(adminQuizListV1(user2.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz3.quizId,
          name: 'FactDash'
        },
        {
          quizId: quiz4.quizId,
          name: 'MindSprint'
        }
      ]
    });
  });
});

describe('GET /v2/admin/quiz/list', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;

  describe('Failure directs', () => {
    test('Invalid token', () => {
      expect(() => adminQuizList('')).toThrow(HTTPError[401]);
      expect(() => adminQuizList('9999')).toThrow(HTTPError[401]);
    });
  });

  describe('Success directs', () => {
    beforeEach(() => {
      user1 = adminAuthRegister('scott007@gmail.com', 'password12345', 'Scott', 'Kyaw');
      user2 = adminAuthRegister('kyaw007@gmail.com', 'password12345', 'Aung Khant', 'Kyaw');
    });

    test('Return empty quizList', () => {
      expect(adminQuizList(user1.token)).toStrictEqual({
        quizzes: []
      });
    });

    test('Return correct quizList', () => {
      const quiz1 = adminQuizCreate(user1.token, 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.');
      const quiz2 = adminQuizCreate(user1.token, 'Brain Blitz', 'Rapid-fire questions to ignite your intellect. Quick, sharp, and intense!');
      const quiz3 = adminQuizCreate(user2.token, 'FactDash', 'Race against time with this fast-paced trivia. How many facts can you conquer?');
      const quiz4 = adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
      expect(adminQuizList(user1.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'SnapFacts'
          },
          {
            quizId: quiz2.quizId,
            name: 'Brain Blitz'
          }
        ]
      });
      expect(adminQuizList(user2.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz3.quizId,
            name: 'FactDash'
          },
          {
            quizId: quiz4.quizId,
            name: 'MindSprint'
          }
        ]
      });
    });
  });
});

describe('POST /v1/admin/quiz', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('scott007@gmail.com', 'password12345', 'Scott', 'Kyaw');
    expect(adminQuizCreateV1(user1.token, 'Brain Blitz', 'Rapid-fire questions to ignite your intellect. Quick, sharp, and intense!')).toStrictEqual({
      quizId: expect.any(Number)
    });
  });
});

describe('POST /v2/admin/quiz', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;

  beforeEach(() => {
    user1 = adminAuthRegister('scott007@gmail.com', 'password12345', 'Scott', 'Kyaw');
    user2 = adminAuthRegister('kyaw007@gmail.com', 'password12345', 'Aung Khant', 'Kyaw');
  });

  describe('Failure directs', () => {
    test('Invalid token', () => {
      expect(() => adminQuizCreate('9999', 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.')).toThrow(HTTPError[401]);
      expect(() => adminQuizCreate('9999', 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!')).toThrow(HTTPError[401]);
    });

    test.each([
      { name: '', type: 'empty name' },
      { name: 'R4nd0m_FuN!', type: 'name with invalid characters' },
      { name: 'Cryptic*'.repeat(5), type: 'name with invalid and valid characters - length more than 30' },
      { name: '!@#$%^'.repeat(6), type: 'name with invalid characters - length more than 30' },
      { name: 'Go', type: 'name with length less than 3 characters' },
      { name: '**', type: 'name with invalid characters - length less than 3' }
    ])("invalid quiz name: '$type'", ({ name }) => {
      expect(() => adminQuizCreate(user1.token, name, '')).toThrow(HTTPError[400]);
    });

    test('Quiz name already exists created by current user', () => {
      adminQuizCreate(user1.token, 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.');
      adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
      expect(() => adminQuizCreate(user1.token, 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.')).toThrow(HTTPError[400]);
      expect(() => adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!')).toThrow(HTTPError[400]);
    });

    test('Description with length more than 100 characters', () => {
      expect(() => adminQuizCreate(user1.token, 'CurioQuest', `Embark on a knowledge odyssey that transcends limits. 
      From galaxies to molecules, explore the vast universe of trivia in this mind-expanding quiz.`)).toThrow(HTTPError[400]);
      expect(() => adminQuizCreate(user2.token, 'Speedy Smarts', `Get ready for an immersive journey through the storm of knowledge! 
      Test your expertise as you navigate the whirlwind of diverse topics in this intellectually charged quiz experience.`)).toThrow(HTTPError[400]);
    });
  });

  describe('Success directs', () => {
    test('Correct return type', () => {
      expect(adminQuizCreate(user1.token, 'Brain Blitz', 'Rapid-fire questions to ignite your intellect. Quick, sharp, and intense!')).toStrictEqual({
        quizId: expect.any(Number)
      });
      expect(adminQuizCreate(user2.token, 'FactDash', 'Race against time with this fast-paced trivia. How many facts can you conquer?')).toStrictEqual({
        quizId: expect.any(Number)
      });
    });
  });
});

describe('DELETE /v1/admin/quiz/:quizId', () => {
  test('Success Direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quiz2 = adminQuizCreateV1(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
    expect(adminQuizRemoveV1(user2.token, quiz2.quizId)).toStrictEqual({});
  });
});

describe('DELETE /v2/admin/quiz/:quizId', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;
  let quiz1: QuizCreateReturn, quiz2: QuizCreateReturn, quiz3: QuizCreateReturn, quiz4: QuizCreateReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };

  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz2 = adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminQuizRemove(fakeUser.token, quiz1.quizId)).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => adminQuizRemove(user1.token, fakeQuiz.quizId)).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizRemove(user2.token, quiz1.quizId)).toThrow(HTTPError[403]);
    });

    test('session for this quiz is not in END state', () => {
      const answer1 = [
        {
          answer: '2',
          correct: true
        },
        {
          answer: '4',
          correct: false
        },
        {
          answer: '5',
          correct: false
        },
        {
          answer: '6',
          correct: false
        },
        {
          answer: '7',
          correct: false
        },
        {
          answer: '8',
          correct: false
        },
      ];
      const thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
      adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 30, 4, answer1, thumbnailUrl1);
      createQuizSession(user1.token, quiz1.quizId, 3);
      expect(() => adminQuizRemove(user1.token, quiz1.quizId)).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('Remove quizzes from back', () => {
      expect(adminQuizRemove(user2.token, quiz2.quizId)).toStrictEqual({});
      expect(adminQuizRemove(user1.token, quiz1.quizId)).toStrictEqual({});
    });

    test('Mix removing and creating quizzes', () => {
      expect(adminQuizRemove(user1.token, quiz1.quizId)).toStrictEqual({});
      quiz3 = adminQuizCreate(user1.token, 'SnapFacts', 'Quickfire trivia challenge! Answer in a snap and prove your knowledge prowess.');
      quiz4 = adminQuizCreate(user2.token, 'Brain Blitz', 'Rapid-fire questions to ignite your intellect. Quick, sharp, and intense!');
      expect(adminQuizRemove(user1.token, quiz3.quizId)).toStrictEqual({});
      expect(adminQuizRemove(user2.token, quiz4.quizId)).toStrictEqual({});
      expect(adminQuizRemove(user2.token, quiz2.quizId)).toStrictEqual({});
    });
  });
});

describe('GET /v1/admin/quiz/:quizid', () => {
  test('Success Case', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const quiz = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    expect(adminQuizInfoV1(user1.token, quiz.quizId)).toStrictEqual({
      quizId: quiz.quizId,
      name: 'history',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [],
      description: 'A cool quiz about history',
      duration: 0,
      numQuestions: 0
    });
  });
});

describe('GET /v2/admin/quiz/:quizid', () => {
  let user1: AuthRegisterReturn, quiz: QuizCreateReturn, user2: AuthRegisterReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };
  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminQuizInfo(fakeUser.token, quiz.quizId)).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => adminQuizInfo(user1.token, fakeQuiz.quizId)).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizInfo(user2.token, quiz.quizId)).toThrow(HTTPError[403]);
    });
  });

  describe('Success cases', () => {
    test('valid return', () => {
      expect(adminQuizInfo(user1.token, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'history',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        questions: [],
        thumbnailUrl: expect.any(String),
        description: 'A cool quiz about history',
        duration: 0,
        numQuestions: 0
      });
    });
  });
});

describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  test('Success Direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quiz1 = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    const quiz2 = adminQuizCreateV1(user2.token, 'maths', 'A boring quiz about maths');
    expect(adminQuizNameUpdateV1(user1.token, quiz1.quizId, 'computers')).toStrictEqual({});
    expect(adminQuizNameUpdateV1(user2.token, quiz2.quizId, 'geography')).toStrictEqual({});
  });
});

describe('PUT /v2/admin/quiz/{quizid}/name', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;

  describe('Failure directs', () => {
    beforeEach(() => {
      user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
    });

    test('empty token or invalid user', () => {
      expect(() => adminQuizNameUpdate('', quiz1.quizId, 'science')).toThrow(HTTPError[401]);
      expect(() => adminQuizNameUpdate('', quiz2.quizId, 'science')).toThrow(HTTPError[401]);
      expect(() => adminQuizNameUpdate('abcde', quiz1.quizId, 'science')).toThrow(HTTPError[401]);
      expect(() => adminQuizNameUpdate('abcde', quiz2.quizId, 'science')).toThrow(HTTPError[401]);
    });

    test('invalid quizId', () => {
      expect(() => adminQuizNameUpdate(user1.token, quiz1.quizId + 5, 'science')).toThrow(HTTPError[403]);
      expect(() => adminQuizNameUpdate(user2.token, quiz2.quizId + 5, 'science')).toThrow(HTTPError[403]);
      expect(() => adminQuizNameUpdate(user1.token, quiz1.quizId + 5, 'science')).toThrow(HTTPError[403]);
      expect(() => adminQuizNameUpdate(user2.token, quiz2.quizId + 5, 'science')).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizNameUpdate(user2.token, quiz1.quizId, 'science')).toThrow(HTTPError[403]);
      expect(() => adminQuizNameUpdate(user1.token, quiz2.quizId, 'arts')).toThrow(HTTPError[403]);
    });

    test.each([
      { name: '', type: 'empty name' },
      { name: 'R4nd0m_FuN!', type: 'name with invalid characters' },
      { name: 'Cryptic*'.repeat(5), type: 'name with invalid and valid characters - length more than 30' },
      { name: '!@#$%^'.repeat(6), type: 'name with invalid characters - length more than 30' },
      { name: 'Go', type: 'name with length less than 3 characters' },
      { name: '**', type: 'name with invalid characters - length less than 3' }
    ])("invalid quiz name: '$type'", ({ name }) => {
      expect(() => adminQuizNameUpdate(user1.token, quiz1.quizId, name)).toThrow(HTTPError[400]);
      expect(() => adminQuizNameUpdate(user2.token, quiz2.quizId, name)).toThrow(HTTPError[400]);
    });

    test('Quiz name already exists created by current user', () => {
      adminQuizCreate(user1.token, 'maths', 'A boring quiz about maths');
      adminQuizCreate(user2.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizNameUpdate(user1.token, quiz1.quizId, 'maths')).toThrow(HTTPError[400]);
      expect(() => adminQuizNameUpdate(user2.token, quiz2.quizId, 'history')).toThrow(HTTPError[400]);
    });
  });

  describe('Success directs', () => {
    test('valid name change', () => {
      user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      expect(adminQuizNameUpdate(user1.token, quiz1.quizId, 'computers')).toStrictEqual({});
      expect(adminQuizNameUpdate(user2.token, quiz2.quizId, 'geography')).toStrictEqual({});
    });
  });
});

describe('PUT /v1/admin/quiz/{quizid}/name', () => {
  test('Success Direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quiz1 = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    const quiz2 = adminQuizCreateV1(user2.token, 'maths', 'A boring quiz about maths');
    expect(adminQuizDescriptionUpdateV1(user1.token, quiz1.quizId, 'new description!')).toStrictEqual({});
    expect(adminQuizDescriptionUpdateV1(user2.token, quiz2.quizId, '')).toStrictEqual({});
  });
});

describe('PUT /v2/admin/quiz/{quizid}/description', () => {
  let user1: AuthRegisterReturn, quiz: QuizCreateReturn, user2: AuthRegisterReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };
  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminQuizDescriptionUpdate(fakeUser.token, quiz.quizId, '')).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => adminQuizDescriptionUpdate(user1.token, fakeQuiz.quizId, '')).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizDescriptionUpdate(user2.token, quiz.quizId, '')).toThrow(HTTPError[403]);
    });

    test('description is too long', () => {
      expect(() => adminQuizDescriptionUpdate(
        user1.token,
        quiz.quizId,
        'this is a really long description that will not fit and should return an error in this function please'
      )).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('valid description update', () => {
      expect(adminQuizDescriptionUpdate(user1.token, quiz.quizId, 'new description!')).toStrictEqual({});
    });

    test('empty string description update', () => {
      expect(adminQuizDescriptionUpdate(user1.token, quiz.quizId, '')).toStrictEqual({});
    });
  });
});

describe('GET /v1/admin/quiz/trash', () => {
  test('Success Direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const quiz1 = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    adminQuizRemoveV1(user1.token, quiz1.quizId);
    expect(adminQuizTrashV1(user1.token)).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: expect.any(String)
        }
      ]
    });
  });
});

describe('GET /v2/admin/quiz/trash', () => {
  describe('Success', () => {
    test('Valid token and Quizzes in trash 1', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      expect(adminQuizTrash(user1.token)).toStrictEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String)
          }
        ]
      });
    });

    test('Valid token and Quizzes in trash 2', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizRemove(user2.token, quiz2.quizId);
      adminQuizTrash(user1.token);
      expect(adminQuizTrash(user2.token)).toStrictEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String)
          }
        ]
      });
    });
  });

  describe('Fail', () => {
    test('Invalid token', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      expect(() => adminQuizTrash('99999999')).toThrow(HTTPError[401]);
    });

    test('No quizzes in Trash', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(adminQuizTrash(user1.token)).toStrictEqual({
        quizzes: []
      });
    });

    test('No authenticated user', () => {
      const fakeUser: AuthRegisterReturn = { token: 'fakeToken' };
      expect(() => adminQuizTrash(fakeUser.token)).toThrow(HTTPError[401]);
    });

    test('Edge Case ', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizTrash('jahdsfiuho38hoiuwehf9388hfiouaboef8h39hfoiaewefo93hofiahli')).toThrow(HTTPError[401]);
    });
  });
});

describe('POST /v1/admin/quiz/{quizid}/restore', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const quiz1 = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    adminQuizRemoveV1(user1.token, quiz1.quizId);
    expect(adminQuizRestoreV1(quiz1.quizId, user1.token)).toStrictEqual({});
  });
});

describe('POST /v2/admin/quiz/{quizid}/restore', () => {
  describe('Success', () => {
    test('Valid quiz retoration 1', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      expect(adminQuizRestore(quiz1.quizId, user1.token)).toStrictEqual({});
    });

    test('Valid quiz retoration 2', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizRemove(user2.token, quiz2.quizId);
      expect(adminQuizRestore(quiz2.quizId, user2.token)).toStrictEqual({});
    });

    test('Valid quiz retoration and checks if isTrashed is false', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizRestore(quiz1.quizId, user1.token);
      expect(adminQuizInfo(user1.token, quiz1.quizId)).toStrictEqual({
        quizId: quiz1.quizId,
        name: 'history',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'A cool quiz about history',
        questions: [],
        numQuestions: 0,
        thumbnailUrl: expect.any(String),
        duration: 0
      });
    });
  });

  describe('Fail', () => {
    test('Invalid token', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      expect(() => adminQuizRestore(quiz1.quizId, '9999999999')).toThrow(HTTPError[401]);
    });

    test('Invalid quiz id', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizRemove(user2.token, quiz2.quizId);
      expect(() => adminQuizRestore(quiz1.quizId + 5, user1.token)).toThrow(HTTPError[403]);
    });

    test('Quiz not in trash', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizRestore(quiz1.quizId, user1.token)).toThrow(HTTPError[400]);
    });

    test('Invalid Quiz Ownership', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizRemove(user2.token, quiz2.quizId);
      expect(() => adminQuizRestore(quiz1.quizId, user2.token)).toThrow(HTTPError[403]);
    });

    test('token is empty', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      expect(() => adminQuizRestore(quiz1.quizId, '')).toThrow(HTTPError[401]);
    });

    test('Quiz name conflict during restoration', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      adminQuizRemove(user1.token, quiz1.quizId);
      adminQuizCreate(user1.token, 'history', 'Another quiz with the same name');
      expect(() => adminQuizRestore(quiz1.quizId, user1.token)).toThrow(HTTPError[400]);
    });
  });
});

describe('DELETE /v1/admin/quiz/trash/empty', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quizId1 = adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
    const quizId2 = adminQuizCreateV1(user2.token, 'maths', 'A boring quiz about maths');
    const quizId3 = adminQuizCreateV1(user1.token, 'maths', 'A boring quiz about maths');
    adminQuizRemoveV1(user1.token, quizId1.quizId);
    adminQuizRemoveV1(user2.token, quizId2.quizId);
    adminQuizRemoveV1(user1.token, quizId3.quizId);
    expect(adminQuizTrashEmptyV1(user1.token, [quizId1.quizId, quizId3.quizId])).toStrictEqual({});
  });
});

describe('DELETE /v2/admin/quiz/trash/empty', () => {
  describe('Success', () => {
    test('Valid multiple quizIds to trash', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quizId1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quizId2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
      const quizId3 = adminQuizCreate(user1.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quizId1.quizId);
      adminQuizRemove(user2.token, quizId2.quizId);
      adminQuizRemove(user1.token, quizId3.quizId);
      expect(adminQuizTrashEmpty(user1.token, [quizId1.quizId, quizId3.quizId])).toStrictEqual({});
    });
  });

  describe('Fail', () => {
    test('One or more of the Quiz IDs is not currently in the trash', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quizId1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      const quizId2 = adminQuizCreate(user1.token, 'maths', 'A boring quiz about maths');
      adminQuizRemove(user1.token, quizId1.quizId);
      expect(() => adminQuizTrashEmpty(user1.token, [quizId1.quizId, quizId2.quizId])).toThrow(HTTPError[400]);
    });

    test('Token is empty', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quizId = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizTrashEmpty('', [quizId])).toThrow(HTTPError[401]);
    });

    test('Token is invalid', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizTrashEmpty('invalid_token', [quiz.quizId])).toThrow(HTTPError[401]);
    });

    test('Invalid quizId', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizTrashEmpty(user1.token, [quiz.quizId + 5])).toThrow(HTTPError[403]);
    });

    test('Valid token  but one of the Quiz IDs refers to a quiz that this current user does not own', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history').quizId;
      const quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths').quizId;
      adminQuizRemove(user1.token, quiz1);
      expect(() => adminQuizTrashEmpty(user1.token, [quiz1, quiz2])).toThrow(HTTPError[403]);
    });

    test('quizId not in the trash', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history').quizId;
      const quiz2 = adminQuizCreate(user1.token, 'maths', 'A boring quiz about maths').quizId;
      adminQuizRemove(user1.token, quiz1);
      expect(() => adminQuizTrashEmpty(user1.token, [quiz2])).toThrow(HTTPError[400]);
    });
  });
});

describe('POST /v1/admin/quiz/{quizId}}/transfer', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
    adminAuthRegister('user2@example.com', 'password456', 'User', 'Two');
    const quiz = adminQuizCreateV1(user1.token, 'History Quiz', 'A quiz about history');
    expect(adminQuizTransferV1(quiz.quizId, 'user2@example.com', user1.token)).toEqual({});
  });
});

describe('POST /v2/admin/quiz/{quizId}}/transfer', () => {
  describe('Success', () => {
    test('Valid transfer of ownership', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
      adminAuthRegister('user2@example.com', 'password456', 'User', 'Two');
      const quiz = adminQuizCreate(user1.token, 'History Quiz', 'A quiz about history');
      expect(adminQuizTransfer(quiz.quizId, 'user2@example.com', user1.token)).toEqual({});
    });

    test('Valid ownership transfer with multiple users', () => {
      const currentUser = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      adminAuthRegister('target@example.com', 'targetpassword1', 'Target', 'User');
      adminAuthRegister('another@example.com', 'anotherpassword1', 'Another', 'User');
      const quiz = adminQuizCreate(currentUser.token, 'History Quiz', 'A quiz about history');
      expect(adminQuizTransfer(quiz.quizId, 'target@example.com', currentUser.token)).toEqual({});
    });
  });

  describe('Fail', () => {
    test('Token is empty', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
      const quizId = adminQuizCreate(user1.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quizId.quizId, 'user@example.com', '')).toThrow(HTTPError[401]);
    });

    test('Token is invalid', () => {
      const user = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      const quiz = adminQuizCreate(user.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quiz.quizId, 'user@example.com', 'invalidtoken')).toThrow(HTTPError[401]);
    });

    test('Invalid quizId', () => {
      const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
      const quiz = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
      expect(() => adminQuizTransfer(quiz.quizId + 5, 'user@example.com', user1.token)).toThrow(HTTPError[403]);
    });

    test('User does not own this quiz', () => {
      const currentUser = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      const user2 = adminAuthRegister('target@example.com', 'targetpassword1', 'Target', 'User');
      adminAuthRegister('another@example.com', 'anotherpassword1', 'Another', 'User');
      const quiz = adminQuizCreate(currentUser.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quiz.quizId, 'target@example.com', user2.token)).toThrow(HTTPError[403]);
    });

    test('Quiz name is used by the target user', () => {
      const currentUser = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      const user2 = adminAuthRegister('target@example.com', 'targetpassword1', 'Target', 'User');
      adminAuthRegister('another@example.com', 'anotherpassword1', 'Another', 'User');
      const quiz = adminQuizCreate(currentUser.token, 'History Quiz', 'A quiz about history');
      adminQuizCreate(user2.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quiz.quizId, 'target@example.com', currentUser.token)).toThrow(HTTPError[400]);
    });

    test('User email is the current logged-in user', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
      const quizId = adminQuizCreate(user1.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quizId.quizId, 'user1@example.com', user1.token)).toThrow(HTTPError[400]);
    });

    test('User email is not a real user', () => {
      const user = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      const quiz = adminQuizCreate(user.token, 'History Quiz', 'A quiz about history');
      expect(() => adminQuizTransfer(quiz.quizId, 'nonexistent@example.com', user.token)).toThrow(HTTPError[400]);
    });

    test('session for this quiz is not in END state', () => {
      const currentUser = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
      adminAuthRegister('target@example.com', 'targetpassword1', 'Target', 'User');
      const quiz = adminQuizCreate(currentUser.token, 'History Quiz', 'A quiz about history');
      const answer1 = [
        {
          answer: '2',
          correct: true
        },
        {
          answer: '4',
          correct: false
        },
        {
          answer: '5',
          correct: false
        },
        {
          answer: '6',
          correct: false
        },
        {
          answer: '7',
          correct: false
        },
        {
          answer: '8',
          correct: false
        },
      ];
      const thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
      adminCreateQuestion(currentUser.token, quiz.quizId, 'What is 1 + 1?', 30, 4, answer1, thumbnailUrl1);
      createQuizSession(currentUser.token, quiz.quizId, 3);
      expect(() => adminQuizTransfer(quiz.quizId, 'target@example.com', currentUser.token)).toThrow(HTTPError[400]);
    });
  });
});

describe('adminQuizThumbnail', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;
  let quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };
  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz2 = adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminQuizThumbnail(quiz1.quizId, fakeUser.token, 'https://yolo.jpg')).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => adminQuizThumbnail(fakeQuiz.quizId, user1.token, 'https://yolo.jpg')).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizThumbnail(quiz1.quizId, user2.token, 'https://yolo.jpg')).toThrow(HTTPError[403]);
    });

    test('imgUrl does not end with .jpg, .jpeg or .png', () => {
      expect(() => adminQuizThumbnail(quiz1.quizId, user1.token, 'https://yolo.hehe')).toThrow(HTTPError[400]);
    });

    test('imgUrl does not start with https:// or http://', () => {
      expect(() => adminQuizThumbnail(quiz1.quizId, user1.token, 'yolo.jpg')).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('update 1 thumbnails', () => {
      expect(adminQuizThumbnail(quiz1.quizId, user1.token, 'http://yolo.jpeg')).toStrictEqual({});
      const result = adminQuizInfo(user1.token, quiz1.quizId);
      expect(result.thumbnailUrl).toStrictEqual(expect.any(String));
    });
    test('update same quiz thumbnail multiple times', () => {
      expect(adminQuizThumbnail(quiz2.quizId, user2.token, 'http://yolo.jpeg')).toStrictEqual({});
      expect(adminQuizThumbnail(quiz2.quizId, user2.token, 'http://unluggers.jpg')).toStrictEqual({});
      expect(adminQuizThumbnail(quiz2.quizId, user2.token, 'https://finalURL.png')).toStrictEqual({});
      const result = adminQuizInfo(user2.token, quiz2.quizId);
      expect(result.thumbnailUrl).toStrictEqual(expect.any(String));
    });
  });
});

describe('adminQuizViewSessions', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;
  let quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };
  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz2 = adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminQuizViewSessions(fakeUser.token, quiz1.quizId)).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => adminQuizViewSessions(user1.token, fakeQuiz.quizId)).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminQuizViewSessions(user1.token, quiz2.quizId)).toThrow(HTTPError[403]);
    });
  });
  /// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('Success cases', () => {
    test('View all sessions for current quiz', () => {
      expect(adminQuizViewSessions(user1.token, quiz1.quizId)).toStrictEqual(expect.any(Object));
    });

    test('Successful viewSession after adding a session', () => {
      adminCreateQuestion(user2.token, quiz2.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');
      createQuizSession(user2.token, quiz2.quizId, 1);
      const session = createQuizSession(user2.token, quiz2.quizId, 1).sessionId;
      quizSessionUpdate(user2.token, quiz2.quizId, session, ActionType.END);
      expect(adminQuizViewSessions(user2.token, quiz2.quizId)).toStrictEqual(expect.any(Object));
    });
  });
});

describe('adminQuizStartNewSession', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;
  let quiz1: QuizCreateReturn;
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 2029384 };
  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    adminQuizCreate(user2.token, 'MindSprint', 'A swift dash through diverse knowledge realms. Your mind\'s ultimate sprint test!');
  });

  describe('Error cases', () => {
    test('invalid user', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');
      expect(() => createQuizSession(fakeUser.token, quiz1.quizId, 3)).toThrow(HTTPError[401]);
    });

    test('invalid quiz', () => {
      expect(() => createQuizSession(user1.token, fakeQuiz.quizId, 3)).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');
      expect(() => createQuizSession(user2.token, quiz1.quizId, 3)).toThrow(HTTPError[403]);
    });

    test('autoStartNum > 50', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');
      expect(() => createQuizSession(user1.token, quiz1.quizId, 51)).toThrow(HTTPError[400]);
    });

    test('A maximum of 10 sessions that are not in END state currently exist for this quiz', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');
      createQuizSession(user1.token, quiz1.quizId, 1);
      createQuizSession(user1.token, quiz1.quizId, 2);
      createQuizSession(user1.token, quiz1.quizId, 3);
      createQuizSession(user1.token, quiz1.quizId, 4);
      createQuizSession(user1.token, quiz1.quizId, 5);
      createQuizSession(user1.token, quiz1.quizId, 6);
      createQuizSession(user1.token, quiz1.quizId, 7);
      createQuizSession(user1.token, quiz1.quizId, 8);
      createQuizSession(user1.token, quiz1.quizId, 9);
      createQuizSession(user1.token, quiz1.quizId, 10);
      expect(() => createQuizSession(user1.token, quiz1.quizId, 11)).toThrow(HTTPError[400]);
    });

    test('quiz is trashed', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');

      adminQuizRemove(user1.token, quiz1.quizId);
      expect(() => createQuizSession(user1.token, quiz1.quizId, 1)).toThrow(HTTPError[400]);
    });

    test('quiz has no questions', () => {
      expect(() => createQuizSession(user1.token, quiz1.quizId, 1)).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('Single session start', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');

      expect(createQuizSession(user1.token, quiz1.quizId, 1)).toStrictEqual({ sessionId: expect.any(Number) });
    });

    test('Multiple session start', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'whats 9+10', 3, 10,
        [{ answer: 'yea', correct: true }, { answer: 'nah', correct: false }],
        'https://yolo.png');

      expect(createQuizSession(user1.token, quiz1.quizId, 1)).toStrictEqual({ sessionId: expect.any(Number) });
      expect(createQuizSession(user1.token, quiz1.quizId, 2)).toStrictEqual({ sessionId: expect.any(Number) });
      expect(createQuizSession(user1.token, quiz1.quizId, 3)).toStrictEqual({ sessionId: expect.any(Number) });
    });
  });
});

describe('PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz: QuizCreateReturn, session: QuizSessionCreateReturn, answer: AnswerBody[], thumbnailUrl: string;
  beforeEach(() => {
    user1 = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
    user2 = adminAuthRegister('random@example.com', 'randompassword1', 'Random', 'Dude');
    quiz = adminQuizCreate(user1.token, 'Math Quiz', 'A cool math quiz');
    answer = [
      {
        answer: '2',
        correct: true
      },
      {
        answer: '4',
        correct: false
      },
      {
        answer: '5',
        correct: false
      },
      {
        answer: '6',
        correct: false
      },
      {
        answer: '7',
        correct: false
      },
      {
        answer: '8',
        correct: false
      },
    ];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    adminCreateQuestion(user1.token, quiz.quizId, 'How much?', 5, 2, answer, thumbnailUrl);
    session = createQuizSession(user1.token, quiz.quizId, 3);
  });

  describe('error cases', () => {
    test('session id invalid', () => {
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, 29291, ActionType.NEXT_QUESTION)).toThrow(HTTPError[400]);
    });

    // Do we actually need this test?, typescript prevents this
    // test('action is not a valid action enum', () => {
    //   expect(quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.)).toThrow(HTTPError[400]);
    // });

    test('action cannot be applied in Lobby state', () => {
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in QuestionCountdown state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in QuestionOpen state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in AnswerShow state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_ANSWER);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_ANSWER)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in QuestionClose state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      sleepSync(6 * 1000);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in FinalResults state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION)).toThrow(HTTPError[400]);
    });

    test('action cannot be applied in END state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.END);
      expect(() => quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS)).toThrow(HTTPError[400]);
    });

    test('token is empty', () => {
      expect(() => quizSessionUpdate('', quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION)).toThrow(HTTPError[401]);
    });

    test('token is invalid', () => {
      expect(() => quizSessionUpdate('this is a fake token', quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION)).toThrow(HTTPError[401]);
    });

    test('valid token, but user is not an owner of the quiz', () => {
      expect(() => quizSessionUpdate(user2.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION)).toThrow(HTTPError[403]);
    });
  });

  describe('success cases', () => {
    test('test NEXT_QUESTION State', () => {
      expect(quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION)).toStrictEqual({});
    });
    test('test QUESTION_CLOSE state', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      sleepSync(6 * 1000);
      expect(quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.END)).toStrictEqual({});
    });
    test('test END state', () => {
      expect(quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.END)).toStrictEqual({});
    });
    test('question countdown success', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
      sleepSync(6 * 1000);
      expect(getQuizSessionInfo(user1.token, quiz.quizId, session.sessionId).state).toStrictEqual(State.QUESTION_CLOSE);
    });
  });
});

describe('GET /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz: QuizCreateReturn, session: QuizSessionCreateReturn, answer: AnswerBody[], thumbnailUrl: string;
  beforeEach(() => {
    user1 = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
    user2 = adminAuthRegister('random@example.com', 'randompassword1', 'Random', 'Dude');
    quiz = adminQuizCreate(user1.token, 'Math Quiz', 'A cool math quiz');
    answer = [
      {
        answer: '2',
        correct: true
      },
      {
        answer: '4',
        correct: false
      },
      {
        answer: '5',
        correct: false
      },
      {
        answer: '6',
        correct: false
      },
      {
        answer: '7',
        correct: false
      },
      {
        answer: '8',
        correct: false
      },
    ];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    adminCreateQuestion(user1.token, quiz.quizId, 'How much?', 5, 2, answer, thumbnailUrl);
    session = createQuizSession(user1.token, quiz.quizId, 3);
    createPlayerSession(session.sessionId, 'Scott');
    createPlayerSession(session.sessionId, '');
  });

  describe('error cases', () => {
    test('session id invalid', () => {
      expect(() => getQuizSessionInfo(user1.token, quiz.quizId, 29291)).toThrow(HTTPError[400]);
    });

    test('token is empty', () => {
      expect(() => getQuizSessionInfo('', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('token is invalid', () => {
      expect(() => getQuizSessionInfo('this is a fake token', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('valid token, but user is not an owner of the quiz', () => {
      expect(() => getQuizSessionInfo(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
    });
  });

  describe('success cases', () => {
    test('correct return type', () => {
      expect(getQuizSessionInfo(user1.token, quiz.quizId, session.sessionId)).toStrictEqual(
        {
          state: State.LOBBY,
          atQuestion: expect.any(Number),
          players: ['Scott', expect.any(String)],
          metadata: {
            quizId: quiz.quizId,
            name: expect.any(String),
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: expect.any(String),
            numQuestions: expect.any(Number),
            questions: [
              {
                questionId: expect.any(Number),
                question: expect.any(String),
                duration: expect.any(Number),
                thumbnailUrl: expect.any(String),
                points: expect.any(Number),
                answers: [
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  },
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  },
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  },
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  },
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  },
                  {
                    answerId: expect.any(Number),
                    answer: expect.any(String),
                    colour: expect.any(String),
                    correct: expect.any(Boolean)
                  }
                ]
              }
            ],
            duration: expect.any(Number),
            thumbnailUrl: expect.any(String)
          }
        }
      );
    });
  });
});

describe('GET /v1/admin/quiz/:quizid/session/:sessionid/results', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz: QuizCreateReturn, session: QuizSessionCreateReturn, answer: AnswerBody[], thumbnailUrl: string,
    correctAnswer:number, player: PlayerCreateReturn;
  beforeEach(() => {
    user1 = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
    user2 = adminAuthRegister('random@example.com', 'randompassword1', 'Random', 'Dude');
    quiz = adminQuizCreate(user1.token, 'Math Quiz', 'A cool math quiz');
    answer = [
      {
        answer: '2',
        correct: true
      },
      {
        answer: '4',
        correct: false
      },
      {
        answer: '5',
        correct: false
      },
      {
        answer: '6',
        correct: false
      },
      {
        answer: '7',
        correct: false
      },
      {
        answer: '8',
        correct: false
      },
    ];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    adminCreateQuestion(user1.token, quiz.quizId, 'How much?', 5, 2, answer, thumbnailUrl);
    session = createQuizSession(user1.token, quiz.quizId, 3);
    correctAnswer = adminQuizInfo(user1.token, quiz.quizId).questions[0].answers[0].answerId;
    player = createPlayerSession(session.sessionId, 'player1');
    createPlayerSession(session.sessionId, 'zplayer');
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
    submitPlayerAnswers(player.playerId, 1, [correctAnswer]);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_ANSWER);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS);
  });

  describe('error cases', () => {
    test('session id invalid', () => {
      expect(() => getQuizSessionResults(user1.token, quiz.quizId, 29291)).toThrow(HTTPError[400]);
    });

    test('session is not in final results stage', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.END);
      expect(() => getQuizSessionResults(user1.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[400]);
    });

    test('token is empty', () => {
      expect(() => getQuizSessionResults('', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('token is invalid', () => {
      expect(() => getQuizSessionResults('this is a fake token', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('valid token, but user is not an owner of the quiz', () => {
      expect(() => getQuizSessionResults(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
    });
  });

  describe('success cases', () => {
    test('correct return type', () => {
      expect(getQuizSessionResults(user1.token, quiz.quizId, session.sessionId)).toStrictEqual(
        {
          usersRankedByScore: [
            {
              name: expect.any(String),
              score: expect.any(Number),
            },
            {
              name: expect.any(String),
              score: expect.any(Number),
            }
          ],
          questionResults: [
            {
              questionId: expect.any(Number),
              playersCorrectList: [
                expect.any(String)
              ],
              averageAnswerTime: expect.any(Number),
              percentCorrect: expect.any(Number)
            }
          ]
        }
      );
    });
  });
});

describe('GET /v1/admin/quiz/:quizid/session/:sessionid/results/csv', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz: QuizCreateReturn, session: QuizSessionCreateReturn, answer: AnswerBody[], thumbnailUrl: string;
  beforeEach(() => {
    user1 = adminAuthRegister('admin@example.com', 'adminpassword1', 'Admin', 'User');
    user2 = adminAuthRegister('random@example.com', 'randompassword1', 'Random', 'Dude');
    quiz = adminQuizCreate(user1.token, 'Math Quiz', 'A cool math quiz');
    answer = [
      {
        answer: '2',
        correct: true
      },
      {
        answer: '4',
        correct: false
      },
      {
        answer: '5',
        correct: false
      },
      {
        answer: '6',
        correct: false
      },
      {
        answer: '7',
        correct: false
      },
      {
        answer: '8',
        correct: false
      },
    ];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    adminCreateQuestion(user1.token, quiz.quizId, 'How much?', 5, 2, answer, thumbnailUrl);
    session = createQuizSession(user1.token, quiz.quizId, 3);
    createPlayerSession(session.sessionId, 'zplayer');
    createPlayerSession(session.sessionId, 'playerone');
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.NEXT_QUESTION);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.SKIP_COUNTDOWN);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_ANSWER);
    quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.GO_TO_FINAL_RESULTS);
  });

  describe('error cases', () => {
    test('session id invalid', () => {
      expect(() => getQuizSessionResultsCSV(user1.token, quiz.quizId, 29291)).toThrow(HTTPError[400]);
    });

    test('session is not in final results stage', () => {
      quizSessionUpdate(user1.token, quiz.quizId, session.sessionId, ActionType.END);
      expect(() => getQuizSessionResultsCSV(user1.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[400]);
    });

    test('token is empty', () => {
      expect(() => getQuizSessionResultsCSV('', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('token is invalid', () => {
      expect(() => getQuizSessionResultsCSV('this is a fake token', quiz.quizId, session.sessionId)).toThrow(HTTPError[401]);
    });

    test('valid token, but user is not an owner of the quiz', () => {
      expect(() => getQuizSessionResultsCSV(user2.token, quiz.quizId, session.sessionId)).toThrow(HTTPError[403]);
    });
  });

  describe('success cases', () => {
    test('correct return type', () => {
      expect(getQuizSessionResultsCSV(user1.token, quiz.quizId, session.sessionId)).toStrictEqual(
        {
          url: expect.any(String)
        }
      );
    });
  });
});
