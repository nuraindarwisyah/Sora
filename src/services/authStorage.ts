
import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'sora_auth';
const USER_SERVICE = 'sora_user';

export type StoredUser = {
  id?: number;
  name: string;
  email: string;
};

export const saveToken = async (token: string): Promise<void> => {
  await Keychain.setGenericPassword('access_token', token, {
    service: TOKEN_SERVICE,
  });
};

export const getToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({
    service: TOKEN_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return credentials.password;
};

export const removeToken = async (): Promise<void> => {
  await Keychain.resetGenericPassword({
    service: TOKEN_SERVICE,
  });
};

export const saveUser = async (user: StoredUser): Promise<void> => {
  await Keychain.setGenericPassword('user_profile', JSON.stringify(user), {
    service: USER_SERVICE,
  });
};

export const getUser = async (): Promise<StoredUser | null> => {
  const credentials = await Keychain.getGenericPassword({
    service: USER_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  try {
    return JSON.parse(credentials.password) as StoredUser;
  } catch {
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  await Keychain.resetGenericPassword({
    service: USER_SERVICE,
  });
};
