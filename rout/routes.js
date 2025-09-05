const list = [
  //   require('./webhook'),
  require('./mainRout'),
  require('./sabet'),
  require('./tool'),
  require('./static'), //???????????????
  require('./user'),
  require('./admin'),

  require('./game'),
  require('./puzzle'),
  require('./swiss'),
  require('./simull'),
];

// app.get('/livegames/', (req, res) => {
//   res.render(config.get('template') + '/page/game/games/liveGames', {
//
//   });
// });
// فقط برای dev هشدار بده
//todo study why
// try {
//   require('./_dev-check').warnIfUnregistered(list);
// } catch {}
module.exports = list;
