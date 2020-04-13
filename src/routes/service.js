import { routeTransition } from 'meiosis-routing/state';
import { Route, redirect } from './routes';

export const service = ({previousState, state}) => {
  
  const trans = routeTransition(previousState.route, state.route);

  //Login page accessible only when not authenticated
  if (trans.arrive.Login) {
    if (state.user) {
      return {
        ...redirect(Route.School()),
        routeTransition: { arrive: { School: { } }, leave: { Login: { } } }
      }
    }
  }

  //Only login page accessible when not authenticated
  if (!state.user && Object.keys(trans.arrive).length > 0) {
    return {
      ...redirect(Route.Login()),
      routeTransition: { arrive: { Login: { } }, leave: { } }
    }
  }

  return {
    routeTransition: trans
  };
}
  

export const effect = ({state, update}) => {
  if (state.redirect) {
    update({
      route: state.redirect,
      redirect: null,
    });
  }
}