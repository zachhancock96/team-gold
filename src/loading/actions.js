export const Actions = update => {

  const showLoading = id => {
    update({
      loading: {
        [id]: true
      }
    });
  };

  const hideLoading = id => {
    update({
      loading: {
        [id]: undefined
      }
    });
  };

  return {
    showLoading,
    hideLoading
  };
}