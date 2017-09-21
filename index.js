'use strict';

const consumer = require('./consumer');
const promise = require('bluebird');

return Promise.all([
  consumer.listen([]),
  consumer.receiveNewQueues
]);
