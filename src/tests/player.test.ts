import HTTPError from 'http-errors';
import {
  AnswerBody,
  ActionType
} from '../returnedInterfaces';
import {
  adminAuthRegister,
  adminQuizCreate,
  adminCreateQuestion,
  createQuizSession,
  quizSessionUpdate,
  adminQuizInfo,
  createPlayerSession,
  getPlayerSession,
  getPlayerQuestionInfo,
  submitPlayerAnswers,
  getPlayerQuestionResult,
  getFinalResults,
  playerMessage,
  playerChat,
  clear
} from '../wrapperRequests';

beforeEach(() => clear());

export function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

describe('createPlayerSession', () => {
  let token: string, quiz: number, session: number;
  let answer: AnswerBody[], thumbnailUrl: string;
  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
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
    adminCreateQuestion(token, quiz, 'What is 1 + 1?', 4, 4, answer, thumbnailUrl);
    session = createQuizSession(token, quiz, 1).sessionId;
  });

  describe('Failure direct', () => {
    test('player name not unique', () => {
      createPlayerSession(session, 'Scott');
      expect(() => createPlayerSession(session, 'Scott')).toThrow(HTTPError[400]);
    });

    test('sessionId not valid', () => {
      expect(() => createPlayerSession(session + 1, 'Scott')).toThrow(HTTPError[400]);
    });

    test('session not in LOBBY state', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);

      expect(() => createPlayerSession(session, 'Scott')).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('empty player name', () => {
      expect(createPlayerSession(session, '')).toStrictEqual({
        playerId: expect.any(Number)
      });
    });

    test('correct return type', () => {
      expect(createPlayerSession(session, 'Scott')).toStrictEqual({
        playerId: expect.any(Number)
      });
    });
  });
});

describe('getPlayerSession', () => {
  let token: string, quiz: number, session: number, player: number;
  let answer: AnswerBody[], thumbnailUrl: string;

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
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
    adminCreateQuestion(token, quiz, 'What is 1 + 1?', 4, 4, answer, thumbnailUrl);
    session = createQuizSession(token, quiz, 3).sessionId;
    player = createPlayerSession(session, 'Scott').playerId;
  });

  describe('Failure direct', () => {
    test('invalid playerId', () => {
      expect(() => getPlayerSession(player + 5)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('correct return type', () => {
      expect(getPlayerSession(player)).toStrictEqual({
        state: expect.any(String),
        numQuestions: expect.any(Number),
        atQuestion: expect.any(Number)
      });
    });
  });
});

describe('getPlayerQuestionInfo', () => {
  let token: string, quiz: number, session: number, player: number;
  let answer1: AnswerBody[], answer2: AnswerBody[], thumbnailUrl1: string, thumbnailUrl2: string;
  let question1: number, question2: number;

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
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
    question1 = adminCreateQuestion(token, quiz, 'What is 1 + 1?', 4, 4, answer1, thumbnailUrl1).questionId;
    question2 = adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2).questionId;

    session = createQuizSession(token, quiz, 3).sessionId;
    player = createPlayerSession(session, 'Scott').playerId;
  });

  describe('Failure direct', () => {
    test('invalid playerId', () => {
      expect(() => getPlayerQuestionInfo(player + 5, 3)).toThrow(HTTPError[400]);
    });

    test('invalid questionPosition', () => {
      expect(() => getPlayerQuestionInfo(player, 3)).toThrow(HTTPError[400]);
    });

    test('invalid session on this question', () => {
      expect(() => getPlayerQuestionInfo(player, 2)).toThrow(HTTPError[400]);
    });

    test('session is in LOBBY, QUESTION_COUNTDOWN or END state', () => {
      expect(() => getPlayerQuestionInfo(player, 1)).toThrow(HTTPError[400]);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      expect(() => getPlayerQuestionInfo(player, 1)).toThrow(HTTPError[400]);
      quizSessionUpdate(token, quiz, session, ActionType.END);
      expect(() => getPlayerQuestionInfo(player, 1)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(getPlayerQuestionInfo(player, 1)).toStrictEqual({
        questionId: question1,
        question: 'What is 1 + 1?',
        duration: 4,
        points: 4,
        thumbnailUrl: thumbnailUrl1,
        answers: [
          {
            answer: '2',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: '4',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: '5',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: '6',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: '7',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: '8',
            answerId: expect.any(Number),
            colour: expect.any(String)
          }
        ]
      });
    });

    test('get second question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(getPlayerQuestionInfo(player, 2)).toStrictEqual({
        questionId: question2,
        question: 'Which treaty officially ended World War I?',
        duration: 100,
        points: 4,
        thumbnailUrl: thumbnailUrl2,
        answers: [
          {
            answer: 'Treaty of Versailles',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: 'Treaty of Trianon',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: 'Treaty of Brest-Litovsk',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: 'Treaty of Saint',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: 'Treaty of Neuilly',
            answerId: expect.any(Number),
            colour: expect.any(String)
          },
          {
            answer: 'Treaty of Sevres',
            answerId: expect.any(Number),
            colour: expect.any(String)
          }
        ]
      });
    });
  });
});

