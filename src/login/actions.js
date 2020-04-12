import { api } from '../shared';
import { Route, navigateTo } from '../routes';

export const Actions = update => {
  const login = async ({email, password}) => {
    //start loading
    update({loading: { login: true }});

    try {
      await api.login({ email, password })
    } catch(error) {
      alert(error);
      update({loading: { login: false }});
      return;
    }

    let user;
    try {
      user = await api.getMe();
    } catch(error) {
      alert(error);
      update({loading: { login: false }});
      return;
    }
    
    update([
      navigateTo(Route.School()),
      {
        //done loading
        loading: { login: false },

        //set user in state
        user
      }
    ]);
  };

  const updateLoginForm = (field, value) => {
    update({ login: { form: { [field]: value } } });
  };

  const logout = async () => {
    //start loading

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

  return {
    login,
    logout,
    updateLoginForm
  };
}