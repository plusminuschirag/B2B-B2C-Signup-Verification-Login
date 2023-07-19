const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./controller.logger');

require('dotenv').config();
dotenv.config({ path: path.join(__dirname, '..', 'configs', '.env') });

const mongoClient = {
  connect: async function () {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    logger.info('Database connected.');
  },
};

(async () => {
  await mongoClient.connect();
})();

module.exports = mongoClient;