describe('submitPlayerAnswers', () => {
  let token: string, quiz: number, session: number, player: number;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let thumbnailUrl1: string, thumbnailUrl2: string;
  let correctAnswer1: number, correctAnswer2: number;
  let allAnswers: number[];

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
    answer1 = [
      {
        answer: '1',
        correct: true
      },
      {
        answer: '3',
        correct: true
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
    adminCreateQuestion(token, quiz, 'What are two numbers before and after 2?', 4, 4, answer1, thumbnailUrl1);
    adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);
    session = createQuizSession(token, quiz, 3).sessionId;
    correctAnswer1 = adminQuizInfo(token, quiz).questions[0].answers[0].answerId;
    correctAnswer2 = adminQuizInfo(token, quiz).questions[0].answers[1].answerId;
    // correctAnswer1 = getQuizSessionInfo(token, quiz, session).metaData.questions[0].answers[0].answerId;
    // correctAnswer2 = getQuizSessionInfo(token, quiz, session).metaData.questions[0].answers[1].answerId;
    allAnswers = [correctAnswer1, correctAnswer2];
    player = createPlayerSession(session, 'Scott').playerId;
  });

  describe('Failure direct', () => {
    test('invalid playerId', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(() => submitPlayerAnswers(player + 5, 3, allAnswers)).toThrow(HTTPError[400]);
    });

    test('invalid questionPosition', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(() => submitPlayerAnswers(player, 3, allAnswers)).toThrow(HTTPError[400]);
    });

    test('session is not in QUESTION_OPEN state', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      expect(() => submitPlayerAnswers(player, 1, allAnswers)).toThrow(HTTPError[400]);
    });

    test('invalid session on this question', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(() => submitPlayerAnswers(player, 2, allAnswers)).toThrow(HTTPError[400]);
    });

    test('invalid AnswerIds', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      allAnswers = allAnswers.map(item => item + 10);
      expect(() => submitPlayerAnswers(player, 1, allAnswers)).toThrow(HTTPError[400]);
    });

    test('duplicate AnswerIds', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      allAnswers[1] = allAnswers[0];
      expect(() => submitPlayerAnswers(player, 1, allAnswers)).toThrow(HTTPError[400]);
    });

    test('empty AnswerIds', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      allAnswers = [];
      expect(() => submitPlayerAnswers(player, 1, allAnswers)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    beforeEach(() => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
    });

    test('submit all answers once', () => {
      expect(submitPlayerAnswers(player, 1, allAnswers)).toStrictEqual({});
    });

    test('submit answers multiple times', () => {
      expect(submitPlayerAnswers(player, 1, allAnswers)).toStrictEqual({});
      allAnswers.splice(0, 1);
      expect(submitPlayerAnswers(player, 1, allAnswers)).toStrictEqual({});
      allAnswers.push(correctAnswer1);
      expect(submitPlayerAnswers(player, 1, allAnswers)).toStrictEqual({});
    });
  });
});

