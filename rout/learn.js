const { express } = require('./mainRout')
const config = require('config');
const rout = express.Router();
//pages
rout.get('/basics/', (req, res) => {
    res.render(config.get('template') + '/page/learn/basic/basic', { user: req.user });
});
// rout.get('/editor/bd1', (req, res) => {
//     res.render(config.get('template') + '/page/tool/bd1');
// });

// rout.get('/analysis/', (req, res) => {
//     res.render(config.get('template') + '/page/tool/analysis', { user: req.user });
// });
// rout.get('/search/', (req, res) => {
//     res.render(config.get('template') + '/page/tool/search', { user: req.user });
// });
module.exports = rout;