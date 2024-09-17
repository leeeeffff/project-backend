import { save, load } from './dataStore';
import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthLogin,
  adminAuthRegister,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminAuthLogout,
} from './auth';
import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTrash,
  adminQuizRestore,
  adminQuizTrashEmpty,
  adminQuizTransfer,
  adminQuizThumbnail,
  adminQuizViewSessions,
  adminQuizStartNewSession,
  quizSessionUpdate,
  getQuizSessionInfo,
  getQuizSessionResults,
  getQuizSessionResultsCSV,
} from './quiz';
import {
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
  adminQuizQuestionDuplicate,
  adminQuizQuestionMove
} from './question';
import {
  adminPlayerCreate,
  adminPlayerInfo,
  adminPlayerQuestionInfo,
  adminPlayerAnswersSubmit,
  getPlayerQuestionResult,
  getFinalResults,
  playerMessage,
  playerChat
} from './player';
import { clear } from './other';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));
// For serving static files
app.use(express.static('public'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

load();

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  save();
  return res.json(echo(data));
});

// Post request for adminAuthRegiester function
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body and will always be of the correct type.
  const { email, password, nameFirst, nameLast } = req.body;

  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(response);
});

// Post request for adminAuth Login Function
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body and will always be of the correct type.
  const { email, password } = req.body;

  const response = adminAuthLogin(email, password);

  res.json(response);
});

// Get request for adminuserDetails Function
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminUserDetails(token);

  res.json(response);
});

// Put request for adminUserDetailsUpdate Function
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);

  res.json(response);
});

// Put request for adminUserPasswordUpdate Function
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);

  res.json(response);
});

// Get request for adminQuizList Function
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminQuizList(token);

  res.json(response);
});

// Get request for adminQuizTrash Function
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminQuizTrash(token);

  res.json(response);
});

// Post request for adminQuizCreate Function
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const response = adminQuizCreate(token, name, description, 'v1');

  res.json(response);
});

// Delete request for adminQuizRemove Function
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;

  const response = adminQuizRemove(token, quizId, 'v1');

  res.json(response);
});

// Get request for adminQuizInfo Function
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;

  const response = adminQuizInfo(token, quizId, 'v1');

  res.json(response);
});

// Put request for adminQuizNameUpdate Function
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;

  const response = adminQuizNameUpdate(token, quizId, name);

  res.json(response);
});

// Put request for adminQuizDescription Function
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;

  const response = adminQuizDescriptionUpdate(token, quizId, description);

  res.json(response);
});

// Delete request for clear Function
app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();

  res.json(response);
});

// Iteration 2 Functions URLS

// Post Request for adminAuthLogout Function
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body and will always be of the correct type.
  const { token } = req.body;

  const response = adminAuthLogout(token);

  res.json(response);
});

// Post request for adminQuizRestore Function
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token } = req.body;

  const response = adminQuizRestore(quizId, token);

  res.json(response);
});

// Delete request for adminQuizTrashEmpty Function
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIdsString = req.query.quizIds as string;

  const response = adminQuizTrashEmpty(token, JSON.parse(quizIdsString));

  res.json(response);
});

// Post request for adminQuizTransfer Function
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;

  const response = adminQuizTransfer(quizid, token, userEmail, 'v1');

  res.json(response);
});

// Post request for adminCreateQuestion Function
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;

  const response = adminCreateQuestion(token, quizId, questionBody);

  res.json(response);
});

// Put request for adminUpdateQuestion Function
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;

  const response = adminUpdateQuestion(token, quizId, questionId, questionBody);

  res.json(response);
});

// Delete request for adminDeleteQuestion Function
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;

  const response = adminDeleteQuestion(token, quizId, questionId, 'v1');

  res.json(response);
});

// Put request for adminQuizQuestionMove Function
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const questionid = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;

  const response = adminQuizQuestionMove(quizid, questionid, token, newPosition);

  res.json(response);
});

// Post Request for adminQuizQuestionDuplicate Function
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token } = req.body;

  const response = adminQuizQuestionDuplicate(quizId, questionId, token);

  res.json(response);
});

/// //////////////////////////////////////////////////////////////////////////////////////
// Iter3 modified functions
// Get request for adminUserDetails Function
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const response = adminUserDetails(token);

  res.json(response);
});