describe('getPlayerQuestionResult', () => {
  let token: string, quiz: number, session: number, player: number;
  let answer1: AnswerBody[], answer2: AnswerBody[], answer3: AnswerBody[];
  let thumbnailUrl1: string, thumbnailUrl2: string, thumbnailUrl3: string;
  let correctAnswer1: number, correctAnswer2: number, correctAnswer3: number;
  let question1: number, question2: number, question3: number;
  let position: number;

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
    answer1 = [
      {
        answer: '1',
        correct: true
      },
      {
        answer: '9',
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

    answer3 = [
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

    thumbnailUrl1 = 'http://google.com/some/image/path.jpg';
    thumbnailUrl2 = 'http://google.com/some/image/path.jpg';
    thumbnailUrl3 = 'http://google.com/some/image/path.jpg';

    question1 = adminCreateQuestion(token, quiz, 'What are two numbers before and after 2?', 4, 4, answer1, thumbnailUrl1).questionId;
    question2 = adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2).questionId;
    question3 = adminCreateQuestion(token, quiz, 'What is 1 + 1?', 4, 4, answer3, thumbnailUrl3).questionId;

    session = createQuizSession(token, quiz, 3).sessionId;
    correctAnswer1 = adminQuizInfo(token, quiz).questions[0].answers[0].answerId;
    correctAnswer2 = adminQuizInfo(token, quiz).questions[1].answers[0].answerId;
    correctAnswer3 = adminQuizInfo(token, quiz).questions[2].answers[0].answerId;
    // correctAnswer1 = getQuizSessionInfo(token, quiz, session).metaData.questions[0].answers[0].answerId;

    player = createPlayerSession(session, 'Scott').playerId;
    position = 1;
  });

  describe('Failure direct', () => {
    test('player ID does not exist', () => {
      expect(() => getPlayerQuestionResult(player + 99999999, position)).toThrow(HTTPError[400]);
    });

    test('question position is not valid for the session this player is in', () => {
      expect(() => getPlayerQuestionResult(player, position + 99999999)).toThrow(HTTPError[400]);
    });

    test('Session is not in ANSWER_SHOW state', () => {
      expect(() => getPlayerQuestionResult(player, position)).toThrow(HTTPError[400]);
    });

    test('session is not yet up to this question', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      expect(() => getPlayerQuestionResult(player, position + 1)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, [correctAnswer1]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      expect(getPlayerQuestionResult(player, position)).toStrictEqual({
        questionId: question1,
        playersCorrectList: ['Scott'],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 100
      });
    });
  });

  describe('Success direct 2', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, [correctAnswer1]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 2, [correctAnswer2]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      expect(getPlayerQuestionResult(player, 2)).toStrictEqual({
        questionId: question2,
        playersCorrectList: ['Scott'],
        averageAnswerTime: expect.any(Number),
        percentCorrect: expect.any(Number)
      });
    });
  });

  describe('Success direct 3', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 3, [correctAnswer3]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      expect(getPlayerQuestionResult(player, 3)).toStrictEqual({
        questionId: question3,
        playersCorrectList: ['Scott'],
        averageAnswerTime: expect.any(Number),
        percentCorrect: expect.any(Number)
      });
    });
  });
});

