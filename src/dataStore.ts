import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import { DataStore, SessionStore } from './returnedInterfaces';
let data : DataStore = {
  users: [],
  quizzes: [],
  inactiveSessions: [],
};

let sessions: SessionStore = {
  sessions: [],
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
const getData = (): DataStore => {
  load();
  return data;
};

const setData = (newData: DataStore) => {
  data = newData;
  save();
};

const getSessions = (): SessionStore => {
  return sessions;
};

const setSessions = (newSessions: SessionStore) => {
  sessions = newSessions;
};

const load = () => {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json', { encoding: 'utf8' });
    data = JSON.parse(file);
  }
};

const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(data));
};

export { getData, setData, load, save, getSessions, setSessions };
