const mongoose = require('mongoose');
const staticSchema = new mongoose.Schema({
    title: String,
    content: String,
});
const Static = mongoose.model('Static', staticSchema);
// Chalenge.createNew = async function (chalenge) {
//     chalenge.reqTime = Date.now();
//     let dbChalenge = new Chalenge(chalenge);
//     return dbChalenge.save();
// };
// Chalenge.rejectOldChalenge = async function (newChalenge) {
//     let update = await Chalenge.updateMany(
//         {
//             requsterUserName: newChalenge.requsterUserName,
//             opponentUserName: newChalenge.opponentUserName,
//             status: 'waiting',
//         },
//         { $set: { status: 'rejected' } }
//     );
// };
module.exports = Static;
