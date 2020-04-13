import { api } from '../shared';
import { Route, navigateTo } from '../routes';

export const Actions = update => {

  //TODO: place this in seperate file, probably inside app folder
  const updateState = patch => {
    update(patch);
  };

  const logout = async () => {
    update({loading: { logout: true }});

    await api.logout();

    update([
      navigateTo(Route.Login()),
      {
        loading: { logout: false },
        
        user: null
      }
    ]);
  };

  return { logout, updateState };
}