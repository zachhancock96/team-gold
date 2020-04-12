import moment from 'moment-timezone';
moment.tz.setDefault('America/Chicago');

window.moment = moment;
export const API_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
export default moment;