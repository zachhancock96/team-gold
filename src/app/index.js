import React from 'react';

import { Initial } from './initial';
import { login } from '../login';
import { school } from '../school';
import { calendar } from '../calendar';
import { toast } from '../toast';
import { routes } from '../routes';
import { loading } from '../loading';
import { Root } from '../root';

// export const createApp = async () => {
//   const initial = await Initial();

//   return {
//     initial,
//     Actions: update => Object.assign(
//       {},
//       routes.Actions(update),
//       login.Actions(update),
//       school.Actions(update),
//       game.Actions(update),
//     ),
//     services: [routes.service, login.service, school.service, calendar.service, game.service],
//     effects: [routes.effect, school.effect, calendar.effect, game.effect],
//     view: Root
//   };
// }

export const createApp = async () => {
  const initial = await Initial();

  return {
    initial,
    Actions: update => Object.assign(
      {},
      routes.Actions(update),
      loading.Actions(update),
      toast.Actions(update)
    ),
    services: [routes.service],
    effects: [routes.effect],
    view: Root
  };
}