
import axios from 'axios';

import {getToken} from './authStorage';

const api = axios.create({
  baseURL: 'https://expenses-tracker-api-laravel.benova.com.my/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async config => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log(
        'API error:',
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.log('API network error:', error.message);
    } else {
      console.log('API request setup error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
