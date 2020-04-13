import moment from 'moment-timezone';
moment.tz.setDefault('America/Chicago');
export default moment;

//e.g. 2020-03-17T08:00:00
export const DATETIME_FROM_API_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

//e.g. 2020-03-17T08:00:00-05:00
export const DATETIME_TO_API_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';