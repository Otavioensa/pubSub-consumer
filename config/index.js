'use strict';

const rabbit = {
  address: process.env.rabbbitAddress || 'amqp://localhost',
  newSubscribersQueue: process.env.newSubscribersQueue || 'newSubscribersQueue'
};

module.exports = {
  rabbit: rabbit
};
