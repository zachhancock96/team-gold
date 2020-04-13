import {Actions} from './actions';
export { Toast } from './view';

const watchToastChange = ({ states, update }) => {
  setInterval(() => {
    const now = Date.now();
    const { toasts } = states();

    update({ toasts: toasts.filter(t => t.expiresAt > now) });
  }, 500);
}

export const toast = {
  Actions,
  watchToastChange
}