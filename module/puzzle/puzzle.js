const fs = require('fs');
const readline = require('readline');
const pgnParser = require('pgn-parser');
const { number, string } = require('joi');
const { Chess } = require('chess.js');
const mongoose = require('mongoose');
const c = require('config');
const puzzleSchema = new mongoose.Schema({
    rating: Number, // for Tournament Names And ........
    fen: { type: String, unique: true, trim: true },
    pgn: String,
    tags: String
});
const Puzzle = mongoose.model('Puzzle', puzzleSchema);
Puzzle.creatNewPuzzle = async function (puzzleObj) {
    let dbp = new Puzzle(puzzleObj);
    dbp = await dbp.save();
    return dbp;
};
Puzzle.getNewPuzzle = async function (fens) {
    let puzzle = await Puzzle.findOne({ fen: { $nin: fens } });
    let rtPuzzlle = {};
    rtPuzzlle = JSON.stringify(puzzle);
    rtPuzzlle = JSON.parse(rtPuzzlle);
    rtPuzzlle.pgnObj = parsePgnToObject(rtPuzzlle.pgn);
    return rtPuzzlle;
}
Puzzle.putPuzzlesInDb = function (file) {
    const fileStream = fs.createReadStream(file, 'utf8');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let game = '';

    rl.on('line', function (line) {
        if (line.includes('[Event')) {
            if (game) {
                putPgnToDb(game);
                game = '';
                game += line;
            } else {
                game += line;
            }
        } else {
            game += line;
        }
    });
    rl.on('close', function () {
        putPgnToDb(game);
    });


};

function putPgnToDb(pgn) {

    let pgnObj = parsePgnToObject(pgn);
    if (pgnObj) {
        let puzzleObj = creatPuzzleObjectFromPgnParser(pgnObj, pgn);
        if (puzzleObj) Puzzle.creatNewPuzzle(puzzleObj);
        // console.log(puzzleObj);
    }
}

function parsePgnToObject(pgn) {
    let data = pgn.replace(/(\r\n|\r|\n)/g, '\n').trim();
    // data = data.replace('\n\n', '\n').trim();
    let dotsFlag = false
    if (data.includes('...')) {
        dotsFlag = true;
        let index = data.indexOf('. ...');
        let num = data[index - 1];
        let num2 = data[index - 2];
        let num3 = data[index - 3];
        if (parseInt(num2)) {
            num = num2 + num;
            if (parseInt(num3)) {
                num = num3 + num;
            }
        }

        data = data.replace(num + '. ... ', '\n');

    }
    // console.log(data);
    // 
    // data = '[Event "?"][Site "?"][Date "2021.06.01"][Round "?"][White "?"][Black "?"][Result "*"][Annotator "Pro,Macbook"][SetUp "1"][FEN "8/5P2/8/8/1k6/4K3/p7/8 w - - 0 0"][PlyCount "4"][SourceVersionDate "2021.06.01"]{[#]} 1. f8=Q+ {rating = 1095,tags = endgame mate mateIn2 short} Kb3 2. Kd3a1=Q * ';
    try {
        const [result] = pgnParser.parse(data);
        return result;
    } catch (er) {
        return false;
    }
}

function creatPuzzleObjectFromPgnParser(result, pgn) {
    let puzzleObj = {
        fen: '',
        rating: 0,
        pgn,
        tags: ''
    }

    function getParts(comment) {
        let parts = comment.text.split(',');
        puzzleObj.rating = parseInt(parts[0].split('=')[1].trim());
        puzzleObj.tags = parts[1].split('=')[1].trim();
    }

    result.headers.forEach(element => {
        if (element.name == 'FEN') puzzleObj.fen = element.value.trim()
    });
    e.log(result);
    if (result.comments && result.comments.length) {
        result.comments.forEach(element => {
            if (element.text.indexOf("rating") > -1) {
                getParts(element);
            }
        })
    } else {
        for (let index = 0; index < result.moves.length; index++) {
            const element = result.moves[index];
            if (element.comments && element.comments.length) {
                for (let index2 = 0; index2 < element.comments.length; index2++) {
                    const element2 = element.comments[index2];
                    if (element2.text.indexOf("rating") > -1) {
                        getParts(element2);
                    }
                }
            }
        }
    }
    return puzzleObj;
}

module.exports = Puzzle;