// Put request for adminUserDetailsUpdate Function
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.headers.token as string;

  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);

  res.json(response);
});

// Put request for adminUserPasswordUpdate Function
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.token as string;

  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);

  res.json(response);
});

// Get request for adminQuizList Function
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const response = adminQuizList(token);

  res.json(response);
});

// Get request for adminQuizTrash Function
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const response = adminQuizTrash(token);

  res.json(response);
});

// Post request for adminQuizCreate Function
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = req.headers.token as string;

  const response = adminQuizCreate(token, name, description, 'v2');

  res.json(response);
});

// Delete request for adminQuizRemove Function
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;

  const response = adminQuizRemove(token, quizId, 'v2');

  res.json(response);
});

// Get request for adminQuizInfo Function
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;

  const response = adminQuizInfo(token, quizId, 'v2');

  res.json(response);
});

// Put request for adminQuizNameUpdate Function
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;
  const token = req.headers.token as string;

  const response = adminQuizNameUpdate(token, quizId, name);

  res.json(response);
});

// Put request for adminQuizDescription Function
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { description } = req.body;
  const token = req.headers.token as string;

  const response = adminQuizDescriptionUpdate(token, quizId, description);

  res.json(response);
});

// Post Request for adminAuthLogout Function
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body and will always be of the correct type.
  const token = req.headers.token as string;

  const response = adminAuthLogout(token);

  res.json(response);
});

// Post request for adminQuizRestore Function
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;

  const response = adminQuizRestore(quizId, token);

  res.json(response);
});

// Delete request for adminQuizTrashEmpty Function
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIdsString = req.query.quizIds as string;

  const response = adminQuizTrashEmpty(token, JSON.parse(quizIdsString));

  res.json(response);
});

// Post request for adminQuizTransfer Function
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const { userEmail } = req.body;
  const token = req.headers.token as string;

  const response = adminQuizTransfer(quizid, token, userEmail, 'v2');

  res.json(response);
});

// Post request for adminCreateQuestion Function
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;
  const token = req.headers.token as string;

  const response = adminCreateQuestion(token, quizId, questionBody);

  res.json(response);
});

// Put request for adminUpdateQuestion Function
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;
  const token = req.headers.token as string;

  const response = adminUpdateQuestion(token, quizId, questionId, questionBody);

  res.json(response);
});

// Delete request for adminDeleteQuestion Function
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;

  const response = adminDeleteQuestion(token, quizId, questionId, 'v2');

  res.json(response);
});

// Put request for adminQuizQuestionMove Function
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid);
  const questionid = parseInt(req.params.questionid);
  const { newPosition } = req.body;
  const token = req.headers.token as string;

  const response = adminQuizQuestionMove(quizid, questionid, token, newPosition);

  res.json(response);
});

// Post Request for adminQuizQuestionDuplicate Function
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;

  const response = adminQuizQuestionDuplicate(quizId, questionId, token);

  res.json(response);
});

// Iteration 3 New Functions

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { imgUrl } = req.body;

  const response = adminQuizThumbnail(quizId, token, imgUrl);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;

  const response = adminQuizViewSessions(token, quizId);

  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { autoStartNum } = req.body;

  const response = adminQuizStartNewSession(quizId, token, autoStartNum);

  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  const { action } = req.body;

  const response = quizSessionUpdate(token, quizId, sessionId, action);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;

  const response = getQuizSessionInfo(token, quizId, sessionId);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;

  const response = getQuizSessionResults(token, quizId, sessionId);

  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;

  const response = getQuizSessionResultsCSV(token, quizId, sessionId);

  res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;

  const response = adminPlayerCreate(sessionId, name);

  res.json(response);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  const response = adminPlayerInfo(playerId);

  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);

  const response = adminPlayerQuestionInfo(playerId, questionPosition);

  res.json(response);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;

  const response = adminPlayerAnswersSubmit(playerId, questionPosition, JSON.parse(answerIds));

  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);

  const response = getPlayerQuestionResult(playerId, questionPosition);
  res.json(response);
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  const response = getFinalResults(playerId);
  res.json(response);
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  const response = playerMessage(playerId);
  res.json(response);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;

  const response = playerChat(playerId, message.messageBody);
  res.json(response);
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
