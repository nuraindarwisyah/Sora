
import {useQuery} from '@tanstack/react-query';

import api from '../services/api';

export type User = {
  id: number;
  name: string;
  email: string;
  [key: string]: unknown;
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      const response = await api.get('/user');
      return response.data;
    },
    enabled: false,
  });
};
