const mongoose = require('mongoose');
const chalengeSchema = new mongoose.Schema({
  requsterUserName: String,
  opponentUserName: { type: String, default: '' },
  gameTimeMins: Number,
  gameTimeSecs: Number,
  timeIncresment: Number,
  selectedColor: String,
  reqTime: String,
  rated: Boolean,
  status: {
    type: String,
    default: 'waiting',
    enum: ['waiting', 'accepted', 'rejected', 'abort'],
  }, // accepted,rejected
});
const Chalenge = mongoose.model('Chalenge', chalengeSchema);

Chalenge.getFromLink = async function (link) {
  let dbUser = await Chalenge.findOne({ link: link });
  return dbUser;
};
Chalenge.createNew = async function (chalenge) {
  chalenge.reqTime = Date.now();
  let dbChalenge = new Chalenge(chalenge);
  return dbChalenge.save();
};
Chalenge.rejectOldChalenge = async function (newChalenge) {
  let update = await Chalenge.updateMany(
    {
      requsterUserName: newChalenge.requsterUserName,
      opponentUserName: newChalenge.opponentUserName,
      status: 'waiting',
    },
    { $set: { status: 'rejected' } }
  );
};
Chalenge.rejectOldChalenges = async function (newChalenge) {
  // let update = await Chalenge.updateMany (
  //   {
  //     requsterUserName: newChalenge.requsterUserName,
  //     // opponentUserName: newChalenge.opponentUserName,
  //     status: 'waiting',
  //   },
  //   {$set: {status: 'rejected'}}
  // );
};
module.exports = Chalenge;
