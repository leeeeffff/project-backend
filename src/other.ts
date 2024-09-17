import { getData, setData, getSessions, setSessions } from './dataStore';
import { EmptyReturn } from './returnedInterfaces';
/**
 * Reset the state of the application back to the start.
 *
 * @returns {{}} - empty object
 */
export function clear(): EmptyReturn {
  let data = getData();
  let sessions = getSessions();
  for (const item of sessions.sessions) {
    clearTimeout(item.timerId);
  }
  data = {
    users: [],
    quizzes: [],
    inactiveSessions: []
  };
  sessions = {
    sessions: []
  };
  setData(data);
  setSessions(sessions);
  return {};
}
