import { getData, setData } from './dataStore';
import sha256 from 'sha256';
import validator from 'validator';
import {
  AuthRegisterReturn, AuthLoginReturn, EmptyReturn, ErrorObject, AdminUserDetailsReturn
} from './returnedInterfaces';
import HTTPError from 'http-errors';

// constant for invalid index
const INVALID = -1;
/**
 * Register a user with an email, password, and names, then returns their
 * authUserId value.
 *
 * @param {string} email        - User's email they're attempting to register
 * @param {string} password     - User's password they're attempting to register
 * @param {string} nameFirst    - User's first name they're attempting to register
 * @param {string} nameLast     - User's last name they're attempting to register
 *
 * @return {authUserId: number} - The authenticated UserId
 * @return {error: string}      - returns error
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): ErrorObject | AuthRegisterReturn {
  const data = getData();

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is not valid');
  }

  // checks if email is already in (uses helper function)
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Email is already used');
    }
  }

  // checks if NameFirst contains char other than
  // lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  if (!nameChecker(nameFirst)) {
    throw HTTPError(400, 'First name contains anomalies');
  }

  // checks if nameFirst is within 2 to 20
  if (!nameLengthChecker(nameFirst)) {
    throw HTTPError(400, 'First name needs to be 2 to 20 in length');
  }

  // checks if nameLast contains char other than
  // lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  if (!nameChecker(nameLast)) {
    throw HTTPError(400, 'Last name contains anomalies');
  }

  // checks if nameLast is within 2 to 20
  if (!nameLengthChecker(nameLast)) {
    throw HTTPError(400, 'Last name needs to be 2 to 20 in length');
  }

  // checks if password length is less than 8
  if (password.length < 8) {
    throw HTTPError(400, 'Password cant be less than 8 characters');
  }

  // checks if password has at least 1 number and letter
  if (!(/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password))) {
    throw HTTPError(400, 'Password needs to contain at least one number and one letter');
  }

  // hashes password and then we will store the hashed version
  const hashedPassword = sha256(password);

  // sets id based on users array length
  const id = data.users.length;
  // pushes the user data into users array
  data.users.push({
    email: email,
    password: hashedPassword,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: id,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    oldPasswords: [],
    sessions: []
  });

  const timestamp = Date.now().toString();
  const lastFourDigits = timestamp.slice(-4);
  const session = {
    sessionId: parseInt(id + lastFourDigits)
  };

  data.users[id].sessions.push(session);
  setData(data);
  return {
    token: JSON.stringify(session)
  };
}

/// //////////////////////////////////////////////////////////////////////////
/// /////////   helper functions for adminAuthRegister   /////////////////////
/// //////////////////////////////////////////////////////////////////////////

// helper function checks if name contains anomalies
function nameChecker(name: string): boolean {
  // checks for anomalies
  if (/^[a-zA-Z\s\-']+$/.test(name)) {
    return true;
  }
  return false;
}

// helper function checks if name is within 2 to 20
function nameLengthChecker(name: string) {
  // checks if name is within length
  if (name.length >= 2 && name.length <= 20) {
    return true;
  }
  return false;
}

/// ////////////////////////////////////////////////////////////////////////////

/**
 * Given a registered user's email and password returns their authUserId value.
 *
 * @param {string} email    - User's email they're attempting to login with
 * @param {string} password - User's password they're attempting to login with
 *
 * @returns {authUserId: number} - User's authUserId
 * @return {error: string}      - returns error
 */
export function adminAuthLogin(email: string, password: string): ErrorObject | AuthLoginReturn {
  const data = getData();

  // checks if email exists or is incorrect
  if (!(emailChecker(email))) {
    throw HTTPError(400, 'Email could not be found');
  }
  // finds id of user
  const id = userIdfinder(email);

  // checks if password matches
  if (!(passwordChecker(password, email))) {
    for (const i of data.users) {
      if (email === i.email) {
        i.numFailedPasswordsSinceLastLogin += 1;
      }
    }
    setData(data);
    throw HTTPError(400, 'Password does not match');
  }

  for (const j of data.users) {
    if (email === j.email && id === j.authUserId) {
      if (j.numFailedPasswordsSinceLastLogin !== 0) {
        j.numFailedPasswordsSinceLastLogin = 0;
      }
      j.numSuccessfulLogins += 1;
    }
  }

  setData(data);

  // sets id based on users array length. The Date.now function returns a very
  // long number, so we only take 4 digits of it, to make numbers smaller,
  // whilst still ensuring uniqueness

  const timestamp = Date.now().toString();
  const lastFourDigits = timestamp.slice(-4);
  const session = {
    sessionId: parseInt(id + lastFourDigits)
  };

  data.users[id].sessions.push(session);
  setData(data);
  return {
    token: JSON.stringify(session)
  };
}

/// ////////////////////////////////////////////////////////////////////////////
/// //////////////////       adminAuthLogin       //////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////

// helper function checks if email exists
function emailChecker(email: string) {
  const data = getData();

  if (data.users.length === 0) {
    return false;
  }

  // email found
  for (const emailList of data.users) {
    if (email === emailList.email) {
      return true;
    }
  }

  // email not found
  return false;
}

// helper function checks if password matches email
function passwordChecker(password: string, email: string) {
  const data = getData();

  const checkHash = sha256(password);
  // looks for email then hashed password
  for (const emailList of data.users) {
    if (email === emailList.email) {
      if (checkHash === emailList.password) {
        return true;
      }
    }
  }

  // password not a match
  return false;
}

// helper function finds user Id
function userIdfinder (email: string) {
  const data = getData();

  // looks for user id through email
  for (const emailList of data.users) {
    if (email === emailList.email) {
      return emailList.authUserId;
    }
  }
}

/// ////////////////////////////////////////////////////////////////////////////

/**
  * Given authUserId returns an array that represents authUser
  *
  * @param {string} token  - string data which identifies a users session
  *
  * @returns {
  *   user: {
  *     userId: number,
  *     name: string,
  *     email: string,
  *     numSuccessfulLogins: number,
  *     numFailedPasswordsSinceLastLogin: number,
  *   }
  * }                          - takes in a token then returns a user object
  * @return {error: string}    - returns error
*/
export function adminUserDetails(token: string): AdminUserDetailsReturn | ErrorObject {
  const data = getData();

  // Finds ID related to token, and if the token refers to a valid session
  const idAndValidityCheck = findIdFromToken(token);
  const foundIdIndex = idAndValidityCheck[0];
  const validSession = idAndValidityCheck[1];

  if ((validSession === INVALID) || token === '') {
    throw HTTPError(401, 'invalid session');
  }

  const user = data.users[foundIdIndex];
  return {
    user: {
      userId: user.authUserId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
  * Given an admin user's authUserId and a set of properties, update the
  * properties of this logged in admin user.
  *
  * @param {string} token  - string data which identifies a users session
  * @param {string} email       - string data which identifies user's email
  * @param {string} nameFirst   - string data which identifies user's first name
  * @param {string} nameLast    - string data which identifies user's last name
  *
  * @returns {{}}               - returns empty object
  * @return {error: string}     - returns error
*/
export function adminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): EmptyReturn | ErrorObject {
  // Check if token is valid
  const data = getData();

  // Finds ID related to token, and if the token refers to a valid session
  const idAndValidityCheck = findIdFromToken(token);
  const foundIdIndex = idAndValidityCheck[0];
  const validSession = idAndValidityCheck[1];

  if ((validSession === INVALID) || token === '') {
    throw HTTPError(401, 'invalid session');
  }

  // check for invalid characters in nameFirst
  const validCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ -';
  for (const character of nameFirst) {
    if (validCharacters.indexOf(character) === INVALID) {
      throw HTTPError(400, 'nameFirst invalid');
    }
  }

  // check for invalid characters in nameLast
  for (const character of nameLast) {
    if (validCharacters.indexOf(character) === INVALID) {
      throw HTTPError(400, 'nameLast invalid');
    }
  }

  // check if names are within bounds of character length requirements.
  if (nameFirst.length < 2) {
    throw HTTPError(400, 'NameFirst too short');
  }
  if (nameFirst.length > 20) {
    throw HTTPError(400, 'NameFirst too long');
  }
  if (nameLast.length < 2) {
    throw HTTPError(400, 'NameLast too short');
  }
  if (nameLast.length > 20) {
    throw HTTPError(400, 'NameLast too long');
  }

  // check if email is valid
  const isValid = validator.isEmail(email);

  if (isValid === false) {
    throw HTTPError(400, 'Invalid email');
  }

  // Check if email is currently used by another user
  for (const user of data.users) {
    if (data.users.indexOf(user) !== foundIdIndex && user.email === email) {
      throw HTTPError(400, 'Email already used');
    }
  }

  // Else, update the properties of this logged in admin user
  data.users[foundIdIndex].email = email;
  data.users[foundIdIndex].nameFirst = nameFirst;
  data.users[foundIdIndex].nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * Given details relating to a password change, update the password of a logged
 * in user.
 *
 * @param {string} token  - string data which identifies a users session
 * @param {string} oldPassword  - admins old password
 * @param {string} newPassword  - admins new password
 *
 * @returns {{}}                - returns empty object
 */
export function adminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string): EmptyReturn | ErrorObject {
  // Check if token is valid
  const data = getData();
  const hashedOldPassword = sha256(oldPassword);
  const hashedNewPassword = sha256(newPassword);

  // Finds ID related to token, and if the token refers to a valid session
  const idAndValidityCheck = findIdFromToken(token);
  const foundIdIndex = idAndValidityCheck[0];
  const validSession = idAndValidityCheck[1];

  if ((validSession === INVALID) || token === '') {
    throw HTTPError(401, 'invalid session');
  }

  if (newPassword.length < 8) {
    throw HTTPError(400, 'Password is too short');
  }

  // checks if password has at least 1 number and letter
  if (!(/(?=.*[0-9])(?=.*[a-zA-Z])/.test(newPassword))) {
    throw HTTPError(400, 'Password needs to contain at least one number and one letter');
  }

  if (oldPassword === newPassword) {
    throw HTTPError(400, 'Old Password and New Password match exactly');
  }

  // check if old password is the correct old password
  if (data.users[foundIdIndex].password !== hashedOldPassword) {
    throw HTTPError(400, 'Old password is not correct');
  }

  const user = data.users[foundIdIndex];
  // check if new password has already been used before by this user
  let newPasswordHasBeenUsedBefore = 0;
  for (const password of user.oldPasswords) {
    if (password === hashedNewPassword) {
      newPasswordHasBeenUsedBefore = 1;
    }
  }

  if (newPasswordHasBeenUsedBefore === 1) {
    throw HTTPError(400, 'New Password has already been used before by this user');
  }

  // else, updates the password
  data.users[foundIdIndex].password = hashedNewPassword;
  data.users[foundIdIndex].oldPasswords.push(hashedOldPassword);
  setData(data);
  return {};
}

/**
 *
 * @param token
 * @returns
 */
export function adminAuthLogout(token: string): EmptyReturn | ErrorObject {
  // Check if token is valid
  const data = getData();

  // Find userIndex. Check if session is valid for error checking.
  const idAndValidityCheck = findIdFromToken(token);
  const userIndex = idAndValidityCheck[0];
  const validSession = idAndValidityCheck[1];
  let sessionIndex = INVALID;

  // check for invalid session
  if (userIndex === INVALID || validSession === INVALID) {
    throw HTTPError(401, 'invalid session');
  }

  // Find the index of the input token within the sessions of the found user
  for (const j of data.users[userIndex].sessions) {
    if (JSON.stringify(j) === token) {
      sessionIndex = data.users[userIndex].sessions.indexOf(j);
    }
  }

  // remove token
  data.users[userIndex].sessions.splice(sessionIndex, 1);
  setData(data);
  return {};
}

// given a token, finds the associated ID, and also checks if the token exists/
// is valid. If validSession is 1, token refers to a valid session.
/**
 *
 * @param token
 * @returns
 */
export function findIdFromToken(token: string) {
  const data = getData();

  let foundIdIndex = INVALID;
  let validSession = INVALID;
  for (const user of data.users) {
    for (const j of user.sessions) {
      if (JSON.stringify(j) === token) {
        foundIdIndex = data.users.indexOf(user);
        validSession = 1;
        break;
      }
    }
  }
  const idAndValidityCheck = [foundIdIndex, validSession];

  return idAndValidityCheck;
}