describe('finalResult', () => {
  let token: string, quiz: number, session: number, player: number, player2: number;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let thumbnailUrl1: string, thumbnailUrl2: string;
  let correctAnswerq1: number, correctAnswer2: number, correctAnswerq2: number;
  let incorrectAnswer1: number, incorrectAnswer2: number, incorrectAnswer: number;
  let question1: number, question2: number;
  let allAnswers: number[], allIncorrect: number[];

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
    answer1 = [
      {
        answer: '1',
        correct: true
      },
      {
        answer: '3',
        correct: true
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
    thumbnailUrl2 = 'http://google.com/some/image/path.jpg';

    question1 = adminCreateQuestion(token, quiz, 'What are two numbers before and after 2?', 4, 4, answer1, thumbnailUrl1).questionId;
    question2 = adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 8, answer2, thumbnailUrl2).questionId;

    session = createQuizSession(token, quiz, 3).sessionId;
    correctAnswerq1 = adminQuizInfo(token, quiz).questions[0].answers[0].answerId;
    correctAnswer2 = adminQuizInfo(token, quiz).questions[0].answers[1].answerId;
    incorrectAnswer1 = adminQuizInfo(token, quiz).questions[0].answers[2].answerId;
    incorrectAnswer2 = adminQuizInfo(token, quiz).questions[0].answers[3].answerId;
    correctAnswerq2 = adminQuizInfo(token, quiz).questions[1].answers[0].answerId;
    incorrectAnswer = adminQuizInfo(token, quiz).questions[1].answers[1].answerId;
    // correctAnswer1 = getQuizSessionInfo(token, quiz, session).metaData.questions[0].answers[0].answerId;
    allAnswers = [correctAnswerq1, correctAnswer2];
    allIncorrect = [incorrectAnswer1, incorrectAnswer2];
    player = createPlayerSession(session, 'Scott').playerId;
    player2 = createPlayerSession(session, 'josh').playerId;
  });

  describe('Failure direct', () => {
    test('player ID does not exist', () => {
      expect(() => getFinalResults(player + 99999999)).toThrow(HTTPError[400]);
    });

    test('Session is not in ANSWER_SHOW state', () => {
      expect(() => getFinalResults(player)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('case 1', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, allAnswers);
      submitPlayerAnswers(player2, 1, [3]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      expect(getFinalResults(player)).toStrictEqual({
        usersRankedByScore: [{
          name: 'Scott',
          score: 4
        },
        {
          name: 'josh',
          score: 0
        }],

        questionResults: [
          {
            questionId: question1,
            playersCorrectList: [
              'Scott',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          },
          {
            questionId: question2,
            playersCorrectList: [],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 0
          }
        ]
      });
    });
    test('case 2', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, allAnswers);
      submitPlayerAnswers(player2, 1, [3]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player2, 2, [correctAnswerq2]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      expect(getFinalResults(player)).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'josh',
            score: 8
          },
          {
            name: 'Scott',
            score: 4
          },
        ],

        questionResults: [
          {
            questionId: question1,
            playersCorrectList: [
              'Scott',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          },
          {
            questionId: question2,
            playersCorrectList: ['josh'],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          }
        ]
      });
    });
    test('case 3 - test score with scaling factor', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, allAnswers);
      submitPlayerAnswers(player2, 1, allIncorrect);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      sleepSync(2 * 1000);
      submitPlayerAnswers(player2, 2, [correctAnswerq2]);
      sleepSync(2 * 1000);
      submitPlayerAnswers(player, 2, [correctAnswerq2]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      expect(getFinalResults(player)).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'Scott',
            score: 8
          },
          {
            name: 'josh',
            score: 8
          },
        ],

        questionResults: [
          {
            questionId: question1,
            playersCorrectList: [
              'Scott',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          },
          {
            questionId: question2,
            playersCorrectList: ['Scott', 'josh'],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          }
        ]
      });
    });
    test('case 4 - same rank with incorrect answer', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      submitPlayerAnswers(player, 1, allAnswers);
      submitPlayerAnswers(player2, 1, allIncorrect);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      sleepSync(2 * 1000);
      submitPlayerAnswers(player2, 2, [incorrectAnswer]);
      submitPlayerAnswers(player, 2, [incorrectAnswer]);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      expect(getFinalResults(player)).toStrictEqual({
        usersRankedByScore: [
          {
            name: 'Scott',
            score: 4
          },
          {
            name: 'josh',
            score: 0
          },
        ],

        questionResults: [
          {
            questionId: question1,
            playersCorrectList: [
              'Scott',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          },
          {
            questionId: question2,
            playersCorrectList: [],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 0
          }
        ]
      });
    });
  });
});

