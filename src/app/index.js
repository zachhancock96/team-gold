import { Initial } from './initial';
import { login } from '../login';
import { school } from '../school';
import { calendar } from '../calendar';
import { routes } from '../routes';
import { Root } from '../root';

export const createApp = async () => {
  const initial = await Initial();

  return {
    initial,
    Actions: update => Object.assign(
      {},
      routes.Actions(update),
      login.Actions(update),
      school.Actions(update),
    ),
    services: [routes.service, login.service, school.service, calendar.service],
    effects: [routes.effect, school.effect, calendar.effect],
    view: Root
  };
}