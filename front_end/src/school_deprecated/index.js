import { Initial } from './initial';
import { Actions } from './actions';
import { View } from './view'

export const createApp = async () => {
  return {
    initial: await Initial(),
    Actions
  };
}

export {
  View
};