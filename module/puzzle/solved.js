const mongoose = require('mongoose');
const c = require('config');
const solvedPuzzleSchema = new mongoose.Schema({
    userName: String, // for Tournament Names And ........
    fen: [String],
    solved: [Boolean]
});
const SolvedPuzzle = mongoose.model('SolvedPuzzle', solvedPuzzleSchema);
SolvedPuzzle.newSolved = async function(obj) {

    let userData = await SolvedPuzzle.findOne({ userName: obj.userName });
    if (!userData) {
        userData = new SolvedPuzzle()
        userData.userName = obj.userName
    }
    userData.fen.push(obj.fen.trim());
    userData.solved.push(obj.answer);
    await userData.save();
};
SolvedPuzzle.getSolvedPuzzles = async function(user) {
    let solved = await SolvedPuzzle.findOne({ userName: user });
    return solved;
}


// function putPgnToDb(pgn) {

//     let pgnObj = parsePgnToObject(pgn);
//     if (pgnObj) {
//         let SolvedPuzzleObj = creatSolvedPuzzleObjectFromPgnParser(pgnObj, pgn);
//         if (SolvedPuzzleObj) SolvedPuzzle.creatNewSolvedPuzzle(SolvedPuzzleObj);
//         // console.log(SolvedPuzzleObj);
//     }
// }


module.exports = SolvedPuzzle;