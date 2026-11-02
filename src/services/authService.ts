
import api from './api';
import {
  saveToken,
  removeToken,
  saveUser,
  removeUser,
} from './authStorage';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type AuthUser = {
  id?: number;
  name: string;
  email: string;
  [key: string]: unknown;
};

export type AuthResponse = {
  access_token: string;
  user?: AuthUser;
  [key: string]: unknown;
};

const saveAuthResponse = async (data: AuthResponse): Promise<void> => {
  if (!data.access_token) {
    throw new Error('The server did not return an access token.');
  }

  await saveToken(data.access_token);

  if (data.user?.name && data.user?.email) {
    await saveUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    });
  }
};

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', credentials);

  await saveAuthResponse(response.data);

  return response.data;
};

export const googleLogin = async (
  idToken: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/google-login', {
    id_token: idToken,
  });

  await saveAuthResponse(response.data);

  return response.data;
};

export const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/register', credentials);

  if (response.data.access_token) {
    await saveAuthResponse(response.data);
  }

  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.warn('Server logout request failed:', error);
  } finally {
    await removeToken();
    await removeUser();
  }
};
