'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Uiid = require('node-uuid');

const SubscribeSchema = new Schema({
  _id: { type: String, required: true },
  subject: { type: String, required: true },
  subscriber: { type: String, required: true }
},{
  collection: 'Subscribe',
  versionKey: false
});

SubscribeSchema.statics.getSubscribes = function () {

  return this.find() ;
};

module.exports = Mongoose.model('Subscribe', SubscribeSchema);
