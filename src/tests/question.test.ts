import HTTPError from 'http-errors';
import {
  Question,
  AuthRegisterReturn,
  QuizCreateReturn,
  AnswerBody,
  QuestionCreateReturn,
} from '../returnedInterfaces';
import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizCreateV1,
  adminCreateQuestion,
  adminCreateQuestionV1,
  adminQuizInfoV1,
  adminUpdateQuestion,
  adminUpdateQuestionV1,
  adminDeleteQuestion,
  adminDeleteQuestionV1,
  adminQuizQuestionDuplicate,
  adminQuizQuestionDuplicateV1,
  adminQuizQuestionMove,
  adminQuizQuestionMoveV1,
  createQuizSession,
  invalidUrl,
  clear
} from '../wrapperRequests';

beforeEach(() => clear());

// Test cases for adminCreateQuestion Function
describe('POST /v1/admin/quiz/{quizid}/question', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quiz1 = adminQuizCreateV1(user1.token, 'maths', 'A boring quiz about maths');
    const quiz2 = adminQuizCreateV1(user2.token, 'history', 'A cool quiz about history');
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
    const answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    expect(adminCreateQuestionV1(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1)).toStrictEqual({
      questionId: expect.any(Number)
    });
    expect(adminCreateQuestionV1(user2.token, quiz2.quizId, 'What is 1 + 1?', 4, 4, answer2)).toStrictEqual({
      questionId: expect.any(Number)
    });
    expect(adminQuizInfoV1(user1.token, quiz1.quizId)).toStrictEqual({
      quizId: quiz1.quizId,
      name: 'maths',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [
        {
          questionId: expect.any(Number),
          question: 'What is 1 + 1?',
          duration: 4,
          points: 4,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        }
      ],
      description: 'A boring quiz about maths',
      duration: 4,
      numQuestions: 1
    });
  });
});

