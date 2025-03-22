
const mongoose = require('mongoose');
const userRout = require('../../rout/user');
const gameRout = require('../../rout/game')
//todo set gameIds as objectId
const gameIdSchema = new mongoose.Schema({ rd: Number, gameIds: { type: [String], default: [] } });
const swissSchema = new mongoose.Schema({
    title: String,
    maxRound: { type: Number, default: 1 },
    startTime: Number,//todo remove this from all fromts and end and change db script
    rdStartTimes: { type: [Number] },
    registerTime: Number,
    fee: Number,
    gameDuration: { type: Number, default: 60 }, // in seconds
    extraTime: { type: Number, default: 1 }, // in seconds
    restTime: { type: Number, default: 1 }, //in min
    regulation: String,
    players: { type: [String], default: ['behrang', 'beh', 'beh2', 'seyedbehrangKaboudi'] },
    // players: { type: [String], default: ['beh3', 'beh', 'beh1'] },
    //players: { type: [String] },
    round: { type: Number, default: 0 },
    // pairingMode: { type: Boolean, default: false },
    status: { type: String, enum: ['finished', 'closed', 'open'], default: 'open' },
    inUse: { type: Boolean, default: false },
    creator: { type: String, default: 'Admin' },
    /// todo add preGames to hear
    // rdGames: [gameIdSchema]
    //  players: {
    //     type: [String],
    //     default: []
    // },
});
const Swiss = mongoose.model('Swiss', swissSchema);
Swiss.api = {};


Swiss.api.getTournamentById = async function (id) {
    return await Swiss.findById(id);
};
/**
 * 
 * db : update For Pairing Mode
 * @param {number} id tournament id.
 * @return {false} x ther is notTour.
 * @return {tour} tour ForPairing .
 */
Swiss.api.getForPairing = async function (id) {
    let t = await Swiss.updateOne({ _id: id, pairingMode: false }, { $set: { pairingMode: true } });
    if (t.nModified == 1) {
        let tour = await Swiss.api.getTournamentById(id);
        return tour;
    }
    return false;
};

Swiss.getNotStartedTounnaments = async function () {
    return await Swiss.find();
}
// Swiss.timeToStartTour = (tour) => {
//     let t = tour.startTime - Date.now();
//     let payment = 1; // todo
//     let startTime = t - payment;
//     return startTime;
// }
// Swiss.pairing = {};
// Swiss.pairing.firstRound = async function(tour) {
//     Swiss.pairing.putPlayerInDb(tour);

// }



// module.exports = Swiss.api;
module.exports = Swiss;
