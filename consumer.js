'use strict';

const amqp = require('amqplib');
const request = require('request-promise');
const config = require('./config');
const promise = require('bluebird');

//TODO: Tratamento de erros
const listen = (queues) => {

  const address = config.rabbit.address;

  return amqp.connect(address)
    .then((connection) => connection.createChannel())
    .then((channel) => promise.map(queues, (queue) => setConsumers(channel, queue)))
};

const setConsumers = (channel, data) => {

  const exchange = config.rabbit.exchange;
  const subject = data.subject;
  const uri = data.endpoint;

  const assertExchangeOptions = { durable: false };
  const assertQueueOptions = { exclusive: false };

  const sendToSubscriber = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());
    console.log(parsedMsg);

    const payload = {
      url: uri,
      method: 'POST',
      json: parsedMsg
    };

    return request(payload)
      .then((result) => {
        console.log(result);
        return channel.ack(msg);
      })
      .catch(() => channel.reject(msg, false))
  };

  return channel.assertExchange(exchange, 'direct', assertExchangeOptions)
    .then(() => channel.assertQueue(subject, assertQueueOptions))
    .then((queueOk) => channel.bindQueue(queueOk.queue, exchange, queueOk.queue).then(() => queueOk.queue))
    .then((queue) => channel.consume(queue, sendToSubscriber, { noAck: false }));
};

module.exports.receiveNewQueues = () => {

  const exchange = config.rabbit.exchange;
  const address = config.rabbit.address;
  const newSubscribers = config.rabbit.newSubscribersQueue;

  const consumerOptions = { noAck: true };
  const assertExchangeOptions = { durable: false };
  const assertQueueOptions = { exclusive: false };

  const sendForListeningQueue = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());

    console.log(parsedMsg);
    const queueForListening = [{
      subject: parsedMsg.subject,
      endpoint: parsedMsg.endpoint
    }];

    return listen(queueForListening);
  };

  return amqp.connect(address)
    .then((connection) => connection.createChannel())
    .then((channel) => {
      return channel.assertExchange(exchange, 'direct', assertExchangeOptions)
        .then(() => channel.assertQueue(newSubscribers, assertQueueOptions))
        .then((queueOk) => channel.bindQueue(queueOk.queue, exchange, newSubscribers).then((queueOk) => queueOk.queue))
        .then(() => channel.consume(newSubscribers, sendForListeningQueue, consumerOptions))
    });
};
