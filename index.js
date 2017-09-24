'use strict';

const database = require('./db');
const consumer = require('./consumer');

return database.connect()
  .then(() => consumer.start());
