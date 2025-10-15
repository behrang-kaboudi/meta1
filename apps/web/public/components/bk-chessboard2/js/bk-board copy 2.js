// const c = require("config");

function BkBoard(parentId, obj) {
    bd = this;
    let consts = bkChessBoardConsts;
    bd.parent = document.getElementById(parentId);
    bd.piceClone = null;
    // مهم دسترسی به تمام خانه از طریق شی صفحه و نام خانه
    bd.allSqs = {}; // all squers whith name dastresi va gharar dadan image dar on
    bd.maskeSqs = {}; // sq : mask name
    bd.settings = {
        fen: bkChessBoardConsts.startFen,
        direction: 'w', //"b"
        canMove: false,
        sideToMove: null,
        //   افزودن قابلیت ماسک
        setMask: false,
        // این ویژگی را بررسی میکند برای چیدن مهره مجوز و نام مهره نیاز است
        setPosition: false,
        piceForInsert: null,
        //funcs توابع بعد از هر قسمتی
        moveEndFunc: null,
    };
    bd.Funcs = {
        afterSecSq: null,
        moveEnd: null,
        isCorrectMove: null,
        getSqs: null,
    };
    bd.arrow = {
        canCreatArrow: false,
        rightArrow: false,
        rightArrowSq: null,
        rightArrowSq2: null,
        arrowMask: null,
        arrowMaskFirstSq: null,
        arrowMaskSecSq: null,
        arrowMaskAllSquers: [], //["a1/a4/bk-arrow-color-blue"]
    };
    $(window).resize(function() {
        bd.flipBoard();
        bd.flipBoard();
    });
    bd.creatBoard = function() {
        bd.initial();
        if (bd.settings.direction == 'w') {
            bd.creatBoardW();
        } else {
            bd.creatBoardB();
        }
        bd.setPosition(bd.settings.fen);
        bd.setMaskedSqs();
        bd.drawSvg();
    };
    bd.flipBoard = function() {
        bd.initial();
        if (bd.settings.direction == 'w') {
            bd.settings.direction = 'b';
        } else {
            bd.settings.direction = 'w';
        }
        bd.creatBoard();
    };
    bd.filipSide = function(side) {
        bd.initial();
        bd.settings.direction = side;
        bd.creatBoard();
    };
    bd.setPosition = function(fen) {
        // $ (bd.allSqclass).empty ();
        bd.clearPosition();
        bd.settings.fen = fen;
        // $ (bd.allSqclass).innerHTML = '';
        var res = fen.split(' ');
        var fen1 = res[0];
        /// replace no piced with 0
        fen1 = fen1.replace(/1/g, '0');
        fen1 = fen1.replace(/2/g, '00');
        fen1 = fen1.replace(/3/g, '000');
        fen1 = fen1.replace(/4/g, '0000');
        fen1 = fen1.replace(/5/g, '00000');
        fen1 = fen1.replace(/6/g, '000000');
        fen1 = fen1.replace(/7/g, '0000000');
        fen1 = fen1.replace(/8/g, '00000000');
        var rows = fen1.split('/');
        var newfen =
            rows[7] +
            rows[6] +
            rows[5] +
            rows[4] +
            rows[3] +
            rows[2] +
            rows[1] +
            rows[0];
        //alert(newfen);
        //
        for (var i = 0; i < 64; i++) {
            if (newfen[i] == 0) {
                continue;
            }
            bd.setPice(
                bkChessBoardConsts.SQUARE_COORDINATES[i],
                bkChessBoardConsts.getPiceNameFromFen(newfen[i])
            );
        }
    };
    bd.setPice = function(sq, piceName = '') {
        bd.allSqs[sq].innerHTML = '';
        if (piceName) {
            var img =
                `<img  ${consts.names.sqAttrForPiceName} = ${piceName}` +
                ' src="' +
                obj.imgSrc;
            img = img + piceName;
            img = img + '.svg">';
            bd.allSqs[sq].innerHTML = img;
        }
    };
    bd.clearPosition = function() {
        for (var i = 0; i < 64; i++) {
            bd.setPice(bkChessBoardConsts.SQUARE_COORDINATES[i]);
        }
        bd.settings.fen = bd.getFen();
    };
    bd.getFen = function() {
        let fen = '';

        for (var i = 0; i < 64; i++) {
            if (i % 8 == 0 && i != 0) {
                fen += '/';
            }
            let pname = bd.getPiceNameFromSq(
                bkChessBoardConsts.SQUARE_COORDINATES[i]
            );
            fen += bkChessBoardConsts.getPiceCharFromName(pname);
        }
        if (bd.settings.direction == 'w') {}
        fen = fen.replace(/00000000/g, '8');
        fen = fen.replace(/0000000/g, '7');
        fen = fen.replace(/000000/g, '6');
        fen = fen.replace(/00000/g, '5');
        fen = fen.replace(/0000/g, '4');
        fen = fen.replace(/000/g, '3');
        fen = fen.replace(/00/g, '2');
        fen = fen.replace(/0/g, '1');
        var rows = fen.split('/');
        var newfen =
            rows[7] +
            '/' +
            rows[6] +
            '/' +
            rows[5] +
            '/' +
            rows[4] +
            '/' +
            rows[3] +
            '/' +
            rows[2] +
            '/' +
            rows[1] +
            '/' +
            rows[0];
        return newfen;
    };
    bd.getPiceNameFromSq = function(sqName) {
        let pice = bd.getPiceImageFromsq(sqName);
        if (pice) {
            return bd.allSqs[sqName].firstChild.getAttribute(
                consts.names.sqAttrForPiceName
            );
        }
        return '';
    };
    bd.getPiceImageFromsq = function(Sq) {
        if (bd.allSqs[Sq].childNodes.length == 0) return false;
        return bd.allSqs[Sq].firstChild;
    };

    bd.initial = function() {
        bd.allSqs = {};
        bd.setupParent();
        bd.setupBoard();
        // creat board layer
        // sizing
        bd.sidebarSize = bd.boardSize / 25; // mokhtasat
        bd.sqSize = (bd.boardSize - bd.sidebarSize * 2) / 8; // 8 sqs
        bd.svgHolder = document.createElement('div');
        bd.svgHolder.classList.add('bk-arrow-mask');
        bd.board.appendChild(bd.svgHolder);
    };
    bd.setupParent = function() {
        bd.parent.innerHTML = '';
        bd.parent.style.boxSizing = 'border-box';
        bd.parent.style.width = '100%';
        bd.boardSize = bd.parent.offsetWidth;
        bd.parent.style.height = bd.boardSize + 'px';
    };
    bd.setupBoard = function() {
        bd.board = document.createElement('div');
        bd.board.classList.add('bk-board');
        bd.parent.appendChild(bd.board);
        bd.board.style.width = bd.board.style.height = '100%';
    };
    bd.drawSvg = function() {
        bd.svgHolder.innerHTML = '';
        let arr = bkChessBoardConsts.boardSvg;

        bd.svgHolder.innerHTML += arr;
        let svg = document.getElementById('bk-svg');
        bd.svg = svg;
        // to do
        bd.addAllEvent(svg);
        bd.arrow.arrowMaskAllSquers.forEach(element => {
            let parts = element.split('/');
            bd.getAroowLine(parts[0], parts[1], parts[2]);
        });
    };
    bd.addAllEvent = function(svgObg) {
        svgObg.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        svgObg.addEventListener('mousedown', function(e) {
            // console.log('mousedown');
            let sq = bd.getSqFromPoint(e.layerX, e.layerY);
            if (e.button == 2) {
                if (bd.settings.setMask) {
                    if (e.ctrlKey && e.altKey) {
                        maskname = 'orange-mask';
                    } else if (e.ctrlKey) {
                        maskname = 'red-mask';
                    } else if (e.altKey) {
                        maskname = 'blue-mask';
                    } else {
                        maskname = 'green-mask';
                    }
                    bd.setMask(bd.getSqFromPoint(e.layerX, e.layerY), maskname);
                    return;
                }
            }
            if (bd.settings.canMove) {
                if (e.shiftKey || e.ctrlKey || e.altKey || e.button != 0) return;
                if (!bd.firstSqMove) {
                    // todo if allowd pices
                    let movPice = bd.getPiceImageFromsq(sq);
                    if (!movPice) return;
                    if (bd.settings.sideToMove) {
                        let attribute = movPice.getAttribute('picename')[0];
                        if (attribute != bd.settings.sideToMove) return;
                    }
                    bd.firstSqMove = sq;
                    bd.setMask(bd.firstSqMove, 'move-mask');
                    bd.creatColonPice(movPice);
                    // placement
                    function moveAt(pageX, pageY) {
                        bd.piceClone.style.left =
                            pageX - bd.piceClone.offsetWidth / 2 + 'px';
                        bd.piceClone.style.top =
                            pageY - bd.piceClone.offsetHeight / 2 + 'px';
                    }

                    function onMouseMove(event) {
                        moveAt(event.pageX, event.pageY);
                    }
                    moveAt(e.pageX, e.pageY);
                    document.addEventListener('mousemove', onMouseMove);
                    bd.piceClone.onmouseup = function(e) {
                        document.removeEventListener('mousemove', onMouseMove);
                        //find droped sq
                        let dropdSq = bd.findDropedSquer(e);
                        // console.log(dropdSq, sq);
                        if (dropdSq == sq) {
                            document.body.removeChild(bd.piceClone);
                            bd.piceClone = null;
                            return;
                        }
                        if (!dropdSq || bd.firstSqMove == dropdSq) {
                            document.body.removeChild(bd.piceClone);
                            bd.piceClone = null;
                            bd.removeMask(bd.firstSqMove);
                            bd.firstSqMove = null;
                            return;
                        }
                        if (bd.Funcs.getSqs) {
                            let moveObj = {
                                from: bd.firstSqMove,
                                to: dropdSq,
                            };
                            bd.Funcs.getSqs(moveObj);
                        }
                        if (bd.Funcs.isCorrectMove) {
                            if (!bd.Funcs.isCorrectMove()) {
                                document.body.removeChild(bd.piceClone);
                                bd.piceClone = null;
                                bd.removeMask(bd.firstSqMove);
                                bd.firstSqMove = null;
                                return;
                            }
                        }
                        bd.PatchPiceToPlace(bd.piceClone, dropdSq);
                        //movPice
                        // bd.PatchPiceToMother (sq);
                        bd.PatchPiceToPlace(movPice, dropdSq);
                        bd.piceClone = null;
                        bd.settings.fen = bd.getFen();
                        bd.removeMasks();
                        bd.firstSqMove = null;
                        if (bd.Funcs.moveEnd) bd.Funcs.moveEnd();
                    };
                } else {
                    // console.log ('endMove', bd.firstSqMove, sq);
                    if (bd.firstSqMove == sq) {
                        bd.removeMask(bd.firstSqMove);
                        bd.firstSqMove = null;
                        return;
                    }

                    if (bd.Funcs.getSqs) {
                        let moveObj = {
                            from: bd.firstSqMove,
                            to: sq,
                        };
                        bd.Funcs.getSqs(moveObj);
                    }
                    // todo if allowd go squers
                    if (bd.Funcs.isCorrectMove) {
                        if (!bd.Funcs.isCorrectMove()) {
                            bd.removeMask(bd.firstSqMove);
                            bd.firstSqMove = null;
                            return;
                        }
                    }
                    bd.secSqMove = sq;
                    bd.setMask(bd.secSqMove, 'move-mask');
                    bd.doMove(bd.firstSqMove, bd.secSqMove);
                    if (bd.Funcs.moveEnd) bd.Funcs.moveEnd();
                }

                // if (!bd.setFirstSqForMove (sqName)) return;
                // if (!bd.setSecSqForMove (sqName)) return;
            }

            if (bd.arrow.canCreatArrow) {
                bd.arrow.arrowMaskFirstSq = sq;
                return;
            }
            if (bd.settings.setPosition) {
                bd.setPice(sq, bd.settings.piceForInsert);
                bd.settings.fen = bd.getFen();
                if (bd.settings.click) {
                    bd.settings.clickFunc();
                }

                function onMouseMove(event) {
                    bd.setPice(bd.findDropedSquer(event), bd.settings.piceForInsert);
                    bd.settings.fen = bd.getFen();
                }
                document.addEventListener('mousemove', onMouseMove);
                document.onmouseup = function(e) {
                    document.removeEventListener('mousemove', onMouseMove);
                }
            }
        });
        svgObg.addEventListener('mouseup', function(e) {
            // console.log('mouseup');
            if (bd.piceClone) {
                bd.clone = null;
                // console.log('mousemove');
            }
            if (bd.arrow.canCreatArrow) {
                bd.drawSvg();
                if (bd.canDrawArrow()) {
                    bd.arrow.arrowMaskSecSq = null;
                    bd.arrow.arrowMaskFirstSq = null;
                    return;
                }

                let arr =
                    bd.arrow.arrowMaskFirstSq +
                    '/' +
                    bd.arrow.arrowMaskSecSq +
                    '/' +
                    bd.getArrLineClass(e);
                let index = bd.arrow.arrowMaskAllSquers.indexOf(arr);
                if (index > -1) {
                    let temp = [];
                    for (let i = 0; i < bd.arrow.arrowMaskAllSquers.length; i++) {
                        if (bd.arrow.arrowMaskAllSquers[i] != arr) {
                            temp.push(bd.arrow.arrowMaskAllSquers[i]);
                        }
                    }
                    bd.arrow.arrowMaskAllSquers = temp;
                } else {
                    bd.arrow.arrowMaskAllSquers.push(arr);
                }
                bd.drawSvg();
                bd.arrow.arrowMaskSecSq = null;
                bd.arrow.arrowMaskFirstSq = null;
            }
        });
        svgObg.addEventListener('mousemove', function(e) {
            if (bd.arrow.canCreatArrow) {
                if (bd.arrow.arrowMaskFirstSq) {
                    bd.arrow.arrowMaskSecSq = bd.getSqFromPoint(e.layerX, e.layerY);
                    if (bd.arrow.arrowMaskSecSq != bd.arrow.arrowMaskFirstSq) {
                        bd.drawSvg();
                        bd.getAroowLine(
                            bd.arrow.arrowMaskFirstSq,
                            bd.arrow.arrowMaskSecSq,
                            bd.getArrLineClass(e)
                        );
                    }
                }
            }
        });
        svgObg.addEventListener('touchstartzzzzzzzzzzz', function(e) {
            // console.log('touchstart');

            if (bd.settings.canMove) {
                // console.log(bd.firstSqMove);

                function preventDefault(e) {
                    e.preventDefault();
                }
                // modern Chrome requires { passive: false } when adding event
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
                var wheelEvent = 'onwheel' in document.createElement('div') ?
                    'wheel' :
                    'mousewheel';
                // call this to Disable
                function disableScroll() {
                    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
                    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
                    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
                    // window.addEventListener('keydown', preventDefaultForScrollKeys, false);
                }

                // call this to Enable
                function enableScroll() {
                    window.removeEventListener('DOMMouseScroll', preventDefault, false);
                    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
                    window.removeEventListener('touchmove', preventDefault, wheelOpt);
                    // window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
                }
                disableScroll();
                // enableScroll ();
                ///
                // function disableScroll () {
                //   window.scrollTo (0, 0);
                // }
                // window.onscroll = disableScroll;
                // window.onscroll -= disableScroll;
                let bdPos = bd.board.getBoundingClientRect();
                // console.log ('mousedown');
                let sq = bd.getSqFromPoint(
                    e.touches.item(0).clientX - bdPos.x,
                    e.touches.item(0).clientY - bdPos.y
                );
                // console.log(sq);
                if (!bd.firstSqMove) {
                    // todo if allowd pices
                    let movPice = bd.getPiceImageFromsq(sq);
                    if (!movPice) return;
                    if (bd.settings.sideToMove) {
                        let attribute = movPice.getAttribute('picename')[0];
                        if (attribute != bd.settings.sideToMove) return;
                    }
                    bd.firstSqMove = sq;
                    bd.setMask(bd.firstSqMove, 'move-mask');
                    bd.creatColonPice(movPice);
                    //     // placement
                    function moveAt(pageX, pageY) {
                        bd.piceClone.style.left =
                            pageX - bd.piceClone.offsetWidth / 2 + 'px';
                        bd.piceClone.style.top =
                            pageY - bd.piceClone.offsetHeight / 2 + 'px';
                    }

                    function onMouseMove(event) {
                        moveAt(event.touches.item(0).pageX, event.touches.item(0).pageY);
                    }
                    moveAt(e.pageX, e.pageY);
                    // moveAt (22, 22);
                    document.addEventListener('touchmove', onMouseMove);
                    document.addEventListener('touchend', function(e) {
                        // console.log('touchend');
                        document.removeEventListener('touchmove', onMouseMove);
                        let dropdSq = bd.findDropedSquer(e.changedTouches[0]);
                        if (dropdSq == sq) {
                            document.body.removeChild(bd.piceClone);
                            bd.piceClone = null;
                            return;
                        }
                        // if (!dropdSq) {
                        //   document.body.removeChild (bd.piceClone);
                        //   bd.piceClone = null;
                        //   bd.removeMask (bd.firstSqMove);
                        //   bd.firstSqMove = null;
                        //   return;
                        // }
                        if (!dropdSq || bd.firstSqMove == dropdSq) {
                            document.body.removeChild(bd.piceClone);
                            bd.piceClone = null;
                            bd.removeMask(bd.firstSqMove);
                            bd.firstSqMove = null;
                            return;
                        }
                        if (bd.Funcs.getSqs) {
                            let moveObj = {
                                from: bd.firstSqMove,
                                to: dropdSq,
                            };
                            bd.Funcs.getSqs(moveObj);
                        }
                        if (bd.Funcs.isCorrectMove) {
                            if (!bd.Funcs.isCorrectMove()) {
                                document.body.removeChild(bd.piceClone);
                                bd.piceClone = null;
                                bd.removeMask(bd.firstSqMove);
                                bd.firstSqMove = null;
                                return;
                            }
                        }
                        //       // todo if allowd move
                        bd.PatchPiceToPlace(bd.piceClone, dropdSq);
                        //movPice
                        // console.log(sq);
                        // bd.PatchPiceToMother (sq);
                        bd.PatchPiceToPlace(movPice, dropdSq);
                        bd.piceClone = null;
                        bd.settings.fen = bd.getFen();
                        bd.removeMasks();
                        // if (bd.settings.moveEndFunc) {
                        //   bd.settings.moveEndFunc ();
                        // }
                        // if (dropdSq == sq) return;
                        bd.firstSqMove = null;
                        if (bd.Funcs.moveEnd) bd.Funcs.moveEnd();
                    });
                } else {
                    // console.log ('endMove', bd.firstSqMove, sq);
                    if (bd.firstSqMove == sq) {
                        bd.removeMask(bd.firstSqMove);
                        bd.firstSqMove = null;
                        return;
                    }

                    if (bd.Funcs.getSqs) {
                        let moveObj = {
                            from: bd.firstSqMove,
                            to: sq,
                        };
                        bd.Funcs.getSqs(moveObj);
                    }
                    if (bd.Funcs.isCorrectMove) {
                        if (!bd.Funcs.isCorrectMove()) {
                            bd.removeMask(bd.firstSqMove);
                            bd.firstSqMove = null;
                            return;
                        }
                    }
                    bd.secSqMove = sq;
                    bd.setMask(bd.secSqMove, 'move-mask');
                    bd.doMove(bd.firstSqMove, bd.secSqMove);
                    if (bd.Funcs.moveEnd) bd.Funcs.moveEnd();
                }
            }
            //   // if (!bd.setFirstSqForMove (sqName)) return;
            //   // if (!bd.setSecSqForMove (sqName)) return;
        });
    };
    bd.getSqFromPoint = function(x, y) {
        let fileX = Math.ceil((x - bd.sidebarSize) / bd.sqSize);
        if (fileX <= 0) return false;
        if (bd.settings.direction == 'w') {
            let fileY = 9 - Math.ceil((y - bd.sidebarSize) / bd.sqSize);
            if (fileY <= 0 || fileY >= 9 || fileX <= 0 || fileX >= 9) return false;
            return bkChessBoardConsts.getNumFile(fileX) + fileY;
        }
        if (bd.settings.direction == 'b') {
            fileX = 9 - fileX;
            let fileY = Math.ceil((y - bd.sidebarSize) / bd.sqSize);
            if (fileY <= 0) return false;
            if (fileY <= 0 || fileY >= 9 || fileX <= 0 || fileX >= 9) return false;
            return bkChessBoardConsts.getNumFile(fileX) + fileY;
        }
        return false;
    };

    // moves
    bd.doMove = function(sq1, sq2) {
        // bd.settings.canMove = false;
        let img = bd.allSqs[sq1].firstChild;
        bd.PatchPiceToMother(sq1);
        let time = bkChessBoardConsts.timeForAnimation(sq1, sq2);
        let endPoint = bd.getSqstartPoinFromSq(sq2);

        $(img).animate({ top: endPoint.y, left: endPoint.x }, time, function() {
            bd.allSqs[sq2].innerHTML = '';
            bd.PatchPiceToPlace(img, sq2);
            bd.settings.fen = bd.getFen();
            bd.removeMasks();
            //todo
            // if (bd.settings.moveEndFunc) {
            //   bd.settings.moveEndFunc ();
            // }
            // bd.settings.canMove = true;
        });
        bd.firstSqMove = bd.secSqMove = null;
    };
    bd.PatchPiceToMother = function(sqName) {
        let sqObj = bd.allSqs[sqName];
        let movePice = sqObj.firstChild;
        sqObj.innerHTML = '';
        let startPoint = bd.getSqstartPoinFromSq(sqName);
        let piceStyle = movePice.style;
        bd.setPiceStyleForMother(movePice);
        piceStyle.top = startPoint.y + 'px';
        piceStyle.left = startPoint.x + 'px';
        bd.board.appendChild(movePice);
    };
    bd.setPiceStyleForMother = function(pice) {
        let piceStyle = pice.style;
        piceStyle.position = 'absolute';
        piceStyle.width = bd.sqSize + 'px';
        piceStyle.height = bd.sqSize + 'px';
        piceStyle.zIndex = '1000';
    };
    bd.PatchPiceToPlace = function(pice, sqName) {
        let parentSq2 = bd.allSqs[sqName];
        parentSq2.innerHTML = '';
        pice.style.position = 'static';
        pice.style.width = '100%';
        pice.style.height = '100%';
        pice.style.zIndex = '0';
        parentSq2.appendChild(pice);
        pice.setAttribute(consts.names.imgAttrForParent, sqName);
    };

    bd.getSqstartPoinFromSq = function(sq) {
        let point = { x: 0, y: 0 };
        if (bd.settings.direction == 'w') {
            point.x +=
                bd.sidebarSize +
                bd.sqSize * (bkChessBoardConsts.getFileNum(sq[0]) - 1);
            point.y += bd.sidebarSize + bd.sqSize * (9 - parseInt(sq[1]) - 1);
        }
        if (bd.settings.direction == 'b') {
            point.x +=
                bd.sidebarSize +
                bd.sqSize * (9 - bkChessBoardConsts.getFileNum(sq[0]) - 1);
            point.y += bd.sidebarSize + bd.sqSize * (parseInt(sq[1]) - 1);
        }
        return point;
    };
    //arrow
    bd.getAroowLine = function(sq1, sq2, lineClass = 'bk-arrow-color-blue') {
        if (!sq1 || sq2 == undefined) {
            return false;
        }
        if (!sq2 || sq2 == undefined) {
            return false;
        }
        let endX = 0;
        let startX = 0;
        let startY = 0;
        let endY = 0;

        if (bd.settings.direction == 'w') {
            let sq1FileNum = bkChessBoardConsts.getFileNum(sq1[0]); //sq1
            startX = bd.sidebarSize + bd.sqSize * (sq1FileNum - 1) + bd.sqSize / 2;
            let sq2FileNum = bkChessBoardConsts.getFileNum(sq2[0]); //sq1
            let center = 3;
            if (sq1FileNum == sq2FileNum) {
                center = 2;
            }
            if (sq1FileNum > sq2FileNum) {
                center = 1.5;
            }
            endX = bd.sidebarSize + bd.sqSize * (sq2FileNum - 1) + bd.sqSize / center;
            let row1 = 9 - parseInt(sq1[1]);
            startY = bd.sidebarSize + bd.sqSize * (row1 - 1) + bd.sqSize / 2;
            let row2 = 9 - parseInt(sq2[1]);
            center = 1.3;
            // if()
            if (row1 == row2) {
                center = 2;
            }
            if (row1 < row2) {
                center = 2.8;
            }
            endY = bd.sidebarSize + bd.sqSize * (row2 - 1) + bd.sqSize / center;
        }
        if (bd.settings.direction == 'b') {
            let sq1FileNum = 9 - bkChessBoardConsts.getFileNum(sq1[0]); //sq1

            startX = bd.sidebarSize + bd.sqSize * (sq1FileNum - 1) + bd.sqSize / 2;
            let sq2FileNum = 9 - bkChessBoardConsts.getFileNum(sq2[0]); //sq1
            let center = 3;
            if (sq1FileNum == sq2FileNum) {
                center = 2;
            }
            if (sq1FileNum > sq2FileNum) {
                center = 1.4;
            }
            endX = bd.sidebarSize + bd.sqSize * (sq2FileNum - 1) + bd.sqSize / center;
            let row1 = parseInt(sq1[1]);
            startY = bd.sidebarSize + bd.sqSize * (row1 - 1) + bd.sqSize / 2;
            let row2 = parseInt(sq2[1]);
            center = 1.3;
            // if()
            if (row1 == row2) {
                center = 2;
            }
            if (row1 < row2) {
                center = 5;
            }
            endY = bd.sidebarSize + bd.sqSize * (row2 - 1) + bd.sqSize / center;
        }

        let classParts = lineClass.split('-');
        let targetHead = classParts[classParts.length - 1];
        if (endX.toString() == 'NaN') {
            return;
        }
        if (startX.toString() == 'NaN') {
            return;
        }
        if (startY.toString() == 'NaN') {
            return;
        }
        if (endY.toString() == 'NaN') {
            return;
        }
        // bd.arrowMask.innerHTML = arr2;
        // bd.board.appendChild (bd.arrowMask);

        let arr = `
  <line class="${lineClass}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" marker-end="url(#triangle-${targetHead})" style="stroke-width:7" />
`;
        document.getElementById('bk-svg').innerHTML += arr;
        // return arr;
    };
    bd.clearArrows = function() {
        bd.arrow.arrowMaskAllSquers = [];
        bd.drawSvg();
    };
    bd.canDrawArrow = function() {
        if (!bd.arrow.arrowMaskFirstSq ||
            !bd.arrow.arrowMaskFirstSq ||
            bd.arrow.arrowMaskSecSq != bd.arrow.arrowMaskFirstSq
        ) {
            return false;
        }
        return true;
    };
    bd.getArrLineClass = function(e) {
        let lineClass = 'bk-arrow-color-green';
        if (e.altKey) {
            lineClass = 'bk-arrow-color-blue';
        }
        if (e.ctrlKey) {
            lineClass = 'bk-arrow-color-red';
        }
        if (e.ctrlKey && e.altKey) {
            lineClass = 'bk-arrow-color-orange';
        }
        return lineClass;
    };
    // mask
    bd.setMask = function(sqName, maskName) {
        let sq = bd.allSqs[sqName];
        // console.log (sqName);
        // empty pre
        let premaskname = sq.getAttribute(consts.names.sqAttrForMask);
        if (premaskname == maskName) {
            bd.removeMask(sqName);
            return;
        }
        sq.classList.remove(premaskname);
        // creat new
        let attMask = document.createAttribute(consts.names.sqAttrForMask);
        attMask.value = maskName;
        sq.setAttributeNode(attMask);
        sq.classList.add(maskName);
        bd.maskeSqs[sqName] = maskName;
    };
    bd.removeMasks = function() {
        for (let index = 0; index < 64; index++) {
            bd.removeMask(bkChessBoardConsts.SQUARE_COORDINATES[index]);
        }
    };
    bd.setMaskedSqs = function() {
        for (const property in bd.maskeSqs) {
            bd.setMask(`${property}`, `${bd.maskeSqs[property]}`);
        }
    };

    bd.removeMask = function(sqName) {
        let sq = bd.allSqs[sqName];
        // empty pre
        let premaskname = sq.getAttribute(consts.names.sqAttrForMask);
        sq.classList.remove(premaskname);
        // creat new
        let attMask = document.createAttribute(consts.names.sqAttrForMask);
        attMask.value = 'empty';
        sq.setAttributeNode(attMask);
        delete bd.maskeSqs[sqName];
    };
    bd.creatBoardW = function() {
        bd.creatTopRow();
        bd.creatRowW(8);
        bd.creatRowW(7);
        bd.creatRowW(6);
        bd.creatRowW(5);
        bd.creatRowW(4);
        bd.creatRowW(3);
        bd.creatRowW(2);
        bd.creatRowW(1);
        bd.creatBottomRowW();
    };
    bd.creatBoardB = function() {
        bd.creatTopRow();
        bd.creatRowB(1);
        bd.creatRowB(2);
        bd.creatRowB(3);
        bd.creatRowB(4);
        bd.creatRowB(5);
        bd.creatRowB(6);
        bd.creatRowB(7);
        bd.creatRowB(8);
        bd.creatBottomRowB();
    };
    bd.creatTopRow = function() {
        let row = document.createElement('div');
        row.classList.add('bk-row');
        row.appendChild(bd.creatSmallSq());
        for (let index = 0; index < 8; index++) {
            row.appendChild(bd.creatRowFildSq('top-bar'));
        }
        row.appendChild(bd.creatSmallSq());
        bd.board.appendChild(row);
    };
    bd.creatSmallSq = function() {
        let smallSq = document.createElement('div');
        smallSq.style.height = smallSq.style.width = bd.sidebarSize + 'px';
        return smallSq;
    };
    bd.creatSq = function(cssClass, sqName) {
        let smallSq = document.createElement('div');
        smallSq.classList.add(cssClass);
        smallSq.style.height = smallSq.style.width = bd.sqSize + 'px';
        let att = document.createAttribute(consts.names.sqAttrForName);
        att.value = sqName;
        smallSq.setAttributeNode(att);
        let attMask = document.createAttribute(consts.names.sqAttrForMask);
        attMask.value = 'empty';
        smallSq.setAttributeNode(attMask);
        bd.allSqs[sqName] = smallSq;
        return smallSq;
    };
    bd.creatRowFildSq = function(cssClass, data = '') {
        let smallSq = document.createElement('div');
        // smallSq.style.backgroundColor = 'red';
        smallSq.classList.add(cssClass);
        smallSq.style.height = bd.sidebarSize + 'px';
        smallSq.style.width = bd.sqSize + 'px';
        if (data) {
            // smallSq.innerText = data;
            let x = bd.sqSize / 2;
            let y = bd.sidebarSize / 2 + bd.sidebarSize * 30 / 100;
            let fontsize = bd.sidebarSize;
            let img;
            if (data == 'g') {
                img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y - 2}'  font-size='${fontsize}px' font-weight='bold'>${data}</text></svg>")`;
            } else {
                img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y}'  font-size='${fontsize}px' font-weight='bold'>${data}</text></svg>")`;
            }

            smallSq.style.backgroundImage = img;
        }
        return smallSq;
    };
    bd.creatRowW = function(rowNum) {
        let row = document.createElement('div');
        row.classList.add('bk-row');
        let firstColor = 'white-sq';
        let secColor = 'black-sq';
        if (rowNum % 2 == 1) {
            firstColor = 'black-sq';
            secColor = 'white-sq';
        }
        row.appendChild(bd.creatColRowSq('left-bar', rowNum));
        row.appendChild(bd.creatSq(firstColor, 'a' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'b' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'c' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'd' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'e' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'f' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'g' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'h' + rowNum));
        row.appendChild(bd.creatColRowSq('right-bar'));
        bd.board.appendChild(row);
    };
    bd.creatRowB = function(rowNum) {
        let row = document.createElement('div');
        row.classList.add('bk-row');
        let firstColor = 'black-sq';
        let secColor = 'white-sq';
        if (rowNum % 2 == 1) {
            firstColor = 'white-sq';
            secColor = 'black-sq';
        }
        row.appendChild(bd.creatColRowSq('left-bar'));
        row.appendChild(bd.creatSq(firstColor, 'h' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'g' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'f' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'e' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'd' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'c' + rowNum));
        row.appendChild(bd.creatSq(firstColor, 'b' + rowNum));
        row.appendChild(bd.creatSq(secColor, 'a' + rowNum));
        row.appendChild(bd.creatColRowSq('right-bar', rowNum));
        bd.board.appendChild(row);
    };
    bd.creatBottomRowW = function() {
        let row = document.createElement('div');
        row.classList.add('bk-row');
        row.appendChild(bd.creatSmallSq());
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'a'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'b'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'c'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'd'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'e'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'f'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'g'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'h'));
        row.appendChild(bd.creatSmallSq());
        bd.board.appendChild(row);
    };
    bd.creatBottomRowB = function() {
        let row = document.createElement('div');
        row.classList.add('bk-row');
        row.appendChild(bd.creatSmallSq());
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'h'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'g'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'f'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'e'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'd'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'c'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'b'));
        row.appendChild(bd.creatRowFildSq('bottom-bar', 'a'));
        row.appendChild(bd.creatSmallSq());
        bd.board.appendChild(row);
    };
    bd.creatRowFildSq = function(cssClass, data = '') {
        let smallSq = document.createElement('div');
        // smallSq.style.backgroundColor = 'red';
        smallSq.classList.add(cssClass);
        smallSq.style.height = bd.sidebarSize + 'px';
        smallSq.style.width = bd.sqSize + 'px';
        if (data) {
            // smallSq.innerText = data;
            let x = bd.sqSize / 2;
            let y = bd.sidebarSize / 2 + bd.sidebarSize * 30 / 100;
            let fontsize = bd.sidebarSize;
            let img;
            if (data == 'g') {
                img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y - 2}'  font-size='${fontsize}px' font-weight='bold'>${data}</text></svg>")`;
            } else {
                img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y}'  font-size='${fontsize}px' font-weight='bold'>${data}</text></svg>")`;
            }

            smallSq.style.backgroundImage = img;
        }
        return smallSq;
    };
    bd.creatColRowSq = function(cssClass, number = '') {
        let smallSq = document.createElement('div');
        // smallSq.style.backgroundColor = 'red';
        smallSq.classList.add(cssClass);
        smallSq.style.height = bd.sqSize + 'px';
        smallSq.style.width = bd.sidebarSize + 'px';
        if (number) {
            // smallSq.innerText = data;
            let x = bd.sidebarSize / 2 - bd.sidebarSize * 25 / 100;
            let y = bd.sqSize / 2 + bd.sqSize * 15 / 100;
            let fontsize = bd.sidebarSize;
            let img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y}'  font-size='${fontsize}px' font-weight='bold'>${number}</text></svg>")`;
            smallSq.style.backgroundImage = img;
        }
        return smallSq;
    };

    bd.creatColonPice = function(movPice) {
        bd.piceClone = movPice.cloneNode(true);
        bd.piceClone.classList.add('dragging');
        bd.setPiceStyleForMother(bd.piceClone);
        document.body.appendChild(bd.piceClone);
        bd.piceClone.ondragstart = () => {
            return false;
        };
    };

    bd.findDropedSquer = function(e) {
        let bdPos = bd.board.getBoundingClientRect();
        let dropdSq = bd.getSqFromPoint(e.clientX - bdPos.x, e.clientY - bdPos.y);
        return dropdSq;
    };
}