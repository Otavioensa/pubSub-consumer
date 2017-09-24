'use strict';

const Promise = require('bluebird');
const Config = require('../config');
const Mongoose = require('mongoose');

Promise.promisifyAll(Mongoose);
Mongoose.Promise = Promise;

const connect = () => {

  const connectionString = `mongodb://${Config.db.host}:${Config.db.port}/${Config.db.database}`;
  const options = {
    useMongoClient: true,
    poolSize: 5,
    connectTimeoutMS: 30000,
    keepAlive: 1000
  };

  return Mongoose.connect(connectionString, options)
};

const disconnect = () => Mongoose.disconnect();

module.exports = {
  connect: connect,
  disconnect: disconnect
};
