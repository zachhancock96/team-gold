import { routeTransition } from 'meiosis-routing/state';

export const service = ({previousState, state}) => (
  { routeTransition: () => routeTransition(previousState.route, state.route) }
);

export const effect = ({state, update}) => {
  if (state.redirect) {
    update({
      route: state.redirect,
      redirect: null,
    });
  }
}