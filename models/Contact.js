'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const contactSchema = Schema( {
  userId: ObjectId,
  ownerEmail: String,
  firstName: String,
  lastName: String,
  email: String,
  contactWhen: Date,
  meetingLocation: String,
  company: String,
  otherNotes: String
});

module.exports = mongoose.model('ContactT1',contactSchema);