describe('playerMessage', () => {
  let token: string, quiz: number, session: number, player1: number, player2: number;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let thumbnailUrl1: string, thumbnailUrl2: string;

  beforeEach(() => {
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
    answer1 = [
      {
        answer: '1',
        correct: true
      },
      {
        answer: '9',
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
    thumbnailUrl2 = 'http://google.com/some/image/path.jpg';

    adminCreateQuestion(token, quiz, 'What are two numbers before and after 2?', 4, 4, answer1, thumbnailUrl1);
    adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);

    session = createQuizSession(token, quiz, 3).sessionId;

    player1 = createPlayerSession(session, 'Scott').playerId;
    player2 = createPlayerSession(session, '').playerId;
  });

  describe('Failure direct', () => {
    test('player ID does not exist', () => {
      expect(() => playerMessage(player1 + 99999999)).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      playerChat(player1, 'hi how\'s it going?');
      expect(playerMessage(player1)).toStrictEqual({
        messages: [{
          messageBody: 'hi how\'s it going?',
          playerId: player1,
          playerName: 'Scott',
          timeSent: expect.any(Number),
        }]
      });
    });
  });

  describe('Success direct 2', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      playerChat(player1, 'hi how\'s it going?');
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      playerChat(player2, 'do you get that?');
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      playerChat(player2, 'bad results--___--');
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      playerChat(player1, 'should be fine:333');
      expect(playerMessage(player2)).toStrictEqual({
        messages: [
          {
            messageBody: 'should be fine:333',
            playerId: player1,
            playerName: 'Scott',
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'bad results--___--',
            playerId: player2,
            playerName: expect.any(String),
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'do you get that?',
            playerId: player2,
            playerName: expect.any(String),
            timeSent: expect.any(Number),
          },
          {
            messageBody: 'hi how\'s it going?',
            playerId: player1,
            playerName: 'Scott',
            timeSent: expect.any(Number),
          },
        ]
      });
    });
  });
});

describe('playerChat', () => {
  let token: string, quiz: number, session: number, player: number;
  let answer1: AnswerBody[], answer2: AnswerBody[];
  let thumbnailUrl1: string, thumbnailUrl2: string;
  let messageOver100: string, message: string;

  beforeEach(() => {
    messageOver100 = 'alwehgbofasikjdhfiaueofijcnasoidjfoiasdoiufboaweibflkjasdbnflkjasdlfkjhasldkjfhlasjdhflkajsdnbflkjasbdlfkjbasloidfboais';
    message = 'hello how are you guys doing?';
    token = adminAuthRegister('hayden@unsw.edu.au', 'password12345', 'Hayden', 'Smith').token;
    quiz = adminQuizCreate(token, 'maths', 'A boring quiz about maths').quizId;
    answer1 = [
      {
        answer: '1',
        correct: true
      },
      {
        answer: '9',
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
    thumbnailUrl2 = 'http://google.com/some/image/path.jpg';

    adminCreateQuestion(token, quiz, 'What are two numbers before and after 2?', 4, 4, answer1, thumbnailUrl1);
    adminCreateQuestion(token, quiz, 'Which treaty officially ended World War I?', 100, 4, answer2, thumbnailUrl2);

    session = createQuizSession(token, quiz, 3).sessionId;

    player = createPlayerSession(session, 'Scott').playerId;
  });

  describe('Failure direct', () => {
    test('player ID does not exist', () => {
      expect(() => playerChat(player + 99999999, message)).toThrow(HTTPError[400]);
    });

    test('more than 100 characters', () => {
      expect(() => playerChat(player, messageOver100)).toThrow(HTTPError[400]);
    });

    test('less than 1 character', () => {
      expect(() => playerChat(player, '')).toThrow(HTTPError[400]);
    });
  });

  describe('Success direct', () => {
    test('get first question info', () => {
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(playerChat(player, message)).toStrictEqual({});
    });
  });

  describe('Success direct 2', () => {
    test('get first question info', () => {
      const player2: number = createPlayerSession(session, 'josh').playerId;
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      expect(playerChat(player, message)).toStrictEqual({});
      quizSessionUpdate(token, quiz, session, ActionType.NEXT_QUESTION);
      quizSessionUpdate(token, quiz, session, ActionType.SKIP_COUNTDOWN);
      expect(playerChat(player, message)).toStrictEqual({});
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_ANSWER);
      quizSessionUpdate(token, quiz, session, ActionType.GO_TO_FINAL_RESULTS);
      expect(playerChat(player2, message)).toStrictEqual({});
    });
  });
});
