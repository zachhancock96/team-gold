export const Actions = update => {

  const showSuccess = function(message, duration='short') {
    show(message, 'success', duration);
  };

  const showError = function(message, duration='short') {
    show(message, 'error', duration);
  }

  const showMessage = function(message, duration='short') {
    show(message, 'info', duration);
  }

  const show = function(message, type, duration) {
    const toast = {
      type,
      message,
      expiresAt: expireAtTimestamp(duration)
    }
    update({
      toasts: toasts => [toast, ...toasts]
    })
  }

  return {
    showSuccess,
    showError,
    showMessage
  }
}

const expireAtTimestamp = duration => Date.now() + (duration === 'short'? 3000: 6000);