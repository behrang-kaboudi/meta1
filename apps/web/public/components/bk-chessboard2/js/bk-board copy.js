function BkBoard (parentId, obj) {
  _self = this;

  //out Side parameter
  _self.settings = obj; // for pice image source obj.imgSrc
  _self.settings.fen =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  _self.settings.direction = 'w'; //"b"
  _self.settings.canMove = false;

  // drag
  _self.dragPiceSq1;
  _self.dragPiceSq2;
  //move
  _self.firstSqMove = null;
  _self.secSqMove = null;
  // move and drag
  _self.movePice;
  _self.settings.canMove = false;
  _self.settings.afterSecOrDrop = null;
  _self.settings.moveEndFunc = null;
  // تابع onclick
  _self.settings.click = false;
  _self.settings.clickFunc;
  // این ویژگی را بررسی میکند برای چیدن مهره مجوز و نام مهره نیاز است
  _self.settings.setPosition = false;
  _self.settings.piceForInsert = 'wk';
  //   افزودن قابلیت ماسک
  _self.settings.setMask = false;
  //consts read only
  // مهم دسترسی به تمام خانه از طریق شی صفحه و نام خانه
  _self.allSqs = {}; // all squers whith name dastresi va gharar dadan image dar on
  _self.maskeSqs = {}; // sq : mask name
  // arrows
  _self.arrow = {
    canCreatArrow: false,
    rightArrow: false,
    rightArrowSq: null,
    rightArrowSq2: null,
  };
  _self.arrowMask;
  _self.arrowMaskFirstSq;
  _self.arrowMaskSecSq;
  _self.arrowMaskAllSquers = []; //["a1/a4/bk-arrow-color-blue"]
  _self.sqAttrForName = 'sqname';
  _self.sqAttrForMask = 'maskname';
  _self.sqAttrForPiceName = 'picename';
  // private Parameters

  _self.parent = document.getElementById (parentId);
  _self.boardSize;
  _self.sqSize; // 8 sqs
  _self.sidebarSize; // mokhtasat
  _self.svg;
  // publics Api
  $ (window).resize (function () {
    _self.flipBoard ();
    _self.flipBoard ();
  });
  _self.flipBoard = function () {
    _self.initial ();
    if (_self.settings.direction == 'w') {
      _self.settings.direction = 'b';
      _self.creatBoardB ();
    } else {
      _self.settings.direction = 'w';
      _self.creatBoardW ();
    }
    _self.setPosition (_self.settings.fen);
    _self.setMaskedSqs ();
    _self.drawArrows ();
  };
  _self.clearArrows = function () {
    _self.arrowMaskAllSquers = [];
    _self.drawArrows ();
  };
  _self.creatBoard = function () {
    _self.initial ();
    if (_self.settings.direction == 'w') {
      _self.creatBoardW ();
    } else {
      _self.creatBoardB ();
    }
    _self.setPosition (_self.settings.fen);
    _self.drawArrows ();
  };
  _self.setFirstSqForMove = function (FirstSq) {
    if (!_self.firstSqMove) {
      if (_self.allSqs[FirstSq].childNodes.length == 0) return false;

      _self.firstSqMove = FirstSq;
      _self.setMask (_self.firstSqMove, 'move-mask');
      return true;
    }

    return true;
  };
  _self.setSecSqForMove = function (SecSq) {
    if (_self.firstSqMove == SecSq) {
      _self.removeMask (_self.firstSqMove);
      _self.firstSqMove = null;
      return false;
    }
    _self.secSqMove = SecSq;
    _self.setMask (_self.secSqMove, 'move-mask');
    return true;
  };
  _self.preMoveAndMoveOperation = function () {
    if (_self.settings.afterSecOrDrop) {
      if (_self.settings.afterSecOrDrop ()) {
        _self.doMove (_self.firstSqMove, _self.secSqMove);
      }
      _self.firstSqMove = _self.firstSqMove = null;
    } else {
      _self.doMove (_self.firstSqMove, _self.secSqMove);
      if (_self.settings.moveEndFunc) {
        _self.settings.moveEndFunc ();
      }
    }
  };
  _self.addAllEvent = function (svgObg) {
    svgObg.addEventListener ('dragover', ev => ev.preventDefault ());

    svgObg.addEventListener ('drop', function (e) {
      e.preventDefault ();
      // console.log ('drop');
      let sq = _self.getSqFromPoint (e.layerX, e.layerY);
      _self.dragPiceSq2 = sq;
      _self.PatchPiceToPlace (_self.movePice, _self.dragPiceSq2);
      _self.settings.fen = _self.getFen ();
      _self.removeMasks ();

      if (_self.settings.moveEndFunc) {
        _self.settings.moveEndFunc ();
      }
    });
    svgObg.addEventListener ('mousemove', function (e) {
      // console.log ('mousemove');
      if (_self.arrow.rightArrow && _self.arrow.rightArrowSq) {
        _self.arrow.rightArrowSq2 = _self.getSqFromPoint (e.layerX, e.layerY);

        console.log (_self.arrow.rightArrowSq);
        let lineClass = 'bk-arrow-color-orange';
        _self.drawArrows ();
        // if (_self.arrow.rightArrowSq == _self.arrow.rightArrowSq2) return;
        _self.getAroowLine (
          _self.arrow.rightArrowSq,
          _self.arrow.rightArrowSq2,
          lineClass
        );
        return;
      }
      if (_self.arrow.canCreatArrow) {
        if (_self.arrowMaskFirstSq) {
          _self.arrowMaskSecSq = _self.getSqFromPoint (e.layerX, e.layerY);
          if (_self.arrowMaskSecSq != _self.arrowMaskFirstSq) {
            _self.drawArrows ();
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
            _self.getAroowLine (
              _self.arrowMaskFirstSq,
              _self.arrowMaskSecSq,
              lineClass
            );
          }
        }
      }
    });
    svgObg.addEventListener ('mousedown', function (e) {
      console.log ('mousedown');
      let sq = _self.getSqFromPoint (e.layerX, e.layerY);
      // if (e.button == 2) {
      //   if (!_self.arrow.rightArrow) {
      //     _self.arrow.rightArrow = true;
      //     if (_self.arrow.rightArrowSq) {
      //       _self.arrow.rightArrowSq = null;
      //       _self.arrow.rightArrow = false;
      //       return;
      //     }
      //     _self.arrow.rightArrowSq = sq;
      //     return;
      //   }
      // }

      if (_self.arrow.canCreatArrow) {
        _self.arrowMaskFirstSq = sq;
        return;
      }
      if (_self.settings.canMove) {
        if (e.button != 0) {
          return;
        }
        if (e.shiftKey || e.ctrlKey || e.altKey) return;
        if (_self.allSqs[sq].childNodes.length > 0) {
          _self.dragPiceSq1 = sq;
          _self.PatchPiceToMother (sq);
          _self.setMask (sq, 'move-mask');
        }
      }
    });
    svgObg.addEventListener ('mouseup', function (e) {
      console.log ('mouseup');
      if (e.button == 2) {
        if (_self.arrow.rightArrow) {
          _self.arrow.rightArrowSq = null;
          _self.drawArrows ();
        }
      }
      if (_self.arrow.canCreatArrow) {
        _self.drawArrows ();
        if (
          _self.arrowMaskFirstSq != null &&
          _self.arrowMaskSecSq == _self.arrowMaskFirstSq
        ) {
          _self.arrowMaskSecSq = null;
          _self.arrowMaskFirstSq = null;
          return;
        }
        if (_self.arrowMaskSecSq == _self.arrowMaskFirstSq) {
          _self.arrowMaskSecSq = null;
          _self.arrowMaskFirstSq = null;
          return;
        }
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
        let arr =
          _self.arrowMaskFirstSq + '/' + _self.arrowMaskSecSq + '/' + lineClass;
        let index = _self.arrowMaskAllSquers.indexOf (arr);

        if (index > -1) {
          let temp = [];
          for (let i = 0; i < _self.arrowMaskAllSquers.length; i++) {
            if (_self.arrowMaskAllSquers[i] != arr) {
              temp.push (_self.arrowMaskAllSquers[i]);
            }
          }
          _self.arrowMaskAllSquers = temp;
        } else {
          _self.arrowMaskAllSquers.push (arr);
        }
        _self.drawArrows ();
        _self.arrowMaskSecSq = null;
        _self.arrowMaskFirstSq = null;
      }
    });

    svgObg.addEventListener ('click', function (e) {
      console.log ('click');
      console.log (e.button);
      if (e.button != 0) {
        return;
      }
      let sqName = _self.getSqFromPoint (e.layerX, e.layerY);

      if (_self.settings.setPosition) {
        _self.setPice (sqName, _self.settings.piceForInsert);
        _self.settings.fen = _self.getFen ();
        if (_self.settings.click) {
          _self.settings.clickFunc ();
        }
      }

      if (_self.settings.canMove) {
        if (e.shiftKey || e.ctrlKey || e.altKey) return;
        if (!_self.setFirstSqForMove (sqName)) return;
        if (!_self.setSecSqForMove (sqName)) return;
        _self.preMoveAndMoveOperation ();
      }
    });

    svgObg.addEventListener ('contextmenu', function (e) {
      console.log ('context', _self.arrow.rightArrow);
      e.preventDefault ();
      // if (_self.arrow.rightArrowSq) {
      //   _self.arrow.rightArrowSq = null;
      //   _self.arrow.rightArrowSq2 = null;
      //   _self.arrow.rightArrow = false;

      //   console.log ('context', _self.arrow.rightArrow);
      //   return;
      // }
      if (_self.settings.setMask) {
        if (e.ctrlKey && e.altKey) {
          maskname = 'orange-mask';
        } else if (e.ctrlKey) {
          maskname = 'red-mask';
        } else if (e.altKey) {
          maskname = 'blue-mask';
        } else {
          maskname = 'green-mask';
        }
        _self.setMask (_self.getSqFromPoint (e.layerX, e.layerY), maskname);

        return;
      }
    });
  };
  // arrow part
  _self.drawArrows = function () {
    _self.svgHolder.innerHTML = '';
    let arr = bkChessBoardConsts.boardSvg;

    _self.svgHolder.innerHTML += arr;
    let svg = document.getElementById ('bk-svg');
    _self.svg = svg;
    _self.addAllEvent (svg);
    _self.arrowMaskAllSquers.forEach (element => {
      let parts = element.split ('/');
      _self.getAroowLine (parts[0], parts[1], parts[2]);
    });
  };
  _self.getAroowLine = function (sq1, sq2, lineClass = 'bk-arrow-color-blue') {
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

    if (_self.settings.direction == 'w') {
      let sq1FileNum = bkChessBoardConsts.getFileNum (sq1[0]); //sq1
      startX =
        _self.sidebarSize + _self.sqSize * (sq1FileNum - 1) + _self.sqSize / 2;
      let sq2FileNum = bkChessBoardConsts.getFileNum (sq2[0]); //sq1
      let center = 3;
      if (sq1FileNum == sq2FileNum) {
        center = 2;
      }
      if (sq1FileNum > sq2FileNum) {
        center = 1.5;
      }
      endX =
        _self.sidebarSize +
        _self.sqSize * (sq2FileNum - 1) +
        _self.sqSize / center;
      let row1 = 9 - parseInt (sq1[1]);
      startY = _self.sidebarSize + _self.sqSize * (row1 - 1) + _self.sqSize / 2;
      let row2 = 9 - parseInt (sq2[1]);
      center = 1.3;
      // if()
      if (row1 == row2) {
        center = 2;
      }
      if (row1 < row2) {
        center = 2.8;
      }
      endY =
        _self.sidebarSize + _self.sqSize * (row2 - 1) + _self.sqSize / center;
    }
    if (_self.settings.direction == 'b') {
      let sq1FileNum = 9 - bkChessBoardConsts.getFileNum (sq1[0]); //sq1

      startX =
        _self.sidebarSize + _self.sqSize * (sq1FileNum - 1) + _self.sqSize / 2;
      let sq2FileNum = 9 - bkChessBoardConsts.getFileNum (sq2[0]); //sq1
      let center = 3;
      if (sq1FileNum == sq2FileNum) {
        center = 2;
      }
      if (sq1FileNum > sq2FileNum) {
        center = 1.4;
      }
      endX =
        _self.sidebarSize +
        _self.sqSize * (sq2FileNum - 1) +
        _self.sqSize / center;
      let row1 = parseInt (sq1[1]);
      startY = _self.sidebarSize + _self.sqSize * (row1 - 1) + _self.sqSize / 2;
      let row2 = parseInt (sq2[1]);
      center = 1.3;
      // if()
      if (row1 == row2) {
        center = 2;
      }
      if (row1 < row2) {
        center = 5;
      }
      endY =
        _self.sidebarSize + _self.sqSize * (row2 - 1) + _self.sqSize / center;
    }

    let classParts = lineClass.split ('-');
    let targetHead = classParts[classParts.length - 1];
    if (endX.toString () == 'NaN') {
      return;
    }
    if (startX.toString () == 'NaN') {
      return;
    }
    if (startY.toString () == 'NaN') {
      return;
    }
    if (endY.toString () == 'NaN') {
      return;
    }
    // _self.arrowMask.innerHTML = arr2;
    // _self.board.appendChild (_self.arrowMask);

    let arr = `
  <line class="${lineClass}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" marker-end="url(#triangle-${targetHead})" style="stroke-width:7" />
`;
    document.getElementById ('bk-svg').innerHTML += arr;
    // return arr;
  };
  _self.getSqFromPoint = function (x, y) {
    if (_self.settings.direction == 'w') {
      let fileX = Math.ceil ((x - _self.sidebarSize) / _self.sqSize);
      if (fileX <= 0) return false;
      let fileY = 9 - Math.ceil ((y - _self.sidebarSize) / _self.sqSize);
      if (fileY <= 0) return false;
      return bkChessBoardConsts.getNumFile (fileX) + fileY;
    }
    if (_self.settings.direction == 'b') {
      let fileX = Math.ceil ((x - _self.sidebarSize) / _self.sqSize);
      if (fileX <= 0) return false;
      fileX = 9 - fileX;
      let fileY = Math.ceil ((y - _self.sidebarSize) / _self.sqSize);
      if (fileY <= 0) return false;
      return bkChessBoardConsts.getNumFile (fileX) + fileY;
    }
  };
  _self.PatchPiceToMother = function (sqName) {
    let sqObj = _self.allSqs[sqName];
    _self.movePice = sqObj.firstChild;
    sqObj.innerHTML = '';
    let startPoint = _self.getSqstartPoinFromSq (sqName);
    let piceStyle = _self.movePice.style;
    piceStyle.position = 'absolute';
    piceStyle.top = startPoint.y + 'px';
    piceStyle.left = startPoint.x + 'px';
    piceStyle.width = _self.sqSize + 'px';
    piceStyle.height = _self.sqSize + 'px';
    piceStyle.zIndex = '1000';
    _self.board.appendChild (_self.movePice);
  };
  _self.PatchPiceToPlace = function (pice, sqName) {
    let parentSq2 = _self.allSqs[sqName];
    parentSq2.innerHTML = '';
    pice.style.position = 'static';
    pice.style.width = '100%';
    pice.style.height = '100%';
    pice.style.zIndex = '0';
    parentSq2.appendChild (pice);
  };
  _self.setPice = function (sq, piceName = '') {
    _self.allSqs[sq].innerHTML = '';
    if (piceName) {
      var img =
        `<img draggable="true" ${_self.sqAttrForPiceName} = ${piceName}` +
        ' src="' +
        obj.imgSrc;
      img = img + piceName;
      img = img + '.svg">';
      _self.allSqs[sq].innerHTML = img;
      let image = _self.allSqs[sq].firstChild;
      image.addEventListener ('mouseup', imageUp);
      function imageUp (e) {
        if (_self.firstSqMove) {
          if (!_self.setSecSqForMove (_self.dragPiceSq1)) return;
          _self.PatchPiceToPlace (_self.movePice, _self.dragPiceSq1);
          _self.dragPiceSq1 = null;
          _self.preMoveAndMoveOperation ();
        } else {
          _self.PatchPiceToPlace (_self.movePice, _self.dragPiceSq1);
          if (e.shiftKey || e.ctrlKey || e.altKey) return;
          if (_self.setFirstSqForMove (_self.dragPiceSq1))
            _self.dragPiceSq1 = null;
        }
      }

      return;
    }
  };
  _self.setPosition = function (fen) {
    // $ (_self.allSqclass).empty ();
    _self.clearPosition ();
    _self.settings.fen = fen;
    // $ (_self.allSqclass).innerHTML = '';
    var res = fen.split (' ');
    var fen1 = res[0];
    /// replace no piced with 0
    fen1 = fen1.replace (/1/g, '0');
    fen1 = fen1.replace (/2/g, '00');
    fen1 = fen1.replace (/3/g, '000');
    fen1 = fen1.replace (/4/g, '0000');
    fen1 = fen1.replace (/5/g, '00000');
    fen1 = fen1.replace (/6/g, '000000');
    fen1 = fen1.replace (/7/g, '0000000');
    fen1 = fen1.replace (/8/g, '00000000');
    var rows = fen1.split ('/');
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
      _self.setPice (
        bkChessBoardConsts.SQUARE_COORDINATES[i],
        bkChessBoardConsts.getPiceNameFromFen (newfen[i])
      );
    }
  };
  _self.clearPosition = function () {
    for (var i = 0; i < 64; i++) {
      _self.setPice (bkChessBoardConsts.SQUARE_COORDINATES[i]);
    }
    _self.settings.fen = _self.getFen ();
  };
  _self.getFen = function () {
    let fen = '';

    for (var i = 0; i < 64; i++) {
      if (i % 8 == 0 && i != 0) {
        fen += '/';
      }
      let pname = _self.getPiceNameFromSq (
        bkChessBoardConsts.SQUARE_COORDINATES[i]
      );
      fen += bkChessBoardConsts.getPiceCharFromName (pname);
    }
    if (_self.settings.direction == 'w') {
    }
    fen = fen.replace (/00000000/g, '8');
    fen = fen.replace (/0000000/g, '7');
    fen = fen.replace (/000000/g, '6');
    fen = fen.replace (/00000/g, '5');
    fen = fen.replace (/0000/g, '4');
    fen = fen.replace (/000/g, '3');
    fen = fen.replace (/00/g, '2');
    fen = fen.replace (/0/g, '1');
    var rows = fen.split ('/');
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
  _self.getPiceNameFromSq = function (sqName) {
    if (_self.allSqs[sqName].childNodes.length > 0) {
      return _self.allSqs[sqName].firstChild.getAttribute (
        _self.sqAttrForPiceName
      );
    }
    return '';
  };
  // privates
  //

  _self.setMask = function (sqName, maskName) {
    let sq = _self.allSqs[sqName];

    // empty pre
    let premaskname = sq.getAttribute (_self.sqAttrForMask);
    if (premaskname == 'move-mask') {
      return;
    }
    if (premaskname == maskName) {
      _self.removeMask (sqName);
      return;
    }
    sq.classList.remove (premaskname);
    // creat new
    let attMask = document.createAttribute (_self.sqAttrForMask);
    attMask.value = maskName;
    sq.setAttributeNode (attMask);
    sq.classList.add (maskName);
    _self.maskeSqs[sqName] = maskName;
  };
  _self.removeMask = function (sqName) {
    let sq = _self.allSqs[sqName];
    // empty pre
    let premaskname = sq.getAttribute (_self.sqAttrForMask);
    sq.classList.remove (premaskname);
    // creat new
    let attMask = document.createAttribute (_self.sqAttrForMask);
    attMask.value = 'empty';
    sq.setAttributeNode (attMask);
    delete _self.maskeSqs[sqName];
  };
  _self.removeMasks = function () {
    for (let index = 0; index < 64; index++) {
      _self.removeMask (bkChessBoardConsts.SQUARE_COORDINATES[index]);
    }
  };
  _self.setMaskedSqs = function () {
    for (const property in _self.maskeSqs) {
      _self.setMask (`${property}`, `${_self.maskeSqs[property]}`);
    }
  };
  _self.doMove = function (sq1, sq2) {
    _self.firstSqMove = _self.secSqMove = null;
    if (!sq1 || !sq2) {
      return;
    }
    let img = _self.allSqs[sq1].firstChild;
    _self.PatchPiceToMother (sq1);
    let time = bkChessBoardConsts.timeForAnimation (sq1, sq2);
    let endPoint = _self.getSqstartPoinFromSq (sq2);

    $ (img).animate ({top: endPoint.y, left: endPoint.x}, time, function () {
      _self.allSqs[sq2].innerHTML = '';
      _self.PatchPiceToPlace (img, sq2);
      //////
      _self.movePice = null;
      _self.maskeSqs = [];
      _self.settings.fen = _self.getFen ();
      _self.removeMasks ();
      if (_self.settings.moveEndFunc) {
        _self.settings.moveEndFunc ();
      }
    });
  };
  _self.getSqstartPoinFromSq = function (sq) {
    let point = {x: 0, y: 0};
    if (_self.settings.direction == 'w') {
      point.x +=
        _self.sidebarSize +
        _self.sqSize * (bkChessBoardConsts.getFileNum (sq[0]) - 1);
      point.y += _self.sidebarSize + _self.sqSize * (9 - parseInt (sq[1]) - 1);
    }
    if (_self.settings.direction == 'b') {
      point.x +=
        _self.sidebarSize +
        _self.sqSize * (9 - bkChessBoardConsts.getFileNum (sq[0]) - 1);
      point.y += _self.sidebarSize + _self.sqSize * (parseInt (sq[1]) - 1);
    }
    return point;
  };
  _self.initial = function () {
    _self.allSqs = {};
    _self.parent.innerHTML = '';
    _self.parent.style.boxSizing = 'border-box';
    _self.parent.style.width = '100%';
    _self.boardSize = _self.parent.offsetWidth;
    _self.parent.style.height = _self.boardSize + 'px';
    // creat board layer
    _self.board = document.createElement ('div');
    _self.board.classList.add ('bk-board');
    _self.parent.appendChild (_self.board);
    _self.board.style.width = _self.board.style.height = '100%';
    // sizing
    _self.sidebarSize = _self.boardSize / 25; // mokhtasat
    _self.sqSize = (_self.boardSize - _self.sidebarSize * 2) / 8; // 8 sqs
    //div
    // creat svg holder
    _self.svgHolder = document.createElement ('div');
    _self.svgHolder.classList.add ('bk-arrow-mask');
    _self.board.appendChild (_self.svgHolder);
  };
  _self.creatSmallSq = function () {
    let smallSq = document.createElement ('div');
    smallSq.style.height = smallSq.style.width = _self.sidebarSize + 'px';
    return smallSq;
  };
  _self.creatRowFildSq = function (cssClass, data = '') {
    let smallSq = document.createElement ('div');
    // smallSq.style.backgroundColor = 'red';
    smallSq.classList.add (cssClass);
    smallSq.style.height = _self.sidebarSize + 'px';
    smallSq.style.width = _self.sqSize + 'px';
    if (data) {
      // smallSq.innerText = data;
      let x = _self.sqSize / 2;
      let y = _self.sidebarSize / 2 + _self.sidebarSize * 30 / 100;
      let fontsize = _self.sidebarSize;
      // console.log(data);
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
  _self.creatColRowSq = function (cssClass, number = '') {
    let smallSq = document.createElement ('div');
    // smallSq.style.backgroundColor = 'red';
    smallSq.classList.add (cssClass);
    smallSq.style.height = _self.sqSize + 'px';
    smallSq.style.width = _self.sidebarSize + 'px';
    if (number) {
      // smallSq.innerText = data;
      let x = _self.sidebarSize / 2 - _self.sidebarSize * 25 / 100;
      let y = _self.sqSize / 2 + _self.sqSize * 15 / 100;
      let fontsize = _self.sidebarSize;
      let img = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' ><text x='${x}' y='${y}'  font-size='${fontsize}px' font-weight='bold'>${number}</text></svg>")`;
      smallSq.style.backgroundImage = img;
    }
    return smallSq;
  };
  _self.creatSq = function (cssClass, sqName) {
    let smallSq = document.createElement ('div');
    smallSq.classList.add (cssClass);
    smallSq.style.height = smallSq.style.width = _self.sqSize + 'px';
    let att = document.createAttribute (_self.sqAttrForName);
    att.value = sqName;
    smallSq.setAttributeNode (att);
    let attMask = document.createAttribute (_self.sqAttrForMask);
    attMask.value = 'empty';
    smallSq.setAttributeNode (attMask);
    _self.allSqs[sqName] = smallSq;
    return smallSq;
  };
  _self.creatTopRow = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (_self.creatSmallSq ());
    for (let index = 0; index < 8; index++) {
      row.appendChild (_self.creatRowFildSq ('top-bar'));
    }
    row.appendChild (_self.creatSmallSq ());
    _self.board.appendChild (row);
  };
  _self.creatRowW = function (rowNum) {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    let firstColor = 'white-sq';
    let secColor = 'black-sq';
    if (rowNum % 2 == 1) {
      firstColor = 'black-sq';
      secColor = 'white-sq';
    }
    row.appendChild (_self.creatColRowSq ('left-bar', rowNum));
    row.appendChild (_self.creatSq (firstColor, 'a' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'b' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'c' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'd' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'e' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'f' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'g' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'h' + rowNum));
    row.appendChild (_self.creatColRowSq ('right-bar'));
    _self.board.appendChild (row);
  };
  _self.creatRowB = function (rowNum) {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    let firstColor = 'black-sq';
    let secColor = 'white-sq';
    if (rowNum % 2 == 1) {
      firstColor = 'white-sq';
      secColor = 'black-sq';
    }
    row.appendChild (_self.creatColRowSq ('left-bar'));
    row.appendChild (_self.creatSq (firstColor, 'h' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'g' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'f' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'e' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'd' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'c' + rowNum));
    row.appendChild (_self.creatSq (firstColor, 'b' + rowNum));
    row.appendChild (_self.creatSq (secColor, 'a' + rowNum));
    row.appendChild (_self.creatColRowSq ('right-bar', rowNum));
    _self.board.appendChild (row);
  };
  _self.creatBottomRowW = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (_self.creatSmallSq ());
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'a'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'b'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'c'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'd'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'e'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'f'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'g'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'h'));
    row.appendChild (_self.creatSmallSq ());
    _self.board.appendChild (row);
  };
  _self.creatBottomRowB = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (_self.creatSmallSq ());
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'h'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'g'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'f'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'e'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'd'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'c'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'b'));
    row.appendChild (_self.creatRowFildSq ('bottom-bar', 'a'));
    row.appendChild (_self.creatSmallSq ());
    _self.board.appendChild (row);
  };
  _self.creatBoardW = function () {
    _self.creatTopRow ();
    _self.creatRowW (8);
    _self.creatRowW (7);
    _self.creatRowW (6);
    _self.creatRowW (5);
    _self.creatRowW (4);
    _self.creatRowW (3);
    _self.creatRowW (2);
    _self.creatRowW (1);
    _self.creatBottomRowW ();
  };
  _self.creatBoardB = function () {
    _self.creatTopRow ();
    _self.creatRowB (1);
    _self.creatRowB (2);
    _self.creatRowB (3);
    _self.creatRowB (4);
    _self.creatRowB (5);
    _self.creatRowB (6);
    _self.creatRowB (7);
    _self.creatRowB (8);
    _self.creatBottomRowB ();
  };
}
