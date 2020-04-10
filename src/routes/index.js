import { Actions, createRouteSegments } from 'meiosis-routing/state';
import { service, effect } from './service';
export { navigateTo } from "meiosis-routing/state"

export const Route = createRouteSegments([
  "Login",
  "School",
  "Calendar",

  "Game",
  "AddGame",
  "ManageGames",
  "AllGames",
  "ApprovedGames",
  "PendingGames",
  "RejectedGames",
  "GameDetail"
]);

export const routeConfig = {
  Login: "/login",
  School: "/school/:id",
  Game: [
    "/game",
    {
      AddGame: "/add",
      ManageGames: [
        '',
        {
          AllGames: ['/all', { GameDetail: '/:id' } ],
          ApprovedGames: ["/approved", { GameDetail: '/:id' }],
          PendingGames: ['/pending', { GameDetail: '/:id' }],
          RejectedGames: ['/rejected', { GameDetail: '/:id'} ]
        }
      ]
    }
  ],
  Calendar: "/calendar",
};

export const routes = {
  Actions,
  service,
  effect
}

export const redirect = route => {
  return { redirect: Array.isArray(route)? route: [route] };
}