import {Actions} from './actions';
export { Toast } from './view';

const watchToastChange = ({ states, update }) => {
  setInterval(() => {
    const now = Date.now();
    const { toasts } = states();
    const newToasts = toasts.filter(t => t.expiresAt > now);

    if (newToasts.length !== toasts.length) {
      update({ toasts: newToasts }); 
    }
  }, 500);
}

export const toast = {
  Actions,
  watchToastChange
}