const moment = require('moment-timezone'); moment.tz.setDefault('America/Chicago');

module.exports = {
  FORMAT_DATE_TIME: 'YYYY-MM-DDTHH:mm:ssZ',
  FORMAT_DATE: 'YYYY-MM-DD',

  moment
};