describe('POST /v2/admin/quiz/{quizid}/question', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;
  let answer1: AnswerBody[], answer2: AnswerBody[], thumbnailUrl1: string, thumbnailUrl2: string;

  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
    answer1 = [
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
    answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
    thumbnailUrl2 = 'https://google.com/some/image/path.png';
  });

  describe('Failure directs', () => {
    test('empty token or invalid user', () => {
      expect(() => adminCreateQuestion('', quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[401]);
      expect(() => adminCreateQuestion('', quiz2.quizId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[401]);
      expect(() => adminCreateQuestion('abcde', quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[401]);
      expect(() => adminCreateQuestion('abcde', quiz2.quizId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[401]);
    });

    test('invalid quizId', () => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId + 5, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[403]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId + 5, 'Which treaty officially ended World War I?', 4, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[403]);
    });

    test('user does not own quiz', () => {
      expect(() => adminCreateQuestion(user2.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[403]);
      expect(() => adminCreateQuestion(user1.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[403]);
    });

    test.each([
      { question: '', type: 'empty question' },
      { question: 'ques', type: 'question length less than 4' },
      { question: 'questionName'.repeat(5), type: 'question length more than 50' },
    ])("invalid question string: '$type'", ({ question }) => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, question, 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, question, 4, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('question\'s answers - more than 6 or less than 2', () => {
      answer1.push({
        answer: '9',
        correct: false
      });
      answer2.push({
        answer: 'Treaty of Lausanne',
        correct: false
      });
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
      answer1.splice(1, 6);
      answer2.splice(1, 6);
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('duration is not positive number', () => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', -4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', -9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Sum of question durations in quiz exceeds 3 minutes', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 100, 4, answer1, thumbnailUrl1);
      adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 90, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Points less than 1 or greater than 10', () => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, -4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 15, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Answer length shorter than 1 or longer than 30 characters', () => {
      answer1[answer1.length - 1] = {
        answer: '',
        correct: false
      };
      answer2[answer2.length - 1] = {
        answer: '',
        correct: false
      };
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);

      answer1[answer1.length - 1] = {
        answer: 'answer1'.repeat(5),
        correct: false
      };
      answer2[answer2.length - 1] = {
        answer: 'answer2'.repeat(5),
        correct: false
      };
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Duplicate answers', () => {
      answer1[answer1.length - 1] = answer1[answer1.length - 2];
      answer2[answer2.length - 1] = answer2[answer2.length - 2];
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('No correct answers', () => {
      answer1.splice(0, 1);
      answer2.splice(0, 1);
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test.each([
      { thumbnailUrl: '', type: 'empty thumbnailUrl' },
      { thumbnailUrl: 'https://google.com/some/image/path.JPG', type: 'thumbnailUrl does not end with filetypes(jpg,jpge or png) - caseSensitive' },
      { thumbnailUrl: 'http://google.com/some/image/path.ts', type: 'thumbnailUrl does not end with filetypes(jpg,jpge or png)' },
      { thumbnailUrl: 'www.google.com/some/image/path.jpg', type: 'thumbnailUrl does not begin with "http://" or "https://"' },
    ])("invalid thumbnailUrl string: '$type'", ({ thumbnailUrl }) => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 4, 4, answer2, thumbnailUrl)).toThrow(HTTPError[400]);
    });
  });

  describe('Success directs', () => {
    test('Correct return type', () => {
      expect(adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toStrictEqual({
        questionId: expect.any(Number)
      });
      expect(adminCreateQuestion(user2.token, quiz2.quizId, 'What is 1 + 1?', 4, 4, answer2, thumbnailUrl2)).toStrictEqual({
        questionId: expect.any(Number)
      });
    });
  });
});

// Test cases for adminCreateQuestion Function
describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const quiz1 = adminQuizCreateV1(user1.token, 'maths', 'A boring quiz about maths');
    adminQuizCreateV1(user1.token, 'history', 'A cool quiz about history');
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
    const answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    const question1 = adminCreateQuestionV1(user1.token, quiz1.quizId, 'What is 1 + 1?', 100, 4, answer1);
    const question2 = adminCreateQuestionV1(user1.token, quiz1.quizId, 'Which treaty officially ended World War I?', 70, 4, answer2);
    expect(adminQuizInfoV1(user1.token, quiz1.quizId)).toStrictEqual({
      quizId: quiz1.quizId,
      name: 'maths',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [
        {
          questionId: question1.questionId,
          question: 'What is 1 + 1?',
          duration: 100,
          points: 4,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        },
        {
          questionId: question2.questionId,
          question: 'Which treaty officially ended World War I?',
          duration: 70,
          points: 4,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Versailles',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Trianon',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Brest-Litovsk',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Saint',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Neuilly',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Sevres',
              correct: false
            },
          ]
        }
      ],
      description: 'A boring quiz about maths',
      duration: 170,
      numQuestions: 2
    });
    expect(adminUpdateQuestionV1(user1.token, quiz1.quizId, question1.questionId, 'Which treaty officially ended World War I?', 50, 9, answer2)).toStrictEqual({});
    expect(adminUpdateQuestionV1(user1.token, quiz1.quizId, question2.questionId, 'What is 1 + 1?', 90, 3, answer1)).toStrictEqual({});
    expect(adminQuizInfoV1(user1.token, quiz1.quizId)).toStrictEqual({
      quizId: quiz1.quizId,
      name: 'maths',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [
        {
          questionId: question1.questionId,
          question: 'Which treaty officially ended World War I?',
          duration: 50,
          points: 9,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Versailles',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Trianon',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Brest-Litovsk',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Saint',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Neuilly',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Treaty of Sevres',
              correct: false
            },
          ]
        },
        {
          questionId: question2.questionId,
          question: 'What is 1 + 1?',
          duration: 90,
          points: 3,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        },
      ],
      description: 'A boring quiz about maths',
      duration: 140,
      numQuestions: 2
    });
  });
});

// Test cases for adminUpdateQuestion Function
describe('PUT /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let question1: QuestionCreateReturn, question2: QuestionCreateReturn, thumbnailUrl1: string, thumbnailUrl2: string;

  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
    answer1 = [
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
    answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
    thumbnailUrl2 = 'https://google.com/some/image/path.png';
    question1 = adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 30, 4, answer1, thumbnailUrl1);
    question2 = adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);
  });

  describe('Failure directs', () => {
    test('empty token or invalid user', () => {
      expect(() => adminUpdateQuestion('', quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[401]);
      expect(() => adminUpdateQuestion('', quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[401]);
      expect(() => adminUpdateQuestion('abcde', quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[401]);
      expect(() => adminUpdateQuestion('abcde', quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[401]);
    });

    test('invalid quizId', () => {
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId + 5, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[403]);
      expect(() => adminUpdateQuestion(user2.token, quiz1.quizId + 5, question2.questionId, 'Which treaty officially ended World War I?', 4, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[403]);
    });

    test('invalid questionId', () => {
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId + 5, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId + 5, 'Which treaty officially ended World War I?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
    });

    test('user does not own quiz', () => {
      expect(() => adminUpdateQuestion(user2.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[403]);
      expect(() => adminUpdateQuestion(user1.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[403]);
    });

    test.each([
      { question: '', type: 'empty question' },
      { question: 'ques', type: 'question length less than 4' },
      { question: 'questionName'.repeat(5), type: 'question length more than 50' },
    ])("invalid question string: '$type'", ({ question }) => {
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, question, 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, question, 4, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('question\'s answers - more than 6 or less than 2', () => {
      answer1.push({
        answer: '9',
        correct: false
      });
      answer2.push({
        answer: 'Treaty of Lausanne',
        correct: false
      });
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
      answer1.splice(1, 6);
      answer2.splice(1, 6);
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('duration is not positive number', () => {
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', -4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', -9, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Sum of question durations in quiz exceeds 3 minutes', () => {
      adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 100, 4, answer1, thumbnailUrl1);
      adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 80, 4, answer2, thumbnailUrl2);
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 110, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 170, 4, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Points less than 1 or greater than 10', () => {
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, -4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 15, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Answer length shorter than 1 or longer than 30 characters', () => {
      answer1[answer1.length - 1] = {
        answer: '',
        correct: false
      };
      answer2[answer2.length - 1] = {
        answer: '',
        correct: false
      };
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);

      answer1[answer1.length - 1] = {
        answer: 'answer1'.repeat(5),
        correct: false
      };
      answer2[answer2.length - 1] = {
        answer: 'answer2'.repeat(5),
        correct: false
      };
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('Duplicate answers', () => {
      answer1[answer1.length - 1] = answer1[answer1.length - 2];
      answer2[answer2.length - 1] = answer2[answer2.length - 2];
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test('No correct answers', () => {
      answer1.splice(0, 1);
      answer2.splice(0, 1);
      expect(() => adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1)).toThrow(HTTPError[400]);
      expect(() => adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 9, 5, answer2, thumbnailUrl2)).toThrow(HTTPError[400]);
    });

    test.each([
      { thumbnailUrl: '', type: 'empty thumbnailUrl' },
      { thumbnailUrl: 'https://google.com/some/image/path.JPG', type: 'thumbnailUrl does not end with filetypes(jpg,jpge or png) - caseSensitive' },
      { thumbnailUrl: 'http://google.com/some/image/path.ts', type: 'thumbnailUrl does not end with filetypes(jpg,jpge or png)' },
      { thumbnailUrl: 'www.google.com/some/image/path.jpg', type: 'thumbnailUrl does not begin with "http://" or "https://"' },
    ])("invalid thumbnailUrl string: '$type'", ({ thumbnailUrl }) => {
      expect(() => adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl)).toThrow(HTTPError[400]);
      expect(() => adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 4, 4, answer2, thumbnailUrl)).toThrow(HTTPError[400]);
    });
  });

  describe('Success directs', () => {
    test('Correct return type', () => {
      expect(adminUpdateQuestion(user1.token, quiz1.quizId, question1.questionId, 'What is 2 + 1?', 30, 9, answer1, thumbnailUrl1)).toStrictEqual({});
      expect(adminUpdateQuestion(user2.token, quiz2.quizId, question2.questionId, 'Which treaty officially ended World War I?', 50, 3, answer2, thumbnailUrl2)).toStrictEqual({});
    });
  });
});

// Test cases for adminDeleteQuestion
describe('DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    const quiz1 = adminQuizCreateV1(user1.token, 'maths', 'A boring quiz about maths');
    const quiz2 = adminQuizCreateV1(user2.token, 'history', 'A cool quiz about history');
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
    const answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    const question1 = adminCreateQuestionV1(user1.token, quiz1.quizId, 'What is 1 + 1?', 4, 4, answer1);
    const question2 = adminCreateQuestionV1(user2.token, quiz2.quizId, 'What is 1 + 1?', 4, 4, answer2);
    expect(adminQuizInfoV1(user1.token, quiz1.quizId)).toStrictEqual({
      quizId: quiz1.quizId,
      name: 'maths',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [
        {
          questionId: expect.any(Number),
          question: 'What is 1 + 1?',
          duration: 4,
          points: 4,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        }
      ],
      description: 'A boring quiz about maths',
      duration: 4,
      numQuestions: 1
    });
    expect(adminDeleteQuestionV1(user1.token, quiz1.quizId, question1.questionId)).toStrictEqual({});
    expect(adminDeleteQuestionV1(user2.token, quiz2.quizId, question2.questionId)).toStrictEqual({});
  });
});

describe('DELETE /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn, quiz1: QuizCreateReturn, quiz2: QuizCreateReturn;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let question1: QuestionCreateReturn, question2: QuestionCreateReturn, thumbnailUrl1: string, thumbnailUrl2: string;

  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    quiz2 = adminQuizCreate(user2.token, 'maths', 'A boring quiz about maths');
    answer1 = [
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
    answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
    thumbnailUrl2 = 'https://google.com/some/image/path.png';
    question1 = adminCreateQuestion(user1.token, quiz1.quizId, 'What is 1 + 1?', 30, 4, answer1, thumbnailUrl1);
    question2 = adminCreateQuestion(user2.token, quiz2.quizId, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);
  });

  describe('Failure directs', () => {
    test('empty token or invalid user', () => {
      expect(() => adminDeleteQuestion('', quiz1.quizId, question1.questionId)).toThrow(HTTPError[401]);
      expect(() => adminDeleteQuestion('', quiz2.quizId, question2.questionId)).toThrow(HTTPError[401]);
      expect(() => adminDeleteQuestion('abcde', quiz1.quizId, question1.questionId)).toThrow(HTTPError[401]);
      expect(() => adminDeleteQuestion('abcde', quiz2.quizId, question2.questionId)).toThrow(HTTPError[401]);
    });

    test('invalid quizId', () => {
      expect(() => adminDeleteQuestion(user1.token, quiz1.quizId + 5, question1.questionId)).toThrow(HTTPError[403]);
      expect(() => adminDeleteQuestion(user2.token, quiz1.quizId + 5, question2.questionId)).toThrow(HTTPError[403]);
    });

    test('invalid questionId', () => {
      expect(() => adminDeleteQuestion(user1.token, quiz1.quizId, question1.questionId + 5)).toThrow(HTTPError[400]);
      expect(() => adminDeleteQuestion(user2.token, quiz2.quizId, question2.questionId + 5)).toThrow(HTTPError[400]);
    });

    test('user does not own quiz', () => {
      expect(() => adminDeleteQuestion(user2.token, quiz1.quizId, question1.questionId)).toThrow(HTTPError[403]);
      expect(() => adminDeleteQuestion(user1.token, quiz2.quizId, question2.questionId)).toThrow(HTTPError[403]);
    });

    test('session for this quiz is not in END state', () => {
      createQuizSession(user1.token, quiz1.quizId, 3);
      expect(() => adminDeleteQuestion(user1.token, quiz1.quizId, question1.questionId)).toThrow(HTTPError[400]);
    });
  });

  describe('Success directs', () => {
    test('Correct return type', () => {
      expect(adminDeleteQuestion(user1.token, quiz1.quizId, question1.questionId)).toStrictEqual({});
      expect(adminDeleteQuestion(user2.token, quiz2.quizId, question2.questionId)).toStrictEqual({});
    });
  });
});
describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  test('Success direct', () => {
    const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
    const quiz1 = adminQuizCreateV1(user.token, 'Quiz 1', 'Description for Quiz 1');
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
    const answer2 = [
      {
        answer: 'Treaty of Versailles',
        correct: true
      },
      {
        answer: 'Treaty of Trianon',
        correct: false
      },
      {
        answer: 'Treaty of Brest-Litovsk',
        correct: false
      },
      {
        answer: 'Treaty of Saint',
        correct: false
      },
      {
        answer: 'Treaty of Neuilly',
        correct: false
      },
      {
        answer: 'Treaty of Sevres',
        correct: false
      }
    ];
    const questions: Question[] = [];
    questions.push(adminCreateQuestionV1(user.token, quiz1.quizId, 'cool question', 30, 5, answer1));
    questions.push(adminCreateQuestionV1(user.token, quiz1.quizId, 'another cool question', 30, 5, answer2));
    const newPosition = 1;
    expect(adminQuizQuestionMoveV1(quiz1.quizId, questions[0].questionId, user.token, newPosition)).toEqual({});
  });
});

describe('PUT /v2/admin/quiz/{quizid}/question/{questionid}/move', () => {
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
  const answer2 = [
    {
      answer: 'Treaty of Versailles',
      correct: true
    },
    {
      answer: 'Treaty of Trianon',
      correct: false
    },
    {
      answer: 'Treaty of Brest-Litovsk',
      correct: false
    },
    {
      answer: 'Treaty of Saint',
      correct: false
    },
    {
      answer: 'Treaty of Neuilly',
      correct: false
    },
    {
      answer: 'Treaty of Sevres',
      correct: false
    }
  ];
  const answer3 = [
    {
      answer: 'A',
      correct: true
    },
    {
      answer: 'B',
      correct: false
    },
    {
      answer: 'C',
      correct: false
    },
    {
      answer: 'D',
      correct: false
    },
    {
      answer: 'E',
      correct: false
    },
    {
      answer: 'F',
      correct: false
    }
  ];
  const thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
  const thumbnailUrl2 = 'http://google.com/some/image/path.jpeg';
  const thumbnailUrl3 = 'http://google.com/some/image/path.png';

  describe('Success', () => {
    test('Valid scenario: Question moved successfully', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz1 = adminQuizCreate(user.token, 'Quiz 1', 'Description for Quiz 1');
      const questions: Question[] = [];
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1));
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'another cool question', 30, 5, answer2, thumbnailUrl2));
      const newPosition = 1;
      expect(adminQuizQuestionMove(quiz1.quizId, questions[0].questionId, user.token, newPosition)).toEqual({});
    });

    test('Valid scenario: Moving question to the last position', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz1 = adminQuizCreate(user.token, 'Quiz 1', 'Description for Quiz 1');
      const questions = [];
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1));
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'another cool question', 30, 5, answer2, thumbnailUrl2));
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'alphabet question', 30, 5, answer3, thumbnailUrl3));
      expect(adminQuizQuestionMove(quiz1.quizId, questions[0].questionId, user.token, questions.length - 1)).toEqual({});
    });

    test('Valid scenario: Moving question from last position to the first position', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const userToken = user.token;
      const quiz1 = adminQuizCreate(userToken, 'Quiz 1', 'Description for Quiz 1');
      const questions = [];
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1));
      questions.push(adminCreateQuestion(user.token, quiz1.quizId, 'another cool question', 30, 5, answer2, thumbnailUrl2));
      expect(adminQuizQuestionMove(quiz1.quizId, questions[questions.length - 1].questionId, userToken, 0)).toEqual({});
    });
  });

  describe('Fail', () => {
    test('QuestionId is invalid', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz1 = adminQuizCreate(user.token, 'Quiz 1', 'Description for Quiz 1');
      adminCreateQuestion(user.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      const fakeQuestion = { questionId: 4383298 };
      expect(() => adminQuizQuestionMove(quiz1.quizId, fakeQuestion.questionId, user.token, 1)).toThrow(HTTPError[400]);
    });

    test('Token is empty', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'John', 'Doe');
      const quiz1 = adminQuizCreate(user1.token, 'Quiz 1', 'Description for Quiz 1');
      adminQuizCreate(user1.token, 'Quiz 2', 'Description for Quiz 2');
      adminQuizCreate(user1.token, 'Quiz 3', 'Description for Quiz 3');
      const question = adminCreateQuestion(user1.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      expect(() => adminQuizQuestionMove(quiz1.quizId, question.questionId, '', 1)).toThrow(HTTPError[401]);
    });

    test('Token is invalid', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'John', 'Doe');
      const quiz1 = adminQuizCreate(user1.token, 'Quiz 1', 'Description for Quiz 1');
      adminQuizCreate(user1.token, 'Quiz 2', 'Description for Quiz 2');
      adminQuizCreate(user1.token, 'Quiz 3', 'Description for Quiz 3');
      const question = adminCreateQuestion(user1.token, quiz1.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      expect(() => adminQuizQuestionMove(quiz1.quizId, question.questionId, 'invalidToken', 1)).toThrow(HTTPError[401]);
    });

    test('Invalid quiz ID', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'John', 'Doe');
      const invalidQuizId = -928374509283;
      const questionId = 1;
      expect(() => adminQuizQuestionMove(invalidQuizId, questionId, user1.token, 1)).toThrow(HTTPError[403]);
    });

    test('User does not own the quiz', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'John', 'Doe');
      const user2 = adminAuthRegister('user2@example.com', 'password123', 'Alice', 'Smith');
      const quiz = adminQuizCreate(user1.token, 'Quiz', 'Description for Quiz');
      const question = adminCreateQuestion(user1.token, quiz.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      const newPosition = 918237093;
      expect(() => adminQuizQuestionMove(quiz.quizId, question.questionId, user2.token, newPosition)).toThrow(HTTPError[403]);
    });

    test('User does not own the quiz', () => {
      const user1 = adminAuthRegister('user1@example.com', 'password123', 'John', 'Doe');
      const user2 = adminAuthRegister('user2@example.com', 'password123', 'Alice', 'Smith');
      const quiz = adminQuizCreate(user1.token, 'Quiz', 'Description for Quiz');
      const question1 = adminCreateQuestion(user1.token, quiz.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      adminCreateQuestion(user1.token, quiz.quizId, 'a cooler question', 30, 5, answer2, thumbnailUrl2);
      adminCreateQuestion(user1.token, quiz.quizId, 'alphabet question', 30, 5, answer3, thumbnailUrl3);
      expect(() => adminQuizQuestionMove(quiz.quizId, question1.questionId, user2.token, 1)).toThrow(HTTPError[403]);
    });

    test('NewPosition is out of range (less than 0)', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz = adminQuizCreate(user.token, 'Quiz', 'Description for Quiz');
      const question = adminCreateQuestion(user.token, quiz.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      const newPosition = -1;
      expect(() => adminQuizQuestionMove(quiz.quizId, question.questionId, user.token, newPosition)).toThrow(HTTPError[400]);
    });

    test('NewPosition is out of range (greater than n-1)', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz = adminQuizCreate(user.token, 'Quiz', 'Description for Quiz');
      const question = adminCreateQuestion(user.token, quiz.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1);
      const newPosition = 10;
      expect(() => adminQuizQuestionMove(quiz.quizId, question.questionId, user.token, newPosition)).toThrow(HTTPError[400]);
    });

    test('Move to the same position', () => {
      const user = adminAuthRegister('user@example.com', 'password123', 'John', 'Doe');
      const quiz = adminQuizCreate(user.token, 'Quiz', 'Description for Quiz');
      const questions: number[] = [];
      questions.push(adminCreateQuestion(user.token, quiz.quizId, 'cool question', 30, 5, answer1, thumbnailUrl1).questionId);
      questions.push(adminCreateQuestion(user.token, quiz.quizId, 'another cool question', 30, 5, answer2, thumbnailUrl2).questionId);
      expect(() => adminQuizQuestionMove(quiz.quizId, questions[0], user.token, 0)).toThrow(HTTPError[400]);
    });
  });
});

