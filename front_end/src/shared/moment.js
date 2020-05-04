import moment from 'moment-timezone';
moment.tz.setDefault('America/Chicago');

window.moment = moment;
export const API_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
export const API_DATE_FORMAT = 'YYYY-MM-DD';
export default moment;