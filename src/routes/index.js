import { Actions, createRouteSegments } from 'meiosis-routing/state';
export { navigateTo } from "meiosis-routing/state"
import { service, effect } from './service';

export const Route = createRouteSegments([
  "Login",
  "School",
  "Game"
]);

export const routeConfig = {
  Login: "/login",
  School: "/school/:id",
  Game: "/game"
};

export const routes = {
  Actions,
  service,
  effect
}

export const redirect = route => {
  return { redirect: Array.isArray(route)? route: [route] };
}