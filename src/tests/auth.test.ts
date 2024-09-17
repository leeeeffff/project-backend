// 401 -> 403 -> 400
import HTTPError from 'http-errors';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsV1,
  adminUserDetailsUpdate,
  adminUserDetailsUpdateV1,
  adminUserPasswordUpdate,
  adminUserPasswordUpdateV1,
  adminAuthLogout,
  adminAuthLogoutV1,
  clear,
} from '../wrapperRequests';
import {
  AuthRegisterReturn
} from '../returnedInterfaces';

beforeEach(() => clear());

describe('Test for adminAuthRegister', () => {
  describe('Error cases', () => {
    test('testing not valid email', () => {
      expect(() => adminAuthRegister('a', 'asdaaaaaa2a', 'Chang Hyun', 'Lee')).toThrow(HTTPError[400]);
    });

    test('testing already existing email', () => {
      adminAuthRegister('joe3www@gmail.com', 'asdaaaaaa2a', 'ChangHyun', 'Lee');
      expect(() => adminAuthRegister('joe3www@gmail.com', 'asdaaaaaa2a', 'ChangHyun', 'Lee')).toThrow(HTTPError[400]);
    });

    test('testing for name contains anomalies', () => {
      expect(() => adminAuthRegister('krlessepi@gmaila.com', 'asdaaaaaa2a', 'Chang! Hyun', 'Lee')).toThrow(HTTPError[400]);
    });

    test('testing for nameFirst is below 2', () => {
      expect(() => adminAuthRegister('kasd@gmaila.com', 'asdaaaaaa2a', 'C', 'Lee')).toThrow(HTTPError[400]);
    });

    test('testing for nameFirst is above 20', () => {
      expect(() => adminAuthRegister('krfdpi@gmaila.com', 'asdaaaaaa2a', 'joejoejoejoejeojeeojeojeojeojeojoejeo', 'Lee')).toThrow(HTTPError[400]);
    });

    test('testing for last name is below 2', () => {
      expect(() => adminAuthRegister('kasd@gmaila.com', 'asda2asdfdda', 'james', 'L')).toThrow(HTTPError[400]);
    });

    test('testing for last name is aboe 20', () => {
      expect(() => adminAuthRegister('kasd@gmaila.com', 'asdaaaaaa2aaaaaaa2a', 'james', 'Leelaasdasdasdasdakjshdflalkjdfkf')).toThrow(HTTPError[400]);
    });

    test('empty lastName', () => {
      expect(() => adminAuthRegister('kasd@gmaila.com', 'asdaaaaaa2aaaaaaa2a', 'james', '')).toThrow(HTTPError[400]);
    });

    test('testing for password less than 8', () => {
      expect(() => adminAuthRegister('kasdasd@gmail.com', 'ade2f', 'james', 'lkjdfkf')).toThrow(HTTPError[400]);
    });

    test('testing for password with no number', () => {
      expect(() => adminAuthRegister('kasd@gmaila.com', 'asdasdasd', 'james', 'Leelafkf')).toThrow(HTTPError[400]);
    });

    test('testing for password with no letter', () => {
      expect(() => adminAuthRegister('kasdasd@gmail.com', '123456789', 'james', 'lkjdfkf')).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('checking successful registration', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      adminAuthRegister('joe3wwwas@gmail.com', 'asd123asdqw', 'Chang Hyuna', 'Leew');
      adminAuthRegister('joe3wwwdf@gmail.com', 'asd123asdq', 'Chang Hyunx', 'Leee');
      expect(adminAuthRegister('joe3wasdww@gmail.com', 'asd123asdw', 'Chang Hyunc', 'Leer')).toStrictEqual({
        token: expect.any(String)
      });
    });
  });
});

describe('Test for adminAuthLogin', () => {
  describe('Error cases', () => {
    test('testing for email that cant be found (user empty)', () => {
      expect(() => adminAuthLogin('joe3www@gmail.com', 'asd123asd')).toThrow(HTTPError[400]);
    });

    test('testing for email that cant be found (with users)', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      adminAuthRegister('joe3wwswaw@gmail.com', 'asdqs123asd', 'Jamiess', 'Johnse');
      adminAuthRegister('oskfaw@gmail.com', 'adf31fawdf3d', 'kartik', 'kohli');
      expect(() => adminAuthLogin('oskfadsaw@gmail.com', 'asd12a3asd')).toThrow(HTTPError[400]);
    });

    test('testing for password wrong', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(() => adminAuthLogin('joe3www@gmail.com', 'joksliekdj23s')).toThrow(HTTPError[400]);
    });

    test('testing for password wrong only numbers', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(() => adminAuthLogin('joe3www@gmail.com', '99909090909')).toThrow(HTTPError[400]);
    });

    test('testing for password wrong only letters', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(() => adminAuthLogin('joe3www@gmail.com', 'asdfaeafdf')).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('testing for adminAuthLogin', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(adminAuthLogin('joe3www@gmail.com', 'asd123asd')).toStrictEqual({
        token: expect.any(String)
      });
      expect(() => adminAuthLogin('joe3www@gmail.com', 'asdfaeafdf')).toThrow(HTTPError[400]);
      expect(adminAuthLogin('joe3www@gmail.com', 'asd123asd')).toStrictEqual({
        token: expect.any(String)
      });
    });
  });
});

describe('Test for adminUserDetails', () => {
  describe('Error cases', () => {
    test('testing if there is no Id before', () => {
      expect(() => adminUserDetails('0')).toThrow(HTTPError[401]);
    });

    test('testing if there is no match', () => {
      adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      adminAuthRegister('joe3wwswaw@gmail.com', 'asdqs123asd', 'Jamiess', 'Johnse');
      expect(() => adminUserDetails('10000')).toThrow(HTTPError[401]);
    });
  });

  describe('Success cases', () => {
    test('testing for perfect case', () => {
      const user = adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(adminUserDetails(user.token)).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Chang Hyun Lee',
          email: 'joe3www@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });

  describe('Success case for v1 route', () => {
    test('testing for perfect case', () => {
      const user = adminAuthRegister('joe3www@gmail.com', 'asd123asd', 'Chang Hyun', 'Lee');
      expect(adminUserDetailsV1(user.token)).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: 'Chang Hyun Lee',
          email: 'joe3www@gmail.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    });
  });
});

describe('Test for adminUserDetailsUpdate', () => {
  let user1: AuthRegisterReturn;
  let user2: AuthRegisterReturn;
  describe('Error cases', () => {
    test('invalid user', () => {
      expect(() => adminUserDetailsUpdate('', 'maxim@unsw.edu.au', 'Maxim', 'Buryak')).toThrow(HTTPError[401]);
    });

    beforeEach(() => {
      user1 = adminAuthRegister('maxim@unsw.edu.au', 'passw0rd', 'Maxim', 'Buryak');
      user2 = adminAuthRegister('leon@unsw.edu.au', 'passw0rd', 'Leon', 'Crane');
    });

    test('token not found', () => {
      expect(() => adminUserDetailsUpdate('iutiufi', 'maxim@unsw.edu.au', 'Maxim', 'Buryak')).toThrow(HTTPError[401]);
    });

    test('check if email is used', () => {
      expect(() => adminUserDetailsUpdate(user2.token, 'maxim@unsw.edu.au', 'Maxim', 'Buryak')).toThrow(HTTPError[400]);
    });

    test('check if email is valid', () => {
      expect(() => adminUserDetailsUpdate(user1.token, 'invalidEmail', 'Maxim', 'Buryak')).toThrow(HTTPError[400]);
    });

    test('NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', '1234', 'Buryak')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', '1', 'Buryak')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'a@@', 'Buryak')).toThrow(HTTPError[400]);
    });

    test('NameFirst is less than 2 characters or more than 20 characters', () => {
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'a', 'Buryak')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'qwertyuiopasdfghjklzxcvbnmdfgh', 'Buryak')).toThrow(HTTPError[400]);
    });

    test('NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'Maxim', '1234')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'Maxim', '1')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'Maxim', 'a@@')).toThrow(HTTPError[400]);
    });

    test('NameLast is less than 2 characters or more than 20 characters', () => {
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'Maxim', 'a')).toThrow(HTTPError[400]);
      expect(() => adminUserDetailsUpdate(user1.token, 'maxim@unsw.edu.au', 'Maxim', 'qwertyuiopasdfghjklzxcvbnmdfgh')).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('Valid update', () => {
      const user = adminAuthRegister('maxim@unsw.edu.au', 'passw0rd', 'Maxim', 'Buryak');
      expect(adminUserDetailsUpdate(user.token, 'leon@unsw.edu.au', 'Maxim', 'Buryak')).toStrictEqual({});
      expect(adminUserDetailsUpdate(user.token, 'leon@unsw.edu.au', 'Leon', 'Buryak')).toStrictEqual({});
      expect(adminUserDetailsUpdate(user.token, 'leon@unsw.edu.au', 'Leon', 'Crane')).toStrictEqual({});
    });
  });

  describe('Success cases for v1 route', () => {
    test('Valid update', () => {
      const user = adminAuthRegister('maxim@unsw.edu.au', 'passw0rd', 'Maxim', 'Buryak');
      expect(adminUserDetailsUpdateV1(user.token, 'leon@unsw.edu.au', 'Maxim', 'Buryak')).toStrictEqual({});
      expect(adminUserDetailsUpdateV1(user.token, 'leon@unsw.edu.au', 'Leon', 'Buryak')).toStrictEqual({});
      expect(adminUserDetailsUpdateV1(user.token, 'leon@unsw.edu.au', 'Leon', 'Crane')).toStrictEqual({});
    });
  });
});

describe('Test for adminUserPasswordUpdate', () => {
  let user: AuthRegisterReturn;
  beforeEach(() => {
    user = adminAuthRegister('email@gmail.com', 'passw0rd', 'first-name', 'last-name');
  });

  describe('Error cases', () => {
    test('check if token is valid', () => {
      expect(() => adminUserPasswordUpdate('asdfghjk', 'passw0rd', 'new_password')).toThrow(HTTPError[401]);
    });

    test('check if token is not an empty string', () => {
      expect(() => adminUserPasswordUpdate('', 'passw0rd', 'new_password')).toThrow(HTTPError[401]);
    });

    test('Check for when old password is not the correct old password', () => {
      expect(() => adminUserPasswordUpdate(user.token, 'wrong_passw0rd', 'new_passw0rd')).toThrow(HTTPError[400]);
    });

    test('Check for when Old Password and New Password match exactly', () => {
      expect(() => adminUserPasswordUpdate(user.token, 'passw0rd', 'passw0rd')).toThrow(HTTPError[400]);
    });

    test('Check for when new Password has already been used before by this user', () => {
      adminUserPasswordUpdate(user.token, 'passw0rd', 'new_passw0rd');
      expect(() => adminUserPasswordUpdate(user.token, 'new_passw0rd', 'passw0rd')).toThrow(HTTPError[400]);
      adminUserPasswordUpdate(user.token, 'new_passw0rd', 'newPassword7');
      expect(() => adminUserPasswordUpdate(user.token, 'newPassword7', 'passw0rd')).toThrow(HTTPError[400]);
    });

    test('New Password is less than 8 characters', () => {
      expect(() => adminUserPasswordUpdate(user.token, 'passw0rd', 'pass1')).toThrow(HTTPError[400]);
      expect(() => adminUserPasswordUpdate(user.token, 'passw0rd', 'passw0r')).toThrow(HTTPError[400]);
    });

    test('New Password does not contain at least one number and at least one letter', () => {
      expect(() => adminUserPasswordUpdate(user.token, 'passw0rd', 'passssssss')).toThrow(HTTPError[400]);
      expect(() => adminUserPasswordUpdate(user.token, 'passw0rd', '123456789')).toThrow(HTTPError[400]);
    });
  });

  describe('Success cases', () => {
    test('Check for successful password change', () => {
      expect(adminUserPasswordUpdate(user.token, 'passw0rd', 'newpassw0rd')).toEqual({});
      expect(adminUserPasswordUpdate(user.token, 'newpassw0rd', 'newpassw0rd7')).toEqual({});
      expect(adminUserPasswordUpdate(user.token, 'newpassw0rd7', 'newpassw9rd7')).toEqual({});
    });
  });

  describe('Success case for v1 route', () => {
    test('Check for successful password change', () => {
      expect(adminUserPasswordUpdateV1(user.token, 'passw0rd', 'newpassw0rd')).toEqual({});
      expect(adminUserPasswordUpdateV1(user.token, 'newpassw0rd', 'newpassw0rd7')).toEqual({});
      expect(adminUserPasswordUpdateV1(user.token, 'newpassw0rd7', 'newpassw9rd7')).toEqual({});
    });
  });
});

describe('Test for adminAuthLogout', () => {
  let user: AuthRegisterReturn;
  beforeEach(() => {
    user = adminAuthRegister('email@gmail.com', 'passw0rd', 'first-name', 'last-name');
  });

  describe('Error cases', () => {
    test('check if token is valid', () => {
      expect(() => adminAuthLogout('asdfghjk')).toThrow(HTTPError[401]);
    });

    test('check if token is not an empty string', () => {
      expect(() => adminAuthLogout('')).toThrow(HTTPError[401]);
    });
  });

  describe('Success cases', () => {
    test('Check for successful password change', () => {
      expect(adminAuthLogout(user.token)).toEqual({});
    });
  });

  describe('Success cases for v1 route', () => {
    test('Check for successful password change', () => {
      expect(adminAuthLogoutV1(user.token)).toEqual({});
    });
  });
});
