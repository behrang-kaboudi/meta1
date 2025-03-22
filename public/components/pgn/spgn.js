// const { Chess } = require("chess.js");

function Spgn(parentId, gbd) {
    pgv = this;
    pgv.pgn;
    pgv.startFen = null;
    pgv.canClick = false;
    pgv.gbd = gbd;
    pgv.moveIndex = 0;
    pgv.navigationIndex = 0;
    pgv.parent = document.getElementById(parentId);
    pgv.mainDiv;
    pgv.initial = function() {
        pgv.setupMainDiv();
        pgv.setupHeader();
        pgv.setupMoveParts();
    };
    pgv.setupMainDiv = function() {
        pgv.mainDiv = document.createElement('div');
        pgv.mainDiv.classList.add('spgn-maindiv', 'd-flex', 'flex-column');
        pgv.parent.appendChild(pgv.mainDiv);
        pgv.mainDiv.style.width = pgv.mainDiv.style.height = '100%';
    };
    pgv.setupHeader = function() {
        pgv.hearder = document.createElement('div');
        pgv.mainDiv.appendChild(pgv.hearder);
        pgv.hearder.classList.add(
            'spgn-header',
            'd-flex',
            'justify-content-evenly'
        );
        let startPos = document.createElement('span');
        startPos.innerHTML = '<i class="fad fa-angle-double-left"></i>';
        startPos.classList.add('px-2', 'flex-fill', 'text-center');
        pgv.hearder.appendChild(startPos);
        startPos.addEventListener('click', function(e) {
            pgv.navigationIndex = -1;
            pgv.removeMasks();
            pgv.doMove();
        });
        let preMove = document.createElement('span');
        preMove.innerHTML = '<i class="fas fa-angle-left"></i>';
        preMove.classList.add('px-2', 'flex-fill', 'text-center');
        pgv.hearder.appendChild(preMove);
        preMove.addEventListener('click', function(e) {
            if (pgv.navigationIndex == -1) return;
            pgv.navigationIndex--;
            if (pgv.navigationIndex + 1 > 0) {
                let m = document.querySelector('.' + parentId + (pgv.navigationIndex + 1));
                pgv.setMask(m);
            } else {
                pgv.removeMasks();
            }
            pgv.doMove();
        });
        let nextMove = document.createElement('span');
        nextMove.innerHTML = '<i class="fas fa-angle-right"></i>';
        nextMove.classList.add('px-2', 'flex-fill', 'text-center');
        pgv.hearder.appendChild(nextMove);
        nextMove.addEventListener('click', function(e) {
            if (pgv.navigationIndex == pgv.moveIndex - 1) return;
            let m = document.querySelector('.' + parentId + (pgv.navigationIndex + 2));
            pgv.setMask(m);
            pgv.navigationIndex++;
            pgv.doMove();
        });
        let endPos = document.createElement('span');
        endPos.innerHTML = '<i class="fad fa-angle-double-right"></i>';
        endPos.classList.add('px-2', 'flex-fill', 'text-center');
        pgv.hearder.appendChild(endPos);
        endPos.addEventListener('click', function(e) {
            pgv.navigationIndex = pgv.moveIndex - 1;
            let m = document.querySelector('.' + parentId + (pgv.navigationIndex + 1));
            pgv.setMask(m);
            pgv.doMove();
            // pgv.doMove();
        });
    };
    pgv.setupMoveParts = function() {
        pgv.movePart = document.createElement('div');
        pgv.movePart.classList.add('spgn-move-parts', 'd-flex');
        pgv.mainDiv.appendChild(pgv.movePart);
        pgv.moveCounter = document.createElement('div');
        pgv.moveCounter.classList.add(
            'move-counter',
            'text-center',
            'flex-column'
        );
        pgv.movePart.appendChild(pgv.moveCounter);
        pgv.whiteMoves = document.createElement('div');
        pgv.whiteMoves.classList.add('white-moves', 'text-center', 'flex-column');
        pgv.movePart.appendChild(pgv.whiteMoves);
        pgv.blackMoves = document.createElement('div');
        pgv.blackMoves.classList.add('black-moves', 'text-center', 'flex-column');
        pgv.movePart.appendChild(pgv.blackMoves);
    };
    pgv.setPgn = function(moves) {
        pgv.reset();
        pgv.pgn = moves;
        let chess = new Chess();
        if (pgv.startFen) {
            chess = new Chess(pgv.startFen);
        }
        for (let i = 0; i < moves.length; i++) {
            let mv = moves[i];
            if (mv) {
                mv = JSON.parse(mv);
                if (chess.turn() == 'w') {
                    pgv.moveIndex++;
                    pgv.creatMoveCounter();
                    let m = chess.move(mv);
                    pgv.creatMove('w', m.san, i);
                } else {
                    pgv.moveIndex++;
                    let m = chess.move(mv);
                    pgv.creatMove('b', m.san, i);
                }
            }
        }
        pgv.navigationIndex = pgv.moveIndex - 1;
        let m = document.querySelector('.' + parentId + (pgv.navigationIndex + 1));
        pgv.setMask(m);
    };
    pgv.setPgnFromEngin = function(engin) {
        let moves = engin.history({
            verbose: true
        });
        pgv.reset();
        pgv.pgn = moves;;
        if (moves[0].color == 'b') {
            pgv.creatNullMove('w', 0);
            pgv.moveIndex++;
            pgv.creatMoveCounter();

        }
        while (engin.undo()) {};
        pgv.startFen = engin.fen();
        for (let i = 0; i < moves.length; i++) {
            let mv = moves[i];
            engin.move(mv);
            pgv.moveIndex++;
            if (mv) {
                if (mv.color == 'w') {
                    pgv.creatMoveCounter();
                    pgv.creatMove('w', mv.san, i);
                } else {
                    // pgv.moveIndex++;
                    pgv.creatMove('b', mv.san, i);
                }
            }
        }
        pgv.navigationIndex = pgv.moveIndex - 1;
        let m = document.querySelector('.' + parentId + (pgv.navigationIndex + 1));

        pgv.setMask(m);
    };
    pgv.reset = function() {
        pgv.pgn = [];
        pgv.moveIndex = 0;
        pgv.moveCounter.innerText = '';
        pgv.whiteMoves.innerText = '';
        pgv.blackMoves.innerText = '';
    };
    pgv.creatMoveCounter = function() {
        let number = document.createElement('div');
        pgv.moveCounter.appendChild(number);
        number.innerText = Math.round(pgv.moveIndex / 2);
    };
    pgv.creatMove = function(side, strMove, navIndex) {
        let part = side == 'w' ? pgv.whiteMoves : pgv.blackMoves;
        let move = document.createElement('div');
        move.classList.add(parentId + 'MoveClass');
        move.classList.add(parentId + pgv.moveIndex);
        part.appendChild(move);
        move.innerText = strMove;
        move.addEventListener('click', function(e) {
            pgv.setMask(move);
            pgv.navigationIndex = navIndex;
            pgv.doMove();
        });
    };
    pgv.creatNullMove = function(side, navIndex) {
        let part = side == 'w' ? pgv.whiteMoves : pgv.blackMoves;
        let move = document.createElement('div');
        move.classList.add(parentId + 'MoveClass');
        move.classList.add(parentId + pgv.moveIndex);
        part.appendChild(move);
        move.innerText = '---';
        // move.addEventListener('click', function(e) {
        //     pgv.setMask(move);
        //     pgv.navigationIndex = navIndex;
        //     pgv.doMove();
        // });
    };
    pgv.setMask = function(node) {
        if (node) {
            pgv.removeMasks();
            node.classList.add('clicked-move')
        }

    }
    pgv.removeMasks = function() {
        let allMoves = document.querySelectorAll('.' + parentId + 'MoveClass');
        for (let index = 0; index < allMoves.length; index++) {
            const element = allMoves[index];
            element.classList.remove('clicked-move');

        }
    }
    pgv.doMove = function() {
        pgv.gbd.removeMasks();
        if (!pgv.canClick) return;
        moves = pgv.pgn;


        let chess = new Chess();
        if (pgv.startFen) chess = new Chess(pgv.startFen);
        if (pgv.navigationIndex == -1) {
            pgv.gbd.setPosition(chess.fen());
        }
        for (let i = 0; i < moves.length; i++) {
            let mv = moves[i];

            if (mv) {
                if (typeof mv == 'string')
                    mv = JSON.parse(mv);
                chess.move(mv);

                if (i == pgv.navigationIndex) {
                    pgv.gbd.setPosition(chess.fen());

                }
            }
        }

    };
}