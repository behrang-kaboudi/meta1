function BkBoard (parentId, obj) {
  bd = this;

  //out Side parameter board settongs
  bd.settings = obj; // for pice image source obj.imgSrc
  bd.settings = {
    fen: bkChessBoardConsts.startFen,
    direction: 'w', //"b"
    canMove: false,
    //   افزودن قابلیت ماسک
    setMask: false,
    // این ویژگی را بررسی میکند برای چیدن مهره مجوز و نام مهره نیاز است
    setPosition: false,
    piceForInsert: null,
    afterSecOrDrop: null,
    //funcs توابع بعد از هر قسمتی
    moveEndFunc: null,
  };

  // // drag
  // bd.dragPiceSq1;
  // bd.dragPiceSq2;
  //move
  bd.firstSqMove = null;
  bd.secSqMove = null;
  // move and drag
  bd.movePice;

  //consts read only
  // مهم دسترسی به تمام خانه از طریق شی صفحه و نام خانه
  bd.allSqs = {}; // all squers whith name dastresi va gharar dadan image dar on
  bd.maskeSqs = {}; // sq : mask name
  // arrows
  bd.arrow = {
    canCreatArrow: false,
    rightArrow: false,
    rightArrowSq: null,
    rightArrowSq2: null,
  };
  bd.arrowMask;
  bd.arrowMaskFirstSq;
  bd.arrowMaskSecSq;
  bd.arrowMaskAllSquers = []; //["a1/a4/bk-arrow-color-blue"]
  bd.sqAttrForName = 'sqname';
  bd.sqAttrForMask = 'maskname';
  bd.sqAttrForPiceName = 'picename';
  bd.imgAttrForParent = 'sqName';
  // private Parameters

  bd.parent = document.getElementById (parentId);
  bd.boardSize;
  bd.sqSize; // 8 sqs
  bd.sidebarSize; // mokhtasat
  bd.svg;
  // publics Api
  $ (window).resize (function () {
    bd.flipBoard ();
    bd.flipBoard ();
  });

  bd.clearArrows = function () {
    bd.arrowMaskAllSquers = [];
    bd.drawArrows ();
  };
  bd.creatBoard = function () {
    bd.initial ();
    if (bd.settings.direction == 'w') {
      bd.creatBoardW ();
    } else {
      bd.creatBoardB ();
    }
    bd.setPosition (bd.settings.fen);
    bd.drawArrows ();
  };

  bd.getPiceFromsq = function (Sq) {
    if (bd.allSqs[Sq].childNodes.length == 0) return false;
    return bd.allSqs[Sq].firstChild;
  };

  bd.preMoveAndMoveOperation = function () {
    if (bd.settings.afterSecOrDrop) {
      if (bd.settings.afterSecOrDrop ()) {
        bd.doMove (bd.firstSqMove, bd.secSqMove);
      }
      bd.firstSqMove = bd.firstSqMove = null;
    } else {
      bd.doMove (bd.firstSqMove, bd.secSqMove);
      if (bd.settings.moveEndFunc) {
        bd.settings.moveEndFunc ();
      }
    }
    bd.firstSqMove = bd.secSqMove = null;
  };
  bd.addAllEvent = function (svgObg) {
    svgObg.addEventListener ('dragover', ev => ev.preventDefault ());

    svgObg.addEventListener ('drop', function (e) {
      e.preventDefault ();
      console.log ('drop');
      let sq = bd.getSqFromPoint (e.layerX, e.layerY);
      bd.dragPiceSq2 = sq;
      bd.PatchPiceToPlace (bd.movePice, bd.dragPiceSq2);
      bd.firstSqMove = bd.secSqMove = null;
      bd.settings.fen = bd.getFen ();
      bd.removeMasks ();

      if (bd.settings.moveEndFunc) {
        bd.settings.moveEndFunc ();
      }
    });
    svgObg.addEventListener ('mousemove', function (e) {
      // console.log ('mousemove');
      if (bd.arrow.rightArrow && bd.arrow.rightArrowSq) {
        bd.arrow.rightArrowSq2 = bd.getSqFromPoint (e.layerX, e.layerY);

        console.log (bd.arrow.rightArrowSq);
        let lineClass = 'bk-arrow-color-orange';
        bd.drawArrows ();
        // if (bd.arrow.rightArrowSq == bd.arrow.rightArrowSq2) return;
        bd.getAroowLine (
          bd.arrow.rightArrowSq,
          bd.arrow.rightArrowSq2,
          lineClass
        );
        return;
      }
      if (bd.arrow.canCreatArrow) {
        if (bd.arrowMaskFirstSq) {
          bd.arrowMaskSecSq = bd.getSqFromPoint (e.layerX, e.layerY);
          if (bd.arrowMaskSecSq != bd.arrowMaskFirstSq) {
            bd.drawArrows ();
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
            bd.getAroowLine (bd.arrowMaskFirstSq, bd.arrowMaskSecSq, lineClass);
          }
        }
      }
    });
    svgObg.addEventListener ('mousedown', function (e) {
      let sq = bd.getSqFromPoint (e.layerX, e.layerY);
      if (bd.settings.canMove) {
        if (e.shiftKey || e.ctrlKey || e.altKey) return;
        if (e.button != 0) return;
        if (!bd.firstSqMove) {
          if (bd.getPiceFromsq (sq)) {
            bd.firstSqMove = sq;
            bd.setMask (bd.firstSqMove, 'move-mask');
            bd.dragPiceSq1 = sq;
            bd.PatchPiceToMother (sq);
          }
          return;
        } else {
          if (bd.getPiceFromsq (sq)) {
          } else {
            // disable drag
          }
          bd.secSqMove = sq;
          bd.setMask (bd.secSqMove, 'move-mask');

          bd.preMoveAndMoveOperation ();
        }

        // if (!bd.setFirstSqForMove (sqName)) return;
        // if (!bd.setSecSqForMove (sqName)) return;
      }
      // if (e.button == 2) {
      //   if (!bd.arrow.rightArrow) {
      //     bd.arrow.rightArrow = true;
      //     if (bd.arrow.rightArrowSq) {
      //       bd.arrow.rightArrowSq = null;
      //       bd.arrow.rightArrow = false;
      //       return;
      //     }
      //     bd.arrow.rightArrowSq = sq;
      //     return;
      //   }
      // }

      if (bd.arrow.canCreatArrow) {
        bd.arrowMaskFirstSq = sq;
        return;
      }
      // if (bd.settings.canMove) {
      //   if (e.button != 0) {
      //     return;
      //   }
      //   if (e.shiftKey || e.ctrlKey || e.altKey) return;
      //   if (bd.allSqs[sq].childNodes.length > 0) {
      //     bd.dragPiceSq1 = sq;
      //     bd.PatchPiceToMother (sq);
      //     bd.setMask (sq, 'move-mask');
      //   }
      // }
    });
    svgObg.addEventListener ('mouseup', function (e) {
      console.log ('mouseup');
      console.log (e.button);
      if (e.button == 2) {
        if (bd.arrow.rightArrow) {
          bd.arrow.rightArrowSq = null;
          bd.drawArrows ();
        }
      }
      if (bd.arrow.canCreatArrow) {
        bd.drawArrows ();
        if (
          bd.arrowMaskFirstSq != null &&
          bd.arrowMaskSecSq == bd.arrowMaskFirstSq
        ) {
          bd.arrowMaskSecSq = null;
          bd.arrowMaskFirstSq = null;
          return;
        }
        if (bd.arrowMaskSecSq == bd.arrowMaskFirstSq) {
          bd.arrowMaskSecSq = null;
          bd.arrowMaskFirstSq = null;
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
          bd.arrowMaskFirstSq + '/' + bd.arrowMaskSecSq + '/' + lineClass;
        let index = bd.arrowMaskAllSquers.indexOf (arr);

        if (index > -1) {
          let temp = [];
          for (let i = 0; i < bd.arrowMaskAllSquers.length; i++) {
            if (bd.arrowMaskAllSquers[i] != arr) {
              temp.push (bd.arrowMaskAllSquers[i]);
            }
          }
          bd.arrowMaskAllSquers = temp;
        } else {
          bd.arrowMaskAllSquers.push (arr);
        }
        bd.drawArrows ();
        bd.arrowMaskSecSq = null;
        bd.arrowMaskFirstSq = null;
      }
    });

    svgObg.addEventListener ('click', function (e) {
      console.log ('click');
      console.log (e.button);
      if (e.button != 0) {
        return;
      }
      let sqName = bd.getSqFromPoint (e.layerX, e.layerY);

      if (bd.settings.setPosition) {
        bd.setPice (sqName, bd.settings.piceForInsert);
        bd.settings.fen = bd.getFen ();
        if (bd.settings.click) {
          bd.settings.clickFunc ();
        }
      }

      // if (bd.settings.canMove) {
      //   if (e.shiftKey || e.ctrlKey || e.altKey) return;
      //   if (!bd.setFirstSqForMove (sqName)) return;
      //   if (!bd.setSecSqForMove (sqName)) return;
      //   bd.preMoveAndMoveOperation ();
      // }
    });

    svgObg.addEventListener ('contextmenu', function (e) {
      console.log ('context', bd.arrow.rightArrow);
      e.preventDefault ();
      // if (bd.arrow.rightArrowSq) {
      //   bd.arrow.rightArrowSq = null;
      //   bd.arrow.rightArrowSq2 = null;
      //   bd.arrow.rightArrow = false;

      //   console.log ('context', bd.arrow.rightArrow);
      //   return;
      // }
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
        bd.setMask (bd.getSqFromPoint (e.layerX, e.layerY), maskname);

        return;
      }
    });
  };
  // arrow part
  bd.drawArrows = function () {
    bd.svgHolder.innerHTML = '';
    let arr = bkChessBoardConsts.boardSvg;

    bd.svgHolder.innerHTML += arr;
    let svg = document.getElementById ('bk-svg');
    bd.svg = svg;
    bd.addAllEvent (svg);
    bd.arrowMaskAllSquers.forEach (element => {
      let parts = element.split ('/');
      bd.getAroowLine (parts[0], parts[1], parts[2]);
    });
  };
  bd.getAroowLine = function (sq1, sq2, lineClass = 'bk-arrow-color-blue') {
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
      let sq1FileNum = bkChessBoardConsts.getFileNum (sq1[0]); //sq1
      startX = bd.sidebarSize + bd.sqSize * (sq1FileNum - 1) + bd.sqSize / 2;
      let sq2FileNum = bkChessBoardConsts.getFileNum (sq2[0]); //sq1
      let center = 3;
      if (sq1FileNum == sq2FileNum) {
        center = 2;
      }
      if (sq1FileNum > sq2FileNum) {
        center = 1.5;
      }
      endX = bd.sidebarSize + bd.sqSize * (sq2FileNum - 1) + bd.sqSize / center;
      let row1 = 9 - parseInt (sq1[1]);
      startY = bd.sidebarSize + bd.sqSize * (row1 - 1) + bd.sqSize / 2;
      let row2 = 9 - parseInt (sq2[1]);
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
      let sq1FileNum = 9 - bkChessBoardConsts.getFileNum (sq1[0]); //sq1

      startX = bd.sidebarSize + bd.sqSize * (sq1FileNum - 1) + bd.sqSize / 2;
      let sq2FileNum = 9 - bkChessBoardConsts.getFileNum (sq2[0]); //sq1
      let center = 3;
      if (sq1FileNum == sq2FileNum) {
        center = 2;
      }
      if (sq1FileNum > sq2FileNum) {
        center = 1.4;
      }
      endX = bd.sidebarSize + bd.sqSize * (sq2FileNum - 1) + bd.sqSize / center;
      let row1 = parseInt (sq1[1]);
      startY = bd.sidebarSize + bd.sqSize * (row1 - 1) + bd.sqSize / 2;
      let row2 = parseInt (sq2[1]);
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
    // bd.arrowMask.innerHTML = arr2;
    // bd.board.appendChild (bd.arrowMask);

    let arr = `
  <line class="${lineClass}" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" marker-end="url(#triangle-${targetHead})" style="stroke-width:7" />
`;
    document.getElementById ('bk-svg').innerHTML += arr;
    // return arr;
  };
  bd.getSqFromPoint = function (x, y) {
    if (bd.settings.direction == 'w') {
      let fileX = Math.ceil ((x - bd.sidebarSize) / bd.sqSize);
      if (fileX <= 0) return false;
      let fileY = 9 - Math.ceil ((y - bd.sidebarSize) / bd.sqSize);
      if (fileY <= 0) return false;
      return bkChessBoardConsts.getNumFile (fileX) + fileY;
    }
    if (bd.settings.direction == 'b') {
      let fileX = Math.ceil ((x - bd.sidebarSize) / bd.sqSize);
      if (fileX <= 0) return false;
      fileX = 9 - fileX;
      let fileY = Math.ceil ((y - bd.sidebarSize) / bd.sqSize);
      if (fileY <= 0) return false;
      return bkChessBoardConsts.getNumFile (fileX) + fileY;
    }
  };
  bd.PatchPiceToMother = function (sqName) {
    let sqObj = bd.allSqs[sqName];
    bd.movePice = sqObj.firstChild;
    sqObj.innerHTML = '';
    let startPoint = bd.getSqstartPoinFromSq (sqName);
    let piceStyle = bd.movePice.style;
    piceStyle.position = 'absolute';
    piceStyle.top = startPoint.y + 'px';
    piceStyle.left = startPoint.x + 'px';
    piceStyle.width = bd.sqSize + 'px';
    piceStyle.height = bd.sqSize + 'px';
    piceStyle.zIndex = '1000';
    bd.board.appendChild (bd.movePice);
  };
  bd.PatchPiceToPlace = function (pice, sqName) {
    let parentSq2 = bd.allSqs[sqName];
    parentSq2.innerHTML = '';
    pice.style.position = 'static';
    pice.style.width = '100%';
    pice.style.height = '100%';
    pice.style.zIndex = '0';
    parentSq2.appendChild (pice);
    pice.setAttribute (bd.imgAttrForParent, sqName);
  };
  bd.setPice = function (sq, piceName = '') {
    bd.allSqs[sq].innerHTML = '';
    if (piceName) {
      var img =
        `<img ${bd.imgAttrForParent} = "${sq}" draggable="true" ${bd.sqAttrForPiceName} = ${piceName}` +
        ' src="' +
        obj.imgSrc;
      img = img + piceName;
      img = img + '.svg">';
      bd.allSqs[sq].innerHTML = img;
      let image = bd.allSqs[sq].firstChild;
      image.addEventListener ('mouseup', imageUp);
      function imageUp (e) {
        // if (dropsq == bd.firstSqMove) {
        let dropSq = image.getAttribute (bd.imgAttrForParent);
        console.log (dropSq);
        bd.PatchPiceToPlace (image, dropSq);
        bd.dragPiceSq1 = null;
        //   return;
        // }
        // if (bd.firstSqMove) {
        //   if (!bd.setSecSqForMove (bd.dragPiceSq1)) return;
        //
        //   bd.preMoveAndMoveOperation ();
        // } else {
        //   bd.PatchPiceToPlace (bd.movePice, bd.dragPiceSq1);
        //   if (e.shiftKey || e.ctrlKey || e.altKey) return;
        //   if (bd.setFirstSqForMove (bd.dragPiceSq1))
        //     bd.dragPiceSq1 = null;
        // }
      }

      return;
    }
  };
  bd.setPosition = function (fen) {
    // $ (bd.allSqclass).empty ();
    bd.clearPosition ();
    bd.settings.fen = fen;
    // $ (bd.allSqclass).innerHTML = '';
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
      bd.setPice (
        bkChessBoardConsts.SQUARE_COORDINATES[i],
        bkChessBoardConsts.getPiceNameFromFen (newfen[i])
      );
    }
  };
  bd.clearPosition = function () {
    for (var i = 0; i < 64; i++) {
      bd.setPice (bkChessBoardConsts.SQUARE_COORDINATES[i]);
    }
    bd.settings.fen = bd.getFen ();
  };
  bd.getFen = function () {
    let fen = '';

    for (var i = 0; i < 64; i++) {
      if (i % 8 == 0 && i != 0) {
        fen += '/';
      }
      let pname = bd.getPiceNameFromSq (
        bkChessBoardConsts.SQUARE_COORDINATES[i]
      );
      fen += bkChessBoardConsts.getPiceCharFromName (pname);
    }
    if (bd.settings.direction == 'w') {
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
  bd.getPiceNameFromSq = function (sqName) {
    if (bd.allSqs[sqName].childNodes.length > 0) {
      return bd.allSqs[sqName].firstChild.getAttribute (bd.sqAttrForPiceName);
    }
    return '';
  };
  bd.flipBoard = function () {
    bd.initial ();
    if (bd.settings.direction == 'w') {
      bd.settings.direction = 'b';
      bd.creatBoardB ();
    } else {
      bd.settings.direction = 'w';
      bd.creatBoardW ();
    }
    bd.setPosition (bd.settings.fen);
    bd.setMaskedSqs ();
    bd.drawArrows ();
  };
  // privates
  //

  bd.setMask = function (sqName, maskName) {
    let sq = bd.allSqs[sqName];

    // empty pre
    let premaskname = sq.getAttribute (bd.sqAttrForMask);
    if (premaskname == 'move-mask') {
      return;
    }
    if (premaskname == maskName) {
      bd.removeMask (sqName);
      return;
    }
    sq.classList.remove (premaskname);
    // creat new
    let attMask = document.createAttribute (bd.sqAttrForMask);
    attMask.value = maskName;
    sq.setAttributeNode (attMask);
    sq.classList.add (maskName);
    bd.maskeSqs[sqName] = maskName;
  };
  bd.removeMask = function (sqName) {
    let sq = bd.allSqs[sqName];
    // empty pre
    let premaskname = sq.getAttribute (bd.sqAttrForMask);
    sq.classList.remove (premaskname);
    // creat new
    let attMask = document.createAttribute (bd.sqAttrForMask);
    attMask.value = 'empty';
    sq.setAttributeNode (attMask);
    delete bd.maskeSqs[sqName];
  };
  bd.removeMasks = function () {
    for (let index = 0; index < 64; index++) {
      bd.removeMask (bkChessBoardConsts.SQUARE_COORDINATES[index]);
    }
  };
  bd.setMaskedSqs = function () {
    for (const property in bd.maskeSqs) {
      bd.setMask (`${property}`, `${bd.maskeSqs[property]}`);
    }
  };
  bd.doMove = function (sq1, sq2) {
    bd.firstSqMove = bd.secSqMove = null;
    if (!sq1 || !sq2) {
      return;
    }
    let img = bd.allSqs[sq1].firstChild;
    bd.PatchPiceToMother (sq1);
    let time = bkChessBoardConsts.timeForAnimation (sq1, sq2);
    let endPoint = bd.getSqstartPoinFromSq (sq2);

    $ (img).animate ({top: endPoint.y, left: endPoint.x}, time, function () {
      bd.allSqs[sq2].innerHTML = '';
      bd.PatchPiceToPlace (img, sq2);
      //////
      bd.movePice = null;
      bd.maskeSqs = [];
      bd.settings.fen = bd.getFen ();
      bd.removeMasks ();
      if (bd.settings.moveEndFunc) {
        bd.settings.moveEndFunc ();
      }
    });
  };
  bd.getSqstartPoinFromSq = function (sq) {
    let point = {x: 0, y: 0};
    if (bd.settings.direction == 'w') {
      point.x +=
        bd.sidebarSize +
        bd.sqSize * (bkChessBoardConsts.getFileNum (sq[0]) - 1);
      point.y += bd.sidebarSize + bd.sqSize * (9 - parseInt (sq[1]) - 1);
    }
    if (bd.settings.direction == 'b') {
      point.x +=
        bd.sidebarSize +
        bd.sqSize * (9 - bkChessBoardConsts.getFileNum (sq[0]) - 1);
      point.y += bd.sidebarSize + bd.sqSize * (parseInt (sq[1]) - 1);
    }
    return point;
  };
  bd.initial = function () {
    bd.allSqs = {};
    bd.parent.innerHTML = '';
    bd.parent.style.boxSizing = 'border-box';
    bd.parent.style.width = '100%';
    bd.boardSize = bd.parent.offsetWidth;
    bd.parent.style.height = bd.boardSize + 'px';
    // creat board layer
    bd.board = document.createElement ('div');
    bd.board.classList.add ('bk-board');
    bd.parent.appendChild (bd.board);
    bd.board.style.width = bd.board.style.height = '100%';
    // sizing
    bd.sidebarSize = bd.boardSize / 25; // mokhtasat
    bd.sqSize = (bd.boardSize - bd.sidebarSize * 2) / 8; // 8 sqs
    //div
    // creat svg holder
    bd.svgHolder = document.createElement ('div');
    bd.svgHolder.classList.add ('bk-arrow-mask');
    bd.board.appendChild (bd.svgHolder);
  };
  bd.creatSmallSq = function () {
    let smallSq = document.createElement ('div');
    smallSq.style.height = smallSq.style.width = bd.sidebarSize + 'px';
    return smallSq;
  };
  bd.creatRowFildSq = function (cssClass, data = '') {
    let smallSq = document.createElement ('div');
    // smallSq.style.backgroundColor = 'red';
    smallSq.classList.add (cssClass);
    smallSq.style.height = bd.sidebarSize + 'px';
    smallSq.style.width = bd.sqSize + 'px';
    if (data) {
      // smallSq.innerText = data;
      let x = bd.sqSize / 2;
      let y = bd.sidebarSize / 2 + bd.sidebarSize * 30 / 100;
      let fontsize = bd.sidebarSize;
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
  bd.creatColRowSq = function (cssClass, number = '') {
    let smallSq = document.createElement ('div');
    // smallSq.style.backgroundColor = 'red';
    smallSq.classList.add (cssClass);
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
  bd.creatSq = function (cssClass, sqName) {
    let smallSq = document.createElement ('div');
    smallSq.classList.add (cssClass);
    smallSq.style.height = smallSq.style.width = bd.sqSize + 'px';
    let att = document.createAttribute (bd.sqAttrForName);
    att.value = sqName;
    smallSq.setAttributeNode (att);
    let attMask = document.createAttribute (bd.sqAttrForMask);
    attMask.value = 'empty';
    smallSq.setAttributeNode (attMask);
    bd.allSqs[sqName] = smallSq;
    return smallSq;
  };
  bd.creatTopRow = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (bd.creatSmallSq ());
    for (let index = 0; index < 8; index++) {
      row.appendChild (bd.creatRowFildSq ('top-bar'));
    }
    row.appendChild (bd.creatSmallSq ());
    bd.board.appendChild (row);
  };
  bd.creatRowW = function (rowNum) {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    let firstColor = 'white-sq';
    let secColor = 'black-sq';
    if (rowNum % 2 == 1) {
      firstColor = 'black-sq';
      secColor = 'white-sq';
    }
    row.appendChild (bd.creatColRowSq ('left-bar', rowNum));
    row.appendChild (bd.creatSq (firstColor, 'a' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'b' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'c' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'd' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'e' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'f' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'g' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'h' + rowNum));
    row.appendChild (bd.creatColRowSq ('right-bar'));
    bd.board.appendChild (row);
  };
  bd.creatRowB = function (rowNum) {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    let firstColor = 'black-sq';
    let secColor = 'white-sq';
    if (rowNum % 2 == 1) {
      firstColor = 'white-sq';
      secColor = 'black-sq';
    }
    row.appendChild (bd.creatColRowSq ('left-bar'));
    row.appendChild (bd.creatSq (firstColor, 'h' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'g' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'f' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'e' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'd' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'c' + rowNum));
    row.appendChild (bd.creatSq (firstColor, 'b' + rowNum));
    row.appendChild (bd.creatSq (secColor, 'a' + rowNum));
    row.appendChild (bd.creatColRowSq ('right-bar', rowNum));
    bd.board.appendChild (row);
  };
  bd.creatBottomRowW = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (bd.creatSmallSq ());
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'a'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'b'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'c'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'd'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'e'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'f'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'g'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'h'));
    row.appendChild (bd.creatSmallSq ());
    bd.board.appendChild (row);
  };
  bd.creatBottomRowB = function () {
    let row = document.createElement ('div');
    row.classList.add ('bk-row');
    row.appendChild (bd.creatSmallSq ());
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'h'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'g'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'f'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'e'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'd'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'c'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'b'));
    row.appendChild (bd.creatRowFildSq ('bottom-bar', 'a'));
    row.appendChild (bd.creatSmallSq ());
    bd.board.appendChild (row);
  };
  bd.creatBoardW = function () {
    bd.creatTopRow ();
    bd.creatRowW (8);
    bd.creatRowW (7);
    bd.creatRowW (6);
    bd.creatRowW (5);
    bd.creatRowW (4);
    bd.creatRowW (3);
    bd.creatRowW (2);
    bd.creatRowW (1);
    bd.creatBottomRowW ();
  };
  bd.creatBoardB = function () {
    bd.creatTopRow ();
    bd.creatRowB (1);
    bd.creatRowB (2);
    bd.creatRowB (3);
    bd.creatRowB (4);
    bd.creatRowB (5);
    bd.creatRowB (6);
    bd.creatRowB (7);
    bd.creatRowB (8);
    bd.creatBottomRowB ();
  };
}
