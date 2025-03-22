const { express } = require('./mainRout')
const config = require('config');
const rout = express.Router();
//pages
rout.get('/editor/', (req, res) => {
    res.render(config.get('template') + '/page/tool/bd2', { user: req.user });
});
rout.get('/editor/bd1', (req, res) => {
    res.render(config.get('template') + '/page/tool/bd1');
});

rout.get('/analysis/', (req, res) => {
    res.render(config.get('template') + '/page/tool/analysis', { user: req.user });
});
rout.get('/search/', (req, res) => {
    res.render(config.get('template') + '/page/tool/search', { user: req.user });
});
module.exports = rout;