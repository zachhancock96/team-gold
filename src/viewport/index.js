const getDevice = () => {
  return window.innerWidth <= 800? 'mobile': 'desktop';
}

const watchDeviceChange = ({ states, update }) => {
  window.addEventListener('resize', () => {
    const { device: oldDevice } = states();
    const newDevice = getDevice();
    if (oldDevice != newDevice) {
      update({ device: newDevice });
    }
  });
}

export const viewport = {
  getDevice,
  watchDeviceChange
};