const { number } = require('joi');
const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    room: { type: String, enum:['swiss','game','users'] },
    userName: String,
    time:Number,
    to:String,/// id of user or tour or game
    text:String
});
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;