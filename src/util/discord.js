const axios = require('axios');
const logger = require('./logger');

const {USERNAME, WEBHOOK_URL} = process.env;

module.exports = {
  webhook: async message => {
    await axios.post(WEBHOOK_URL, {
      username: USERNAME,
      content: message,
    });
    logger.debug('Update sent to discord');
  },
};
