// settings for all board objects
const bkChessBoardConsts = {
    timeForAnimation: function(sq1, sq2) {
        // return (
        //   (Math.abs (
        //     bkChessBoardConsts.getFileNum (sq1[0]) -
        //       bkChessBoardConsts.getFileNum (sq2[0])
        //   ) +
        //     Math.abs (parseInt (sq1[1]) - parseInt (sq2[1]))) *
        //   30
        // );
        return 0;
    },
    // new 
    chessMove: (bd, mvObj) => {
        // to do after each move from engin set fen of game in board settings
        let engin = new Chess(bd.settings.fen);
        let moves = engin.moves({ verbose: true });

        function setMove(mv) {
            engin.move(mv);
            bd.settings.fen = engin.fen();
        }

        // let mainM= false;
        for (let i = 0; i < moves.length; i++) {
            const mv = moves[i];
            if (mv.from == mvObj.from && mv.to == mvObj.to) {
                if ('promotion' in mvObj) {
                    setMove(mvObj);
                    bd.setPosition(bd.settings.fen);
                    return mv
                }
                if (mv.flags.includes('p')) {
                    bd.showPromotion(engin.turn());
                    // bd.showPromotion('b');
                } else {
                    setMove(mv);
                    if (mv.flags.includes('k') || mv.flags.includes('q') || mv.flags.includes('e')) {
                        bd.setPosition(bd.settings.fen);
                    }
                    return mv
                }
            }
        }
        return false;
    },
    getNumFile: function(num) {
        switch (num) {
            case 1:
                return 'a';
            case 2:
                return 'b';
            case 3:
                return 'c';
            case 4:
                return 'd';
            case 5:
                return 'e';
            case 6:
                return 'f';
            case 7:
                return 'g';
            case 8:
                return 'h';
        }
    },
    getFileNum: function(file) {
        switch (file) {
            case 'a':
                return '1';
            case 'b':
                return '2';
            case 'c':
                return '3';
            case 'd':
                return '4';
            case 'e':
                return '5';
            case 'f':
                return '6';
            case 'g':
                return '7';
            case 'h':
                return '8';
        }
    },
    getPiceCharFromName: function(pice) {
        switch (pice) {
            case 'bp':
                return 'p';
            case 'bn':
                return 'n';
            case 'bb':
                return 'b';
            case 'br':
                return 'r';
            case 'bq':
                return 'q';
            case 'bk':
                return 'k';
            case 'wp':
                return 'P';
            case 'wb':
                return 'B';
            case 'wn':
                return 'N';
            case 'wr':
                return 'R';
            case 'wq':
                return 'Q';
            case 'wk':
                return 'K';
            default:
                return '0';
        }
    },
    getPiceNameFromFen: function(pice) {
        switch (pice) {
            case 'p':
                return 'bp';
            case 'n':
                return 'bn';
            case 'b':
                return 'bb';
            case 'r':
                return 'br';
            case 'q':
                return 'bq';
            case 'k':
                return 'bk';
            case 'P':
                return 'wp';
            case 'B':
                return 'wb';
            case 'N':
                return 'wn';
            case 'R':
                return 'wr';
            case 'Q':
                return 'wq';
            case 'K':
                return 'wk';
        }
    },
    scroll: {
        preventDefault: function(e) {
            e.preventDefault();
        },
        wheelEvent: 'onwheel' in document.createElement('div') ?
            'wheel' : 'mousewheel',
        disableScroll: function() {
            var supportsPassive = false;
            try {
                window.addEventListener(
                    'test',
                    null,
                    Object.defineProperty({}, 'passive', {
                        get: function() {
                            supportsPassive = true;
                        },
                    })
                );
            } catch (e) {}
            var wheelOpt = supportsPassive ? { passive: false } : false;
            window.addEventListener('DOMMouseScroll', scroll.preventDefault, false); // older FF
            window.addEventListener(
                scroll.wheelEvent,
                scroll.preventDefault,
                wheelOpt
            ); // modern desktop
            window.addEventListener('touchmove', scroll.preventDefault, wheelOpt); // mobile
            // window.addEventListener('keydown', scroll.preventDefaultForScrollKeys, false);
        },
        enableScroll: function() {
            window.removeEventListener(
                'DOMMouseScroll',
                scroll.preventDefault,
                false
            );
            window.removeEventListener(
                scroll.wheelEvent,
                scroll.preventDefault,
                wheelOpt
            );
            window.removeEventListener('touchmove', scroll.preventDefault, wheelOpt);
            // window.removeEventListener('keydown', scroll.preventDefaultForScrollKeys, false);
        },
    },
    names: {
        sqAttrForName: 'sqname',
        sqAttrForMask: 'maskname',
        sqAttrForPiceName: 'picename',
        imgAttrForParent: 'sqName',
    },
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    SQUARE_COORDINATES: [
        'a1',
        'b1',
        'c1',
        'd1',
        'e1',
        'f1',
        'g1',
        'h1',
        'a2',
        'b2',
        'c2',
        'd2',
        'e2',
        'f2',
        'g2',
        'h2',
        'a3',
        'b3',
        'c3',
        'd3',
        'e3',
        'f3',
        'g3',
        'h3',
        'a4',
        'b4',
        'c4',
        'd4',
        'e4',
        'f4',
        'g4',
        'h4',
        'a5',
        'b5',
        'c5',
        'd5',
        'e5',
        'f5',
        'g5',
        'h5',
        'a6',
        'b6',
        'c6',
        'd6',
        'e6',
        'f6',
        'g6',
        'h6',
        'a7',
        'b7',
        'c7',
        'd7',
        'e7',
        'f7',
        'g7',
        'h7',
        'a8',
        'b8',
        'c8',
        'd8',
        'e8',
        'f8',
        'g8',
        'h8',
    ],
    boardSvg: `<svg id="bk-svg" class="bk-arrow-mask">
  <marker id="triangle-red"
  viewBox="0 0 10 10" refX="0" refY="5" 
  markerUnits="strokeWidth"
  markerWidth="4" markerHeight="3"
  orient="auto">
  <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-red"/>
</marker>
<marker id="triangle-blue"
  viewBox="0 0 10 10" refX="0" refY="5" 
  markerUnits="strokeWidth"
  markerWidth="4" markerHeight="3"
  orient="auto">
  <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-blue"/>
</marker>
<marker id="triangle-green"
viewBox="0 0 10 10" refX="0" refY="5" 
markerUnits="strokeWidth"
markerWidth="4" markerHeight="3"
orient="auto">
<path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-green"/>
</marker>
<marker id="triangle-orange"
viewBox="0 0 10 10" refX="0" refY="5" 
markerUnits="strokeWidth"
markerWidth="4" markerHeight="3"
orient="auto">
<path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-orange"/>
</marker>
</svg>`,
};