describe('POST /v2/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  test('Success direct', () => {
    const user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    const quiz1 = adminQuizCreateV1(user1.token, 'maths', 'A cool quiz about maths');
    const answer = [
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
    const question = adminCreateQuestionV1(user1.token, quiz1.quizId, 'How much?', 5, 2, answer);
    expect(adminQuizQuestionDuplicateV1(quiz1.quizId, question.questionId, user1.token)).toStrictEqual({ newQuestionId: expect.any(Number) });
    expect(adminQuizInfoV1(user1.token, quiz1.quizId)).toStrictEqual({
      quizId: quiz1.quizId,
      name: 'maths',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      questions: [
        {
          questionId: question.questionId,
          question: 'How much?',
          duration: 5,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        },
        {
          questionId: expect.any(Number),
          question: 'How much?',
          duration: 5,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '2',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '4',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '5',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '6',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '7',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: '8',
              correct: false
            },
          ]
        }
      ],
      description: 'A cool quiz about maths',
      duration: 10,
      numQuestions: 2
    });
  });
});

describe('POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let user1: AuthRegisterReturn, quiz1: QuizCreateReturn, user2: AuthRegisterReturn;
  let answer: AnswerBody[], question: QuestionCreateReturn, thumbnailUrl: string;
  const fakeQuestionId: QuestionCreateReturn = { questionId: 247919 };
  const fakeUser: AuthRegisterReturn = { token: 'faketoken' };
  const fakeQuiz: QuizCreateReturn = { quizId: 3973109 };

  beforeEach(() => {
    user1 = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith');
    quiz1 = adminQuizCreate(user1.token, 'history', 'A cool quiz about history');
    user2 = adminAuthRegister('mark@unsw.edu.au', 'password12345', 'Mark', 'Harris');
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
    question = adminCreateQuestion(user1.token, quiz1.quizId, 'How much?', 5, 2, answer, thumbnailUrl);
  });

  describe('Error Cases', () => {
    test('Not valid QuestionId', () => {
      expect(() => adminQuizQuestionDuplicate(quiz1.quizId, fakeQuestionId.questionId, user1.token)).toThrow(HTTPError[400]);
    });
    test('Not valid token', () => {
      expect(() => adminQuizQuestionDuplicate(quiz1.quizId, question.questionId, fakeUser.token)).toThrow(HTTPError[401]);
    });
    test('Invalid QuizId', () => {
      expect(() => adminQuizQuestionDuplicate(fakeQuiz.quizId, question.questionId, user1.token)).toThrow(HTTPError[403]);
    });
    test('User does not own Quiz', () => {
      expect(() => adminQuizQuestionDuplicate(quiz1.quizId, question.questionId, user2.token)).toThrow(HTTPError[403]);
    });
  });

  describe('Success Cases', () => {
    test('valid1', () => {
      expect(adminQuizQuestionDuplicate(quiz1.quizId, question.questionId, user1.token)).toStrictEqual({ newQuestionId: expect.any(Number) });
    });
    test('valid double duplicate', () => {
      expect(adminQuizQuestionDuplicate(quiz1.quizId, question.questionId, user1.token)).toStrictEqual({ newQuestionId: expect.any(Number) });
    });
  });
});

describe('Test invalid Url', () => {
  test('Invalid Url', () => {
    expect(invalidUrl()).toStrictEqual({
      error: expect.any(String)
    });
  });
});
