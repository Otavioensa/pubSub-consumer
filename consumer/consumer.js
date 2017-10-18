'use strict';

const amqp = require('amqplib');
const request = require('request-promise');
const config = require('../config');
const promise = require('bluebird');

const listen = (subscribers) => {

  const address = config.rabbit.address;

  return amqp.connect(address)
    .then((connection) => connection.createChannel())
    .then((channel) => promise.map(subscribers, (subscriber) => setConsumers(channel, subscriber)))
};

const setConsumers = (channel, subscriber) => {

  const exchange = config.rabbit.consumerExchange;
  const subject = subscriber.subject;
  const uri = subscriber.endpoint || subscriber.subscriber;
  const assertExchangeOptions = { durable: false };
  const assertQueueOptions = { exclusive: true };

  const sendToSubscriber = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());

    const payload = {
      url: uri,
      method: 'POST',
      json: parsedMsg
    };

    return request(payload)
      .then((result) => {
        console.log(result)
        return channel.ack(msg);
      })
      .catch((error) => {
        console.log(error.error);
        return channel.reject(msg, false);
      });
  };

  return channel.assertExchange(exchange, 'direct', assertExchangeOptions)
    .then(() => channel.assertQueue('', assertQueueOptions))
    .then((queueOk) => channel.bindQueue(queueOk.queue, exchange, subject).then(() => queueOk.queue))
    .then((queue) => channel.consume(queue, sendToSubscriber, { noAck: false }));
};

const receiveNewQueues = () => {

  const exchange = config.rabbit.exchange;
  const address = config.rabbit.address;
  const newSubscribers = config.rabbit.newSubscribersQueue;

  const consumerOptions = { noAck: true };
  const assertExchangeOptions = { durable: false };
  const assertQueueOptions = { exclusive: true };

  const sendForListeningQueue = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());

    const subscriber = [{
      subject: parsedMsg.subject,
      endpoint: parsedMsg.endpoint
    }];

    return listen(subscriber);
  };

  return amqp.connect(address)
    .then((connection) => connection.createChannel())
    .then((channel) => {
      return channel.assertExchange(exchange, 'fanout', assertExchangeOptions)
        .then(() => channel.assertQueue(newSubscribers, assertQueueOptions))
        .then((queueOk) => channel.bindQueue(queueOk.queue, exchange, newSubscribers).then((queueOk) => queueOk.queue))
        .then(() => channel.consume(newSubscribers, sendForListeningQueue, consumerOptions))
    });
};

module.exports = {
  receiveNewQueues: receiveNewQueues,
  listen: listen
};
