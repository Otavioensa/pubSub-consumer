'use strict';

const promise = require('bluebird');
const config = require('../config');
const mongoose = require('mongoose');

promise.promisifyAll(mongoose);
mongoose.Promise = promise;

const connect = () => {

  const connectionString = `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;
  const options = {
    useMongoClient: true,
    poolSize: 5,
    connectTimeoutMS: 30000,
    keepAlive: 1000
  };

  return mongoose.connect(connectionString, options)
};

const disconnect = () => mongoose.disconnect();

module.exports = {
  connect: connect,
  disconnect: disconnect
};
