'use strict';

const rabbit = {
  address: process.env.rabbbitAddress || 'amqp://localhost',
  newSubscribersQueue: process.env.newSubscribersQueue || 'newSubscribersQueue',
  exchange: process.env.exchange || 'ApplicationExchange',
  consumerExchange: process.env.consumerExchange || 'ConsumerExchange'
};

const db = {
  host: process.env.mongo_host || 'localhost',
  port: process.env.mongo_port || '27017',
  database: process.env.mongo_database || 'develop'
};

module.exports = {
  rabbit: rabbit,
  db: db
};
