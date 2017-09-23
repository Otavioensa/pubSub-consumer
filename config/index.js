'use strict';

const rabbit = {
  address: process.env.rabbbitAddress || 'amqp://localhost',
  newSubscribersQueue: process.env.newSubscribersQueue || 'newSubscribersQueue',
  exchange: process.env.exchange || 'ApplicationExchange'
};

module.exports = {
  rabbit: rabbit
};
