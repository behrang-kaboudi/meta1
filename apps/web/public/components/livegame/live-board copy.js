// const { set } = require("mongoose");

function liveBoard(gameId, parentId) {
    let table = {};
    table.engine = table.game = null;
    table.parent = document.getElementById(parentId);
    table.parent.onclick = function() {
        window.open('/game/play/' + gameId, '_blank').focus();
    };
    table.parent.classList.add('pointer');

    table.id = gameId;
    table.blackTimeIntervall;
    table.blackReamainingTime;
    table.whiteTimeIntervall;
    table.whiteReamainingTime;
    table.engine = null;

    table.game = {};
    // init top
    table.top = document.createElement("div");
    table.parent.appendChild(table.top);
    // init board
    table.boardPart = document.createElement("div");
    table.boardPart.id = 'gbd' + gameId;
    table.parent.appendChild(table.boardPart);
    // init buttom
    table.buttom = document.createElement("div");
    table.parent.appendChild(table.buttom);
    setTop();
    setGbPart();
    setbuttom()
    $(document).ready(function() {
        socket.emit('newGameData', table.id);
        socket.io.on('reconnect', () => {
            socket.emit('newGameData', table.id);
        })
        socket.on('gameData', function(obj) {
            table.gameDataProcess(obj);
        });
    })
    table.gameDataProcess = function(obj) {
        table.game = obj.game;
        if (table.id != table.game._id) return;
        updateEngine();
        setTop();
        setGbPart(table.engine.fen())
        setbuttom();
    }

    function setGbPart(fen = null) {
        table.gbd = new BkBoard(table.boardPart.id, {
            imgSrc: '/components/bk-chessboard/pices/'
        });
        // kGraphicalBoard.BkBoard(table.boardPart.id, {
        //     imgSrc: '/public/components/bk-chessboard/pices/'
        // });
        if (fen) {
            table.gbd.setPositionMulti(fen)
        }
        table.gbd.creatBoard();
    }

    function setTop() {
        clearInterval(table.blackTimeIntervall)
        table.top.innerHTML = ''
        table.top.classList.add('mx-2');
        table.top.classList.add('d-flex');
        table.top.classList.add('justify-content-between');
        let namePart = document.createElement('span');
        namePart.innerHTML = table.game.blackUserName;

        table.top.appendChild(namePart);

        if (table.game.blackResult !== null) {
            let resultPart = document.createElement('span');
            resultPart.innerHTML += ' ' + table.game.blackResult;
            table.top.appendChild(resultPart);
        }
        table.blackReamainingTime = table.game.blackRemainingTime;
        let timePart = document.createElement('span');
        timePart.innerHTML = sbkTimer.getTimeParts(table.blackReamainingTime / 1000).stringify;
        table.top.appendChild(timePart);
        if (table.game.blackResult || table.game.whiteResult || table.game.result) return;
        if (table.engine && table.engine.turn() == 'b') {
            table.blackTimeIntervall = setInterval(function() {
                table.blackReamainingTime -= 1000;
                timePart.innerHTML = sbkTimer.getTimeParts(table.blackReamainingTime / 1000).stringify;
                if (table.blackReamainingTime < 0) {
                    clearInterval(table.blackTimeIntervall);
                    socket.emit('newGameData', table.id);
                }
            }, 1000)
        }

        // table.top.innerHTML = table.game.blackUserName;

    }

    function setbuttom() {
        clearInterval(table.whiteTimeIntervall)
        table.buttom.innerHTML = ''
        table.buttom.classList.add('mt-2');
        table.buttom.classList.add('mx-2');
        table.buttom.classList.add('d-flex');
        table.buttom.classList.add('justify-content-between');
        let namePart = document.createElement('span');
        namePart.innerHTML = table.game.whiteUserName;
        table.buttom.appendChild(namePart);
        if (table.game.whiteResult !== null) {
            let resultPart = document.createElement('span');
            resultPart.innerHTML += ' ' + table.game.whiteResult;
            table.buttom.appendChild(resultPart);
        }
        table.whiteReamainingTime = table.game.whiteRemainingTime;
        let timePart = document.createElement('span');
        timePart.innerHTML = sbkTimer.getTimeParts(table.whiteReamainingTime / 1000).stringify;
        table.buttom.appendChild(timePart);
        if (table.game.blackResult || table.game.whiteResult || table.game.result) return;
        if (table.engine && table.engine.turn() == 'w') {

            table.whiteTimeIntervall = setInterval(function() {
                table.whiteReamainingTime -= 1000;

                timePart.innerHTML = sbkTimer.getTimeParts(table.whiteReamainingTime / 1000).stringify;
                if (table.whiteReamainingTime < 0) {
                    clearInterval(table.whiteTimeIntervall);
                    socket.emit('newGameData', table.id);
                }
            }, 1000)
        }
    }

    function updateEngine() {
        let gmMoves = table.game.gmMoves;
        table.engine = new Chess(table.game.startPosition);
        for (let i = 0; i < gmMoves.length; i++) {
            let mv = gmMoves[i];
            if (mv) {
                mv = JSON.parse(mv);
                table.engine.move(mv);
            }
        }
    };
    return table;
}