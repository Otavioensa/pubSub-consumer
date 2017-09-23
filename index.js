'use strict';

const consumer = require('./consumer');
const promise = require('bluebird');

return consumer.receiveNewQueues();
