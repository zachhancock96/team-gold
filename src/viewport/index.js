const getDevice = () => {
  return window.innerWidth <= 800? 'mobile': 'desktop';
}

const watchDeviceChange = ({ states, update, actions }) => {
  window.addEventListener('resize', () => {
    const { device: oldDevice } = states();
    const newDevice = getDevice();

    if (oldDevice != newDevice) {
      actions.showMessage(newDevice == 'desktop'? 'Switching to desktop view.': 'Switching to mobile view. Some features may not be available.');
      update({ device: newDevice });
    }
  });
}

export const viewport = {
  getDevice,
  watchDeviceChange
};