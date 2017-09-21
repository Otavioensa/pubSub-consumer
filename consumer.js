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
    .then((channel) => Promise.map(queues, (queue) => setConsumers(channel, queue)))
};

const setConsumers = (channel, queue) => {

  const queueName = queue.queue;
  const topic = queue.topic;
  const uri = queue.endpoint;
  const assertExchangeOptions = { durable: true };
  const assertQueueOptions = { exclusive: false };

  const sendToSubscriber = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());
    const payload = {
      url: uri,
      method: 'POST',
      json: parsedMsg
    };

    return request(payload)
      .then(() => channel.ack(msg))
      .catch(() => channel.reject(msg, false))
  };

  return channel.assertExchange(topic, 'fanout', assertExchangeOptions)
    .then(() => channel.assertQueue(queueName, assertQueueOptions))
    .then((queueOk) => channel.bindQueue(queueOk.queue, topic, '').then(() => queueOk.queue))
    .then((queue) => channel.consume(queue, sendToSubscriber, { noAck: false }));
};

const receiveNewQueues = () => {

  const address = config.rabbit.address;
  const newSubscribersQueue = config.rabbit.newSubscribersQueue;
  const consumerOptions = { noAck: false };

  const sendForListeningQueue = (msg) => {

    const parsedMsg = JSON.parse(msg.content.toString());

    const queueForListening = [{
      queue: parsedMsg.queueName,
      topic: parsedMsg.topic,
      endpoint: parsedMsg.endpoint;
    }];

    return listen(queueForListening);
  };

  return amqp.connect(address)
    .then((connection) => connection.createChannel())
    .then((channel) => channel.assertQueue(newSubscribersQueue))
    .then((queueOk) => channel.consume(queueOk.queue, sendForListeningQueue, consumerOptions))
};

module.exports = {
  listen: listen,
  receiveNewQueues: receiveNewQueues
};
