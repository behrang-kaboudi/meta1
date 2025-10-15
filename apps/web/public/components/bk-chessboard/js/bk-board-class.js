let bkGraphicalBoard = {};
bkGraphicalBoard.bk_chessConsts = {
    _files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    _rows: [1, 2, 3, 4, 5, 6, 7, 8],
    getRows: (side) => {
        if (side == 'b') return bkGraphicalBoard.bk_chessConsts._rows;
        return bkGraphicalBoard.bk_chessConsts._rows.slice().reverse();
    },
    getFiles: (side) => {
        if (side == 'w') return bkGraphicalBoard.bk_chessConsts._files;
        return bkGraphicalBoard.bk_chessConsts._files.slice().reverse();
    },
    getFileNum: function (file) {
        switch (file) {
            case 'a':
                return 1;
            case 'b':
                return 2;
            case 'c':
                return 3;
            case 'd':
                return 4;
            case 'e':
                return 5;
            case 'f':
                return 6;
            case 'g':
                return 7;
            case 'h':
                return 8;
        }
    },
    getCharFile: function (num) {
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
    getColorFromEvent(e) {
        if (e.ctrlKey && e.altKey) return 'orange';
        if (e.ctrlKey) return 'red';
        if (e.altKey) return 'blue';
        if (e.shiftKey) return 'green';
        return null;
    },
    convertFen(fen) {
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
        return newfen;
    },
    getPiceNameFromFen: function (pice) {
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
}

bkGraphicalBoard.Move = class {
    constructor(boardObj) {
        this.boardObj = boardObj;
        this.sq1 = null;
        this.sq2 = null;
        this.clonePice = null;
        this.availableMoves = [];
        this.event = new MyEvent();
        this.setEvents();
    }
    setEvents() {
        let self = this;
        this.boardObj.event.on('sqDown', function (ev) {
            self.setSq(ev);
        })
        self.event.on('piceDroped', function (ev) {
            self.doMoveAfterDrop(ev);
        })
        this.boardObj.event.on('promotion', function (pice) {
            self.doPromotionMove(pice);
        })
    }

    doPromotionMove(pice) {
        console.log('', this);
        let Move = this.availableMoves.find(m => m.promotion == pice[1] && m.from == this.sq1.name && m.to == this.sq2.name)
        let tempMove = this.boardObj.settings.chessEngine.move(Move);
        this.boardObj.setPosition(this.boardObj.settings.chessEngine.fen());
        this.boardObj.fen.updateFen();
        this.boardObj.event.emit('move', { sq1: this.sq1, sq2: this.sq2, promotion: pice });
        this.boardObj.promotion[pice[0]].classList.add('d-none');
        this.boardObj.settings.canMove = true;

    }
    moveCondition(ev) {
        if (ev.e.shiftKey || ev.e.ctrlKey || ev.e.altKey || ev.e.which != 1 || !this.boardObj.settings.canMove) return false;
        return true;
    }
    setSq(ev) {

        if (!this.moveCondition(ev)) return;
        if (this.sq1 && this.sq2) this.resetMove();
        if (!this.sq1) {
            this.setFirstSq(ev);
            return;
        }
        if (this.sq1.num == ev.sq.num) {
            // this.sq1.setMask('');
            // this.sq1 = null;
            return;
        }
        this.doMoveAfterSec(ev)
    }
    setFirstSq(ev) {
        if (!this.setFirstSqNoClone(ev)) return;
        this.clonePice = new bkGraphicalBoard.Pice(this.boardObj, ev.sq.pice.name);
        this.setClonePiceStyle();
        this.setClonePiceEvents(ev);
    }
    setFirstSqNoClone(ev) {
        if (!ev.sq.pice) return false;

        // check engine for can go 
        // this.removeAllMasks();
        if (this.boardObj.settings.chessEngine) {
            this.availableMoves = this.boardObj.settings.chessEngine.moves({ square: ev.sq.name, verbose: true })
            if (this.availableMoves.length == 0) return false;
        }
        if (this.sq1) this.sq1.setMask('');
        this.sq1 = ev.sq; //
        this.sq1.setMask('green');
        return true
    }

    setClonePiceStyle() {
        let htmObj = this.clonePice.htmlObj;
        // htmObj.classList.add('dragging');
        htmObj.style.position = 'absolute';
        htmObj.style.width = htmObj.style.height = this.boardObj.size.main + 'px';
        htmObj.style.zIndex = '1000';
        document.body.appendChild(htmObj);

    }
    setClonePiceEvents(ev) {
        let self = this;
        let htmObj = this.clonePice.htmlObj;
        htmObj.ondragstart = () => {
            return false;
        };

        function moveAt(pageX, pageY) {
            htmObj.style.left = pageX - htmObj.offsetWidth / 2 + 'px';
            htmObj.style.top = pageY - htmObj.offsetHeight / 2 + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
        moveAt(ev.e.pageX, ev.e.pageY);

        document.addEventListener('mousemove', onMouseMove);
        htmObj.onmouseup = function (e) {
            document.removeEventListener('mousemove', onMouseMove);
            let sq = self.boardObj.glass.findDropedSquer(e);
            self.event.emit('piceDroped', { sq, e, name: 'piceDroped' });
        }
    }
    doMoveAfterDrop(ev) {
        document.body.removeChild(this.clonePice.htmlObj);
        this.doMove(ev, this.clonePice);
    }
    doMoveAfterSec(ev) {
        this.doMove(ev, this.sq1.pice)
    }
    doMove(ev, pice) {
        if (!ev.sq) return;
        if (this.sq1.num == ev.sq.num) {
            // this.sq1.setMask('');
            // this.sq1 = null;
            return;
        }
        if (this.boardObj.settings.chessEngine) {
            let firstAvailableMove = this.availableMoves.find(m => m.to == ev.sq.name);
            if (!firstAvailableMove) {
                console.log('xx',);
                this.sq1.setMask('');
                this.sq1 = null;
                // if (this.clonePice && this.clonePice.htmlObj.parentElement.nodeName == 'body') document.body.removeChild(this.clonePice.htmlObj);
                // this.clonePice = null;
                console.log('', ev);
                if (ev.name == 'sqDown') {
                    this.setFirstSq(ev)
                }

                // this.setFirstSqNoClone(ev);
                return;
            }
            this.sq2 = ev.sq;
            this.sq2.setPice(pice);
            this.sq1.setPice('');
            //check for promotion
            if (firstAvailableMove.promotion) {
                this.boardObj.settings.canMove = false;
                this.boardObj.promotion[firstAvailableMove.color].classList.remove('d-none');
                this.sq2 = ev.sq;

                return;
            }
            //
            let tempMove = this.boardObj.settings.chessEngine.move({ from: this.sq1.name, to: ev.sq.name })
            if (tempMove.flags.search(/k|q|e/) > -1) {
                this.boardObj.setPosition(this.boardObj.settings.chessEngine.fen());

                this.boardObj.fen.updateFen()
                this.boardObj.event.emit('move', { sq1: this.sq1, sq2: this.sq2 });
                return
            }
            this.boardObj.fen.updateFen()
            this.boardObj.event.emit('move', { sq1: this.sq1, sq2: this.sq2 });
        }

    }
    resetMove() {
        this.sq1 = this.sq2 = this.clonePice = null;
        this.availableMoves = [];
    }

}
bkGraphicalBoard.Pice = class {
    constructor(boardObj, name) {
        this.boardObj = boardObj;
        this.name = name;
        this.sq = null;
        // this.setEvents();
        this.creat();
    }
    creat() {
        this.htmlObj = document.createElement('img');
        this.htmlObj.src = this.boardObj.settings.imgSrc + this.name + '.svg';
    };

    changeSq(sq2) {
        this.sq.htmlObj.innerHTML = '';
        this.sq = null;
        sq2.pice = this;
        sq2.htmlObj.innerHTML = '';
        sq2.htmlObj.append(this.htmlObj);
        this.sq = sq2;

    }
}
bkGraphicalBoard.Fen = class {
    constructor(boardObj) {
        this.boardObj = boardObj;
        let self = this;
        this.side = 'w';
        this.castling = '-';
        this.enp = '-';
        this.capOrPawnCounter = '0';
        this.moves = '1';
        // this.boardObj.event.on('fenChanged', function(e) {
        //     self.updateFen();
        // })
    }
    setFen(str) {
        if (!str) return;
        var parts = str.split(' ');
        this.srtFen = str;
        this.position = parts[0];
        this.side = parts[1];
        this.castling = parts[2];
        this.enp = parts[3];
        this.capOrPawnCounter = parts[4];
        this.moves = parts[5];
        if (this.boardObj.settings.chessEngine) {
            this.boardObj.settings.chessEngine.load(str);
        }
        this.boardObj.event.emit('fenChanged')
    }
    updateFen() {
        let newFen = '';
        let eng = this.boardObj.settings.chessEngine;
        if (eng) {
            newFen = eng.fen()

        } else {
            newFen = this.setNewPos()
        }
        if (newFen != this.srtFen) {
            this.setFen(newFen);
        }

    }
    setNewPos() { }
    getFen() {
        return this.position + ' ' + this.side + ' ' + this.castling + ' ' + this.enp + ' ' + this.capOrPawnCounter + ' ' + this.moves;
    }
}
bkGraphicalBoard.Mask = class {
    constructor(boardObj) {
        this.boardObj = boardObj;
        this.current = { sq: null, color: null }
        this.setEvents();
    }
    setEvents() {
        let self = this;
        this.boardObj.event.on('sqDown', function (ev) {
            self.setMouseDown(ev);
        })
        this.boardObj.event.on('sqUp', function (ev) {
            self.setMouseUp(ev);
        })
        this.boardObj.event.on('mouseMove', function (ev) {
            self.setMouseMove(ev);
        })
    }
    setMouseDown(ev) {
        if (this.boardObj.settings.setMask) {
            this.current.color = null;
            this.current.color = bkGraphicalBoard.bk_chessConsts.getColorFromEvent(ev.e);
            if (ev.e.which == 1 && !this.current.color) return;
            if (ev.e.which == 3 && !this.current.color) this.current.color = 'green';
            if (ev.sq.mask == this.current.color) {
                ev.sq.setMask('');
                return;
            }
            this.current.sq = ev.sq;
            ev.sq.setMask(this.current.color);
        }
    }
    setMouseUp(ev) {
        if (this.boardObj.settings.setMask && this.current.sq) {

            if (ev.sq && this.current.sq.num == ev.sq.num) {
                this.current.sq = null;
                return;
            }
            this.current.sq.setMask('');
        }
    }
    setMouseMove(ev) {
        if (this.boardObj.settings.setMask && this.current.sq) {
            if (ev.e.which == 1) {
                if (this.current.sq.num == ev.sq.num) {
                    this.current.sq.setMask(this.current.color);
                } else {
                    this.current.sq.setMask('');
                }
            }
        }
    }

}
bkGraphicalBoard.Squer = class {
    constructor(board) {
        this.board = board;
        this.htmlObj = null;
        this.creatSq();
    }
    creatSq() {
        this.htmlObj = document.createElement('div');
        this.setCss()
        this.setSize();
    };
    setCss() {
        // this.htmlObj.classList.add(this.board.design.dark);
    }

}
bkGraphicalBoard.SmallSq = class extends bkGraphicalBoard.Squer {
    constructor(board) {
        super(board)
        this.setCss();
    }
    setSize() {
        this.htmlObj.style.height = this.htmlObj.style.width = this.board.size.side + 'px';
    }
    setCss() {
        // this.htmlObj.classList.add(this.board.design.dark);
        this.htmlObj.classList.add('small-sq');
    }
}
bkGraphicalBoard.RowSq = class extends bkGraphicalBoard.Squer {
    constructor(board, char) {
        super(board)
        this.char = char;
        this.setCss();
    }
    setSize() {
        this.htmlObj.style.height = this.board.size.side + 'px';
        this.htmlObj.style.width = this.board.size.main + 'px';
        this.htmlObj.style.fontSize = this.board.size.main / 3 + 'px';
        this.htmlObj.style.paddingBottom = '0px'
    }
    setChar() {
        if (this.char) {

        }
    }
    setCss() {
        // this.htmlObj.classList.add(this.board.design.dark);
        this.htmlObj.classList.add('d-flex', 'align-items-center', 'justify-content-center', 'row-bar');
    }
    setText(txt) {
        this.htmlObj.innerText = txt;
        // this.htmlObj.classList.remove('bd-char-g', 'bd-char-e')
        // if (txt == 'g') {
        //     this.htmlObj.classList.add('bd-char-g');
        // }
        // if (txt == 'a' || txt == 'e' || txt == 'c') {
        //     this.htmlObj.classList.add('bd-char-e');
        // }
    }

}
bkGraphicalBoard.SideSq = class extends bkGraphicalBoard.Squer {
    constructor(board) {
        super(board)
        this.setCss();
    }
    setSize() {
        this.htmlObj.style.height = this.board.size.main + 'px';
        this.htmlObj.style.width = this.board.size.side + 'px';
    }
    setCss() {
        // this.htmlObj.classList.add(this.board.design.dark);
        this.htmlObj.classList.add('d-flex', 'align-items-center', 'justify-content-center', 'side-bar');
    }
    setText(txt) {
        this.htmlObj.innerText = txt;
    }
}
bkGraphicalBoard.MainSq = class extends bkGraphicalBoard.Squer {
    constructor(board, num) {
        super(board);
        this.boardObj = this.board;
        this.num = num;
        this.col = this.colNum = this.row = this.name = null;
        this.mask = null;
        this.pice = null;
        this.getName()
        this.setCss();
    }
    getColorFromNum() {
        if ((this.colNum + this.row) % 2 == 1) {
            return 'light';
        }
        return 'dark'
    }
    getName() {
        this.row = parseInt(this.num / 8) + 1;
        this.colNum = (this.num % 8) + 1;
        this.col = bkGraphicalBoard.bk_chessConsts.getCharFile(this.colNum);
        this.name = this.col + this.row;
    }
    setSize() {
        this.htmlObj.style.height = this.htmlObj.style.width = this.board.size.main + 'px';
    }
    setCss() {
        this.htmlObj.classList.add(this.board.design[this.getColorFromNum(this.num)]);
    }
    setMask(name) {
        this.mask = name;
        for (let i = 0; i < this.htmlObj.classList.length; i++) {
            const cssClass = this.htmlObj.classList[i];
            if (cssClass.includes('mask')) {
                this.htmlObj.classList.remove(cssClass);
            }
        }
        if (name) this.htmlObj.classList.add(name + '-mask');
    }
    getArrowPos() {
        let pos = {};
        pos.top = (this.htmlObj.offsetParent.offsetTop + this.board.size.main / 2);
        // pos.top = (this.htmlObj.offsetParent.offsetTop);
        pos.left = this.htmlObj.offsetLeft - this.htmlObj.offsetParent.offsetLeft + this.board.size.main / 2;
        return pos;
    }
    setPice(pice, emit = true) {
        this.pice = pice;
        this.htmlObj.innerHTML = '';
        if (!pice) return;
        pice.htmlObj.style.position = 'static';
        this.htmlObj.append(pice.htmlObj);
        pice.sq = this;
        this.boardObj.fen.updateFen();
    };
}
bkGraphicalBoard.Glass = class {
    constructor(board) {
        this.boardObj = board;
        this.htmlObj = null;
        this.creat()
    }
    getSqFromPoint(x, y) {
        let fileX = Math.ceil((x - this.boardObj.size.side) / this.boardObj.size.main);
        let fileY = Math.ceil((y - this.boardObj.size.side) / this.boardObj.size.main);
        if (fileX <= 0) return false;
        if (this.boardObj.settings.direction == 'w') {
            fileY = 9 - fileY;
        }
        if (this.boardObj.settings.direction == 'b') {
            fileX = 9 - fileX;
        }
        if (fileY <= 0 || fileY >= 9 || fileX <= 0 || fileX >= 9) return false;
        return this.boardObj.allSquers.find(sq => sq.name == bkGraphicalBoard.bk_chessConsts.getCharFile(fileX) + fileY);
    };
    findDropedSquer(e) {
        let bdPos = this.htmlObj.getBoundingClientRect();
        let dropdSq = this.getSqFromPoint(e.clientX - bdPos.x, e.clientY - bdPos.y);
        return dropdSq;
    };
    creat() {
        this.htmlObj = document.createElement('div');
        this.htmlObj.classList.add('bk-glass');
        this.boardObj.board.appendChild(this.htmlObj);
        this.setEvents();

    }
    setEvents() {
        let glass = this;
        this.htmlObj.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
        this.htmlObj.addEventListener('mousedown', function (e) {
            let sq = glass.getSqFromPoint(e.layerX, e.layerY);
            glass.boardObj.event.emit('sqDown', { e, sq, name: 'sqDown' });
        });
        this.htmlObj.addEventListener('mousemove', function (e) {
            let sq = glass.getSqFromPoint(e.layerX, e.layerY);
            glass.boardObj.event.emit('mouseMove', { e, sq, name: 'mouseMove' });
        });
        this.htmlObj.addEventListener('mouseup', function (e) {
            let sq = glass.getSqFromPoint(e.layerX, e.layerY);
            glass.boardObj.event.emit('sqUp', { e, sq, name: 'sqUp' });
        });
        $(window).on('mouseup', function (e) {
            let sq = null;
            glass.boardObj.event.emit('sqUp', { e, sq });
        });
    }
}
bkGraphicalBoard.Arrow = class {
    constructor(boardObj) {
        this.boardObj = boardObj;
        this.htmlObj = null;
        this.arrows = [];
        this.current = { sq1: null, sq2: null, color: 'red' }
        this.creat();
        this.setEvents();
    }
    //api
    creat() {
        this.boardObj.arrowsLayer.innerHTML = '';
        let html =/*html*/
            `
        <svg class="bk-arrow-mask"> <marker id="triangle-red"
                viewBox="0 0 10 10" refX="7" refY="5" 
                markerUnits="strokeWidth"
                markerWidth="4" markerHeight="3"
                orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-red"/>
                </marker>
                <marker id="triangle-blue"
                viewBox="0 0 10 10" refX="7" refY="5" 
                markerUnits="strokeWidth"
                markerWidth="4" markerHeight="3"
                orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-blue"/>
                </marker>
                <marker id="triangle-green"
                viewBox="0 0 10 10" refX="7" refY="5" 
                markerUnits="strokeWidth"
                markerWidth="4" markerHeight="3"
                orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-green"/>
                </marker>
                <marker id="triangle-orange"
                viewBox="0 0 10 10" refX="7" refY="5" 
                markerUnits="strokeWidth"
                markerWidth="4" markerHeight="3"
                orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"  class="bk-arrow-color-orange"/>
                </marker>
        `;
        this.arrows.forEach(ar => {
            html += this.creatOneArrow(ar);
        });
        if (this.current.sq1 && this.current.sq2) {
            html += this.creatOneArrow(this.current);
        }
        html += `</svg>`;
        this.boardObj.arrowsLayer.innerHTML = html;
    }
    clearAll() {
        this.arrows = [];
        this.creat()
    }
    // end api
    setEvents() {
        let self = this;
        this.boardObj.event.on('sqDown', function (ev) {
            self.setMouseDown(ev);
        })
        this.boardObj.event.on('sqUp', function (ev) {
            self.setMouseUp(ev);
        })
        this.boardObj.event.on('mouseMove', function (ev) {
            self.setMouseMove(ev);
        })
    }

    setMouseDown(ev) {
        if (ev.e.which != 1) return;
        if (!(ev.e.ctrlKey || ev.e.altKey || ev.e.shiftKey)) return;
        if (this.boardObj.settings.arrow) {
            this.current.color = null;
            this.current.color = bkGraphicalBoard.bk_chessConsts.getColorFromEvent(ev.e);
            if (!this.current.color) this.current.color = 'green';
            this.current.sq1 = ev.sq;
        }
    }
    setMouseMove(ev) {

        this.drawCurentArrow(ev.sq);
    }
    setMouseUp() {
        this.setLastArrow()
    }
    setLastArrow() {

        let temp = this.current;
        this.current = { sq1: null, sq1: null, color: null };
        if (this.boardObj.settings.arrow && temp.sq1 && temp.sq2) {
            let newAroows = this.arrows.filter(arr => (arr.sq1.num != temp.sq1.num) || (arr.sq2.num != temp.sq2.num))
            if (newAroows.length == this.arrows.length) {
                newAroows.push(temp);
            }
            this.arrows = newAroows;
            this.creat()
        }


    }

    drawCurentArrow(sq) {
        if (!sq) return;
        if (this.boardObj.settings.arrow && this.current.sq1) {
            if (this.current.sq1.num != sq.num) {
                this.current.sq2 = sq;
                this.creat();
            }
        }
    }
    creatOneArrow(obj) {
        let lineClass = 'bk-arrow-color-' + obj.color;
        let targetHead = obj.color;
        let pos1 = obj.sq1.getArrowPos();
        let pos2 = obj.sq2.getArrowPos();
        let startX = pos1.left;
        let startY = pos1.top;
        let endX = pos2.left;
        let endY = pos2.top;
        let arr = `
              <line class="${lineClass}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" marker-end="url(#triangle-${targetHead})" style="stroke-width:6" />
            `;
        return arr;
    }

    creatArrow(arrObj) {
        this.current = arrObj;
        this.setLastArrow()
    }
}

bkGraphicalBoard.BkBoard = class {
    constructor(parentIdOrObj, settingObj) {
        this.parent = parentIdOrObj;
        if (typeof parentIdOrObj == 'string') {
            this.parent = document.getElementById(this.parent);
        }

        // this.parent.classList.add('position-relative')
        //pubs
        this.settings = {
            direction: 'w',
            canMove: false,
            setMask: false,
            imgSrc: settingObj.imgSrc,
            chessEngine: null
        };
        this.event = new MyEvent(); // api move finished emit move
        // end pubs
        this.board = this.arrow = this.glass = null;
        this.squersLayer = this.arrowsLayer = null;
        this.size = { side: 0, main: 0, board: 0 }
        this.allSquers = [];
        this.mainSqs = [];


        this.design = {
            light: 'white-sq',
            dark: 'black-sq',
        }
        this.mask = new bkGraphicalBoard.Mask(this);
        this.move = new bkGraphicalBoard.Move(this);
        this.fen = new bkGraphicalBoard.Fen(this); // public
        this.promotion = { w: null, b: null };
    }
    //apis
    // set setiings
    creat() {
        this.creatSquers();
        this.arrow = new bkGraphicalBoard.Arrow(this);
        this.glass = new bkGraphicalBoard.Glass(this);
        this.putSqs();
        this.setGlobalEvents();

    }
    creatArrow(sq1Name, sq2Name, color) {
        let sq1 = this.mainSqs.find(s => s.name == sq1Name);
        let sq2 = this.mainSqs.find(s => s.name == sq2Name);
        this.arrow.creatArrow({ sq1, sq2, color });
    }
    flip() {
        this.settings.direction = this.settings.direction == 'w' ? 'b' : 'w';
        this.putSqs();
        this.arrow.creat();
    };
    clearMasks() {
        this.mainSqs.forEach(sq => {
            sq.setMask('')
        });
    }
    clearArrows() {
        this.arrow.clearAll();
    }
    setPice(name, sqNum, emit = true) {
        let pice = new bkGraphicalBoard.Pice(this, name);
        let sq = this.findSquerByNum(sqNum);
        sq.setPice(pice, emit);
    }
    setPosition(fen) {
        this.clearPosition();
        var newfen = bkGraphicalBoard.bk_chessConsts.convertFen(fen);
        for (var i = 0; i < 64; i++) {
            if (newfen[i] == 0) {
                continue;
            }
            let piceName = bkGraphicalBoard.bk_chessConsts.getPiceNameFromFen(newfen[i]);
            this.setPice(piceName, i, false)
        }
        this.fen.setFen(fen)
    }
    clearPosition() {
        for (var i = 0; i < 64; i++) {
            this.mainSqs[i].setPice('');
        }
    };
    getFen() {
        return this.fen;
    }
    // end api

    resize() {
        this.setSize();
        this.allSquers.forEach(sq => {
            sq.setSize();
        });
    }
    setSize() {
        this.parent.style.width = '100%';

        // console.log('clientWidth', this.parent.offsetWidth);
        // this.parent.style.height = this.parent.style.width
        let boardSize = this.parent.offsetWidth;
        this.size.side = boardSize / 25;
        this.size.main = (boardSize - this.size.side * 2) / 8;
        this.parent.style.width = boardSize + 'px';
        this.parent.style.minHeight = (this.size.main * 8 + this.size.side * 2) + 'px';
        this.size.board = boardSize
    }
    setGlobalEvents() {

        let self = this;
        const resizeObserver = new ResizeObserver(entries => {
            self.resize();
        });
        resizeObserver.observe(self.parent);

        // $(window).on('resize', function () {

        //     self.resize();
        // })
        window.addEventListener('resize', function () {
            self.resize();
        })
    }
    findSquerByNum(num) {
        return this.allSquers.find(s => s.num == num);
    }
    creatSquers() {
        this.setSize();
        let sqNum = 0;
        for (let i = 0; i < 100; i++) {
            if (i == 0 || i == 9 || i == 90 || i == 99) {
                this.allSquers.push(new bkGraphicalBoard.SmallSq(this));
                continue;
            }
            if (i % 10 == 9 || i % 10 == 0) {
                this.allSquers.push(new bkGraphicalBoard.SideSq(this));
                continue;
            }
            if (i < 9 || i > 90) {
                this.allSquers.push(new bkGraphicalBoard.RowSq(this));
                continue;
            }
            let main = new bkGraphicalBoard.MainSq(this, sqNum);
            this.allSquers.push(main);
            this.mainSqs.push(main);
            sqNum++;
        }
        this.setupBoard();
    }
    sort(side) {
        let rows = bkGraphicalBoard.bk_chessConsts.getRows(side);
        let cols = bkGraphicalBoard.bk_chessConsts.getFiles(side);
        let sqs = [];
        let rowIndex = 0
        let colIndex = 0
        for (let i = 0; i < 100; i++) {
            let sq = this.allSquers[i];
            if (sq instanceof bkGraphicalBoard.MainSq) {
                sqs.push(this.allSquers.find(s => s.name == cols[colIndex] + rows[rowIndex]));
                colIndex++
                if (colIndex == 8) {
                    colIndex = 0;
                    rowIndex++;
                }
            } else {
                if (i % 10 == 0 && sq instanceof bkGraphicalBoard.SideSq) {
                    sq.setText(rows[rowIndex])
                }
                if (i > 90 && sq instanceof bkGraphicalBoard.RowSq) {
                    sq.setText(cols[colIndex])
                    colIndex++
                }
                sqs.push(sq)
            }
        }
        this.allSquers = sqs;
    }
    setupBoard() {
        //
        this.promotion.w = this.creatPromotionPart('w')
        this.parent.append(this.promotion.w);
        this.promotion.b = this.creatPromotionPart('b')
        this.parent.append(this.promotion.b);

        //
        this.board = document.createElement('div');
        this.board.classList.add('bk-board');
        this.parent.append(this.board);

        this.squersLayer = document.createElement('div');
        this.squersLayer.classList.add('bk-sqs');
        this.board.append(this.squersLayer);
        this.arrowsLayer = document.createElement('div');
        this.arrowsLayer.classList.add('bk-arrow-mask');
        this.board.append(this.arrowsLayer);
    }
    creatPromotionPart(side) {
        let row = document.createElement('div');
        row.classList.add('bk-board', 'w-100', 'd-flex', 'justify-content-center', 'd-none');
        row.style.backgroundColor = '#dbd7d1';
        row.append(this.creatPromotionPice(side + 'n'));
        row.append(this.creatPromotionPice(side + 'b'));
        row.append(this.creatPromotionPice(side + 'r'));
        row.append(this.creatPromotionPice(side + 'q'));
        return row;
    }
    creatPromotionPice(piceName) {
        let pice = document.createElement('img');
        pice.src = this.settings.imgSrc + `/${piceName}.svg`;
        pice.classList.add('bg-light', 'mx-1', 'rounded-2', 'my-1');
        pice.style.cssText = 'width: 12%; border: 1px solid;';
        let self = this;
        pice.addEventListener('click', function () {
            self.event.emit('promotion', piceName);
        })
        return pice;
    }
    putSqs() {
        this.squersLayer.innerHTML = '';
        this.sort(this.settings.direction);
        let row = null;
        for (let i = 0; i < this.allSquers.length; i++) {
            if (i % 10 == 0) {
                if (row) this.squersLayer.append(row)
                row = document.createElement('div');
                row.classList.add('bk-row');
            }
            row.append(this.allSquers[i].htmlObj)
        }
        this.squersLayer.append(row);
    }
}