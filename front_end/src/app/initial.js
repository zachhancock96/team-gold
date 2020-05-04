import { api } from 'shared';
import { router } from '../router';
import { viewport } from '../viewport';

export const Initial = async () => {
  const user = await api.getMe().catch(err => null);  
  return {
    user,
    route: router.initialRoute,
    device: viewport.getDevice(),
    toasts: []
  };
}