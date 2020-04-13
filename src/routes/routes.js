import { createRouteSegments } from 'meiosis-routing/state';

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
  "EditGame",
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
          AllGames: [
            '/all', 
            { 
              EditGame: '/edit/:id',
              GameDetail: '/:id' 
            } 
        ],
          ApprovedGames: [
            "/approved", 
            { 
              GameDetail: '/:id',
              EditGame: '/edit/:id',
            }
          ],
          PendingGames: [
            '/pending', 
            { 
              GameDetail: '/:id',
              EditGame: '/edit/:id',
            }
          ],
          RejectedGames: [
            '/rejected',
            { 
              GameDetail: '/:id'
            }
          ]
        }
      ]
    }
  ],
  Calendar: "/calendar",
};

export const redirect = route => {
  return { redirect: Array.isArray(route)? route: [route] };
}