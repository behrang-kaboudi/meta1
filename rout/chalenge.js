const { express, io } = require('./mainRout')
const config = require('config');
const chalenge = require('../module/chalenge/chalenge');
const userRout = require('./user');
const gameRout = require('./game');
const ut = require('../module/utility');
const rout = express.Router();

rout.get('/register/', (req, res) => {
  res.render(config.get('template') + '/page/user/register', {
    user: req.user,
  });
});
rout.io = {};
rout.ioF = async function (data, ack, userData) {
  if (!data) return;
  await rout.io[data.signal](data, ack, userData);
}
rout.io.opens = async function () {
  let chalenges = await getOpenChalenges();
  chalenges = JSON.parse(JSON.stringify(chalenges));
  for (let i = 0; i < chalenges.length; i++) {
    const ch = chalenges[i];
    ch.requesterUser = await userRout.io.getUserPublicData(ch.requsterUserName);
  }
  io.emit('openChalengs', chalenges);
}
rout.io.byFriends = async function (data, ack, userData) {
  let answer = await getChalenges(userData.userName);
  answer = JSON.stringify(answer);
  answer = JSON.parse(answer);
  for (let i = 0; i < answer.length; i++) {
    const chal = answer[i];
    let user = await userRout.io.getUserPublicData(chal.requsterUserName);

    chal.requsterData = user;
    chal.timeControll = ut.gameTimeControll(chal);
  }
  ack(answer);
}
rout.io.cancel = async function (data, ack, userData) {
  let answer = await chalenge.updateOne({ _id: data.id }, { $set: { status: 'rejected' } });
  answer = await chalenge.findById(data.id);
  // io.to(answer.opponentUserName).emit('chalengeReq', 'chalengeReq');
  ack(answer);
}
rout.io.accept = async function (data, ack, userData) {
  if (!userData.userName) {
    ack(false);
    return;
  }
  let dbChalenge = await chalenge.findOne({ _id: data.id });
  if (userData.userName == dbChalenge.requsterUserName) {
    await chalenge.updateOne({ _id: data.id }, { $set: { status: 'abort' } })
    io.emit('openChalengsUpdate');
    ack(false);
    return;
  }
  await acceptChalenge(userData, data.id, ack)
}
async function acceptChalenge(accepterUserData, chalengeId, ack) {
  await chalenge.updateOne({ _id: chalengeId },
    { $set: { status: 'accepted', opponentUserName: accepterUserData.userName } }
  )

  let dbChalenge = await chalenge.findOne({ _id: chalengeId });
  let gm = await gameRout.io.createNewFromChalenge(dbChalenge);
  let page = '/game/play/' + gm._id;
  io.to('user-' + dbChalenge.requsterUserName).emit('goToPlayPage', page);
  io.emit('newGameCreated', gm);
  io.emit('openChalengsUpdate');
  ack(gm);
}


rout.io.create = async function (data, ack, userData) {
  data.chalenge.requsterUserName = userData.userName;
  let openChaleng = false;
  await cancelChalenges(data.chalenge.requsterUserName);
  if (!('opponentUserName' in data.chalenge)) {
    openChaleng = true;
    let preSameChaleng = await getSameOpenChalenge(data.chalenge.requsterUserName, data.chalenge);
    if (preSameChaleng) {
      acceptChalenge(userData, preSameChaleng.id, ack);
      return;
    }
  }
  let answer = await creatChalenge(data.chalenge);
  io.to('user-' + data.chalenge.opponentUserName).emit('chalengeReq', 'chalengeReq');
  ack(answer);
  if (openChaleng) {
    io.emit('openChalengsUpdate');
  }
}

async function cancelChalenges(userName) {
  let chalenges = await chalenge.find({
    requsterUserName: userName,
    status: 'waiting',
  });
  chalenges.forEach(async chalenge => {
    chalenge.status = 'rejected';
    await chalenge.save();
  });
};

async function creatChalenge(data) {
  await chalenge.rejectOldChalenges(data);
  let dbChalenge = await chalenge.createNew(data);
  return dbChalenge;
};
async function getSameOpenChalenge(requesterUserName, data) {
  let colorFilter = {};
  if (data.selectedColor == 'wb') {
    colorFilter = { $in: ['w', 'b', 'wb'] }
  }
  else {
    colorFilter = { $ne: data.selectedColor }
  }
  let ch = await chalenge.findOne({
    gameTimeMins: data.gameTimeMins,
    gameTimeSecs: data.gameTimeSecs,
    timeIncresment: data.timeIncresment,
    rated: data.rated,
    selectedColor: colorFilter,
    requsterUserName: { $ne: data.requsterUserName },
    status: 'waiting',
  });
  return ch;
};
async function getOpenChalenges() {
  let chalenges = await chalenge.find({
    status: 'waiting', opponentUserName: ''
  });
  return chalenges;
};
async function getChalenges(userName) {
  let chalenges = await chalenge.find({
    opponentUserName: userName,
    status: 'waiting',
  });
  return chalenges;
};




module.exports = rout;
