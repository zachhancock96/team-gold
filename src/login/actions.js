import { api } from '../shared';
import { Route, navigateTo } from '../routes';

export const Actions = update => {
  const login = async ({name, email}) => {
    //start loading
    update({loading: true});

    await api.login({ name, email });
    const user = await api.getMe();

    update([
      navigateTo(Route.School()),
      {
        //done loading
        loading: false,

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

    update({loading: true});

    await api.logout();

    update([
      navigateTo(Route.Login()),
      {
        loading: false,
        
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