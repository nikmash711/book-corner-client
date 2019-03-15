import {API_BASE_URL} from './config';
import {normalizeResponseErrors} from './utils';
import jwtDecode from 'jwt-decode';

//Clears local storage 
export const clearAuthToken = () => {
  try {
    console.log('clearing');
      localStorage.removeItem('authToken');
  } catch (e) {
    console.log('there was an error clearing auth token')
  }
};

//Load token from storage if it exists
export const loadAuthToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    console.log('there was an error retreiving auth token')
  }
};

/*Refreshes auth token*/
export const refreshAuthToken = () => {
  const authToken = loadAuthToken();
  return fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
  })
  .then(res => normalizeResponseErrors(res))
  .then(res => res.json())
  .then(({authToken}) => {
    storeAuthInfo(authToken);
    return authToken;
  })
  .catch(err => {
      // We couldn't get a refresh token because our current credentials are invalid or expired, or something else went wrong, so clear them and sign us out
      clearAuthToken(authToken);
  });
}; 

// Stores the auth token in localStorage, and decodes and stores the user data stored in the token
export const storeAuthInfo = (authToken) => {
  try {
    localStorage.setItem('authToken', authToken);
  } 
  catch (e) {
  }
};