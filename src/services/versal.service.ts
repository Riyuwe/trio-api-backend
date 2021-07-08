import axios from 'axios';
import {config} from './../config';
import {User} from './../models/user.model';

export const VERSAL_API_ENDPOINT = 'https://stack.versal.com/api2';

export function versalRequest() {
  return axios.create({
    baseURL: `${VERSAL_API_ENDPOINT}`,
    headers: {SID: config.versal.SID},
  });
}

export function generateVersalId(user: User): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const userObj = {
        roles: ['learner'],
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullname: `${user.firstName} ${user.lastName}`,
        },
      };
      const apiRequest = versalRequest();
      apiRequest({
        url: `/orgs/${config.versal.OrgID}/users`,
        method: 'POST',
        data: JSON.stringify(userObj),
      })
        .then(response => {
          const {data} = response;
          const versalUserId = data?.user?.id || '';
          resolve(versalUserId);
        })
        .catch(err => {
          console.error(err);
          reject(null);
        });
    } catch (error) {
      console.error(error);
      reject(null);
    }
  });
}

export function createSession(user: User): Promise<Object> {
  return new Promise((resolve, reject) => {
    try {
      const userObj = {
        userId: user.versalUserID,
      };

      const apiRequest = versalRequest();
      apiRequest({
        url: '/sessions',
        method: 'POST',
        data: JSON.stringify(userObj),
      })
        .then(response => {
          const {data} = response;
          resolve({data});
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
