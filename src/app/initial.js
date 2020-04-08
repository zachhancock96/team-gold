import { api } from '../shared';
import { router } from '../router';
import { viewport } from '../viewport';

export const Initial = async () => {
  //const user = await api.getMe().catch(err => null);
  return {
    user: {
      id: 1,
      name: 'Donal Trumpkin',
      role: 'assignor',
      email: 'trumpkin@pumpkin.com'
    },
    route: router.initialRoute,
    device: viewport.getDevice()
  };
}