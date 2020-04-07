import { Route, redirect } from '../routes';

export const service = ({state, previousState }) => {
  if (state.routeTransition.arrive.Login) {
    if (state.user) {
      return redirect(previousState.route || Route.School());
    }

    return {
      login: {
        form: {
          email: "",
          password: ""
        }
      }
    };
  }

  if (state.routeTransition.leave.Login) {

    return { login: null };
  }
}