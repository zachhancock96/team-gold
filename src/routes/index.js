import { Actions } from 'meiosis-routing/state';
import { service, effect } from './service';
export { navigateTo } from "meiosis-routing/state"
export { Route, routeConfig, redirect } from './routes';

export const routes = {
  Actions,
  service,
  effect
}