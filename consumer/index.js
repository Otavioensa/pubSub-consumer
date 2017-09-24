'use strict';

const consumer = require('./consumer');
const promise = require('bluebird');
const subscriberModel = require('./models/subscriberModel');

module.exports.start = () => {

  return subscriberModel.getSubscribes()
    .then((subscribers) => Promise.all([
      consumer.receiveNewQueues(),
      consumer.listen(subscribers)
    ]))
    .catch((error) => console.log(error));
};
