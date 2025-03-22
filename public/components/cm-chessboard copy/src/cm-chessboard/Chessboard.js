/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

//move input
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

const STATE = {
  waitForInputStart: 0,
  pieceClickedThreshold: 1,
  clickTo: 2,
  secondClickThreshold: 3,
  dragTo: 4,
  clickDragTo: 5,
  moveDone: 6,
  reset: 7,
};

const MOVE_CANCELED_REASON = {
  secondClick: 'secondClick',
  movedOutOfBoard: 'movedOutOfBoard',
};

const DRAG_THRESHOLD = 2;

class ChessboardMoveInput {
  constructor (
    view,
    state,
    props,
    moveStartCallback,
    moveDoneCallback,
    moveCanceledCallback
  ) {
    this.view = view;
    this.state = state;
    this.props = props;
    this.moveStartCallback = moveStartCallback;
    this.moveDoneCallback = moveDoneCallback;
    this.moveCanceledCallback = moveCanceledCallback;
    this.setMoveInputState (STATE.waitForInputStart);
  }

  setMoveInputState (newState, params = null) {
    // console.log("setMoveInputState", Object.keys(STATE)[this.moveInputState], "=>", Object.keys(STATE)[newState]);

    const prevState = this.moveInputState;
    this.moveInputState = newState;

    switch (newState) {
      case STATE.waitForInputStart:
        break;

      case STATE.pieceClickedThreshold:
        if (STATE.waitForInputStart !== prevState) {
          throw new Error ('moveInputState');
        }
        this.startIndex = params.index;
        this.endIndex = null;
        this.movedPiece = params.piece;
        this.updateStartEndMarkers ();
        this.startPoint = params.point;
        if (!this.pointerMoveListener && !this.pointerUpListener) {
          if (params.type === 'mousedown') {
            this.pointerMoveListener = this.onPointerMove.bind (this);
            this.pointerMoveListener.type = 'mousemove';
            window.addEventListener ('mousemove', this.pointerMoveListener);

            this.pointerUpListener = this.onPointerUp.bind (this);
            this.pointerUpListener.type = 'mouseup';
            window.addEventListener ('mouseup', this.pointerUpListener);
          } else if (params.type === 'touchstart') {
            this.pointerMoveListener = this.onPointerMove.bind (this);
            this.pointerMoveListener.type = 'touchmove';
            window.addEventListener ('touchmove', this.pointerMoveListener);

            this.pointerUpListener = this.onPointerUp.bind (this);
            this.pointerUpListener.type = 'touchend';
            window.addEventListener ('touchend', this.pointerUpListener);
          } else {
            throw Error ('event type');
          }
        } else {
          throw Error ('_pointerMoveListener or _pointerUpListener');
        }
        break;

      case STATE.clickTo:
        if (this.draggablePiece) {
          Svg.removeElement (this.draggablePiece);
          this.draggablePiece = null;
        }
        if (prevState === STATE.dragTo) {
          this.view.setPieceVisibility (params.index);
        }
        break;

      case STATE.secondClickThreshold:
        if (STATE.clickTo !== prevState) {
          throw new Error ('moveInputState');
        }
        this.startPoint = params.point;
        break;

      case STATE.dragTo:
        if (STATE.pieceClickedThreshold !== prevState) {
          throw new Error ('moveInputState');
        }
        if (this.props.moveInputMode === MOVE_INPUT_MODE.dragPiece) {
          this.view.setPieceVisibility (params.index, false);
          this.createDraggablePiece (params.piece);
        }
        break;

      case STATE.clickDragTo:
        if (STATE.secondClickThreshold !== prevState) {
          throw new Error ('moveInputState');
        }
        if (this.props.moveInputMode === MOVE_INPUT_MODE.dragPiece) {
          this.view.setPieceVisibility (params.index, false);
          this.createDraggablePiece (params.piece);
        }
        break;

      case STATE.moveDone:
        if (
          [STATE.dragTo, STATE.clickTo, STATE.clickDragTo].indexOf (
            prevState
          ) === -1
        ) {
          throw new Error ('moveInputState');
        }
        this.endIndex = params.index;
        if (
          this.endIndex &&
          this.moveDoneCallback (this.startIndex, this.endIndex)
        ) {
          const prevSquares = this.state.squares.slice (0);
          this.state.setPiece (this.startIndex, null);
          this.state.setPiece (this.endIndex, this.movedPiece);
          if (prevState === STATE.clickTo) {
            this.view.animatePieces (
              prevSquares,
              this.state.squares.slice (0),
              () => {
                this.setMoveInputState (STATE.reset);
              }
            );
          } else {
            this.view.drawPieces (this.state.squares);
            this.setMoveInputState (STATE.reset);
          }
        } else {
          this.view.drawPiecesDebounced ();
          this.setMoveInputState (STATE.reset);
        }
        break;

      case STATE.reset:
        if (this.startIndex && !this.endIndex && this.movedPiece) {
          this.state.setPiece (this.startIndex, this.movedPiece);
        }
        this.startIndex = null;
        this.endIndex = null;
        this.movedPiece = null;
        this.updateStartEndMarkers ();
        if (this.draggablePiece) {
          Svg.removeElement (this.draggablePiece);
          this.draggablePiece = null;
        }
        if (this.pointerMoveListener) {
          window.removeEventListener (
            this.pointerMoveListener.type,
            this.pointerMoveListener
          );
          this.pointerMoveListener = null;
        }
        if (this.pointerUpListener) {
          window.removeEventListener (
            this.pointerUpListener.type,
            this.pointerUpListener
          );
          this.pointerUpListener = null;
        }
        this.setMoveInputState (STATE.waitForInputStart);
        break;

      default:
        throw Error (`moveInputState ${newState}`);
    }
  }

  createDraggablePiece (pieceName) {
    if (this.draggablePiece) {
      throw Error ('draggablePiece exists');
    }
    this.draggablePiece = Svg.createSvg (document.body);
    this.draggablePiece.classList.add ('cm-chessboard-draggable-piece');
    this.draggablePiece.setAttribute ('width', this.view.squareWidth);
    this.draggablePiece.setAttribute ('height', this.view.squareHeight);
    this.draggablePiece.setAttribute ('style', 'pointer-events: none');
    this.draggablePiece.name = pieceName;
    const piece = Svg.addElement (this.draggablePiece, 'use', {
      href: `${this.props.sprite.url}#${pieceName}`,
    });
    const scaling = this.view.squareHeight / this.props.sprite.grid;
    const transformScale = this.draggablePiece.createSVGTransform ();
    transformScale.setScale (scaling, scaling);
    piece.transform.baseVal.appendItem (transformScale);
  }

  moveDraggablePiece (x, y) {
    this.draggablePiece.setAttribute (
      'style',
      `pointer-events: none; position: absolute; left: ${x - this.view.squareHeight / 2}px; top: ${y - this.view.squareHeight / 2}px`
    );
  }

  onPointerDown (e) {
    if ((e.type === 'mousedown' && e.button === 0) || e.type === 'touchstart') {
      const index = e.target.getAttribute ('data-index');
      const pieceElement = this.view.getPiece (index);
      let pieceName, color;
      if (pieceElement) {
        pieceName = pieceElement.getAttribute ('data-piece');
        color = pieceName ? pieceName.substr (0, 1) : null;
        // allow scrolling, if not pointed on draggable piece
        if (
          (color === 'w' && this.state.inputWhiteEnabled) ||
          (color === 'b' && this.state.inputBlackEnabled)
        ) {
          e.preventDefault ();
        }
      }
      if (index !== undefined) {
        if (
          this.moveInputState !== STATE.waitForInputStart ||
          (this.state.inputWhiteEnabled && color === 'w') ||
          (this.state.inputBlackEnabled && color === 'b')
        ) {
          let point;
          if (e.type === 'mousedown') {
            point = {x: e.clientX, y: e.clientY};
          } else if (e.type === 'touchstart') {
            point = {x: e.touches[0].clientX, y: e.touches[0].clientY};
          }
          if (
            this.moveInputState === STATE.waitForInputStart &&
            pieceName &&
            this.moveStartCallback (index)
          ) {
            this.setMoveInputState (STATE.pieceClickedThreshold, {
              index: index,
              piece: pieceName,
              point: point,
              type: e.type,
            });
          } else if (this.moveInputState === STATE.clickTo) {
            if (index === this.startIndex) {
              this.setMoveInputState (STATE.secondClickThreshold, {
                index: index,
                piece: pieceName,
                point: point,
                type: e.type,
              });
            } else {
              this.setMoveInputState (STATE.moveDone, {index: index});
            }
          }
        }
      }
    }
  }

  onPointerMove (e) {
    let x, y, target;
    if (e.type === 'mousemove') {
      x = e.pageX;
      y = e.pageY;
      target = e.target;
    } else if (e.type === 'touchmove') {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
      target = document.elementFromPoint (
        e.touches[0].clientX,
        e.touches[0].clientY
      );
    }
    if (
      this.moveInputState === STATE.pieceClickedThreshold ||
      this.moveInputState === STATE.secondClickThreshold
    ) {
      if (
        Math.abs (this.startPoint.x - x) > DRAG_THRESHOLD ||
        Math.abs (this.startPoint.y - y) > DRAG_THRESHOLD
      ) {
        if (this.moveInputState === STATE.secondClickThreshold) {
          this.setMoveInputState (STATE.clickDragTo, {
            index: this.startIndex,
            piece: this.movedPiece,
          });
        } else {
          this.setMoveInputState (STATE.dragTo, {
            index: this.startIndex,
            piece: this.movedPiece,
          });
        }
        if (this.props.moveInputMode === MOVE_INPUT_MODE.dragPiece) {
          this.moveDraggablePiece (x, y);
        }
      }
    } else if (
      this.moveInputState === STATE.dragTo ||
      this.moveInputState === STATE.clickDragTo ||
      this.moveInputState === STATE.clickTo
    ) {
      if (
        target &&
        target.getAttribute &&
        target.parentElement === this.view.boardGroup
      ) {
        const index = target.getAttribute ('data-index');
        if (index !== this.startIndex && index !== this.endIndex) {
          this.endIndex = index;
          this.updateStartEndMarkers ();
        } else if (index === this.startIndex && this.endIndex !== null) {
          this.endIndex = null;
          this.updateStartEndMarkers ();
        }
      } else {
        this.endIndex = null;
        this.updateStartEndMarkers ();
      }
      if (
        this.props.moveInputMode === MOVE_INPUT_MODE.dragPiece &&
        (this.moveInputState === STATE.dragTo ||
          this.moveInputState === STATE.clickDragTo)
      ) {
        this.moveDraggablePiece (x, y);
      }
    }
  }

  onPointerUp (e) {
    let x, y, target;
    if (e.type === 'mouseup') {
      target = e.target;
    } else if (e.type === 'touchend') {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
      target = document.elementFromPoint (x, y);
    }
    if (target && target.getAttribute) {
      const index = target.getAttribute ('data-index');

      if (index) {
        if (
          this.moveInputState === STATE.dragTo ||
          this.moveInputState === STATE.clickDragTo
        ) {
          if (this.startIndex === index) {
            if (this.moveInputState === STATE.clickDragTo) {
              this.state.setPiece (this.startIndex, this.movedPiece);
              this.view.setPieceVisibility (this.startIndex);
              this.setMoveInputState (STATE.reset);
            } else {
              this.setMoveInputState (STATE.clickTo, {index: index});
            }
          } else {
            this.setMoveInputState (STATE.moveDone, {index: index});
          }
        } else if (this.moveInputState === STATE.pieceClickedThreshold) {
          this.setMoveInputState (STATE.clickTo, {index: index});
        } else if (this.moveInputState === STATE.secondClickThreshold) {
          this.setMoveInputState (STATE.reset);
          this.moveCanceledCallback (MOVE_CANCELED_REASON.secondClick, index);
        }
      } else {
        this.view.drawPiecesDebounced ();
        this.setMoveInputState (STATE.reset);
        this.moveCanceledCallback (
          MOVE_CANCELED_REASON.movedOutOfBoard,
          undefined
        );
      }
    } else {
      this.view.drawPiecesDebounced ();
      this.setMoveInputState (STATE.reset);
    }
  }

  updateStartEndMarkers () {
    this.state.removeMarkers (null, MARKER_TYPE.move);
    if (this.startIndex) {
      this.state.addMarker (this.startIndex, MARKER_TYPE.move);
    }
    if (this.endIndex) {
      this.state.addMarker (this.endIndex, MARKER_TYPE.move);
    }
    this.view.drawMarkersDebounced ();
  }

  reset () {
    this.setMoveInputState (STATE.reset);
  }

  destroy () {
    this.reset ();
  }
}

//move input
//Animation
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

const CHANGE_TYPE = {
  move: 0,
  appear: 1,
  disappear: 2,
};

function AnimationRunningException () {}

class ChessboardPiecesAnimation {
  constructor (view, fromSquares, toSquares, duration, callback) {
    this.view = view;
    if (this.view.animationRunning) {
      throw new AnimationRunningException ();
    }
    if (fromSquares && toSquares) {
      this.animatedElements = this.createAnimation (fromSquares, toSquares);
      this.duration = duration;
      this.callback = callback;
      this.view.animationRunning = true;
      this.frameHandle = requestAnimationFrame (this.animationStep.bind (this));
    }
  }

  seekChanges (fromSquares, toSquares) {
    const appearedList = [], disappearedList = [], changes = [];
    for (let i = 0; i < 64; i++) {
      const previousSquare = fromSquares[i];
      const newSquare = toSquares[i];
      if (newSquare !== previousSquare) {
        if (newSquare) {
          appearedList.push ({piece: newSquare, index: i});
        }
        if (previousSquare) {
          disappearedList.push ({piece: previousSquare, index: i});
        }
      }
    }
    appearedList.forEach (appeared => {
      let shortestDistance = 8;
      let foundMoved = null;
      disappearedList.forEach (disappeared => {
        if (appeared.piece === disappeared.piece) {
          const moveDistance = this.squareDistance (
            appeared.index,
            disappeared.index
          );
          if (moveDistance < shortestDistance) {
            foundMoved = disappeared;
            shortestDistance = moveDistance;
          }
        }
      });
      if (foundMoved) {
        disappearedList.splice (disappearedList.indexOf (foundMoved), 1); // remove from disappearedList, because it is moved now
        changes.push ({
          type: CHANGE_TYPE.move,
          piece: appeared.piece,
          atIndex: foundMoved.index,
          toIndex: appeared.index,
        });
      } else {
        changes.push ({
          type: CHANGE_TYPE.appear,
          piece: appeared.piece,
          atIndex: appeared.index,
        });
      }
    });
    disappearedList.forEach (disappeared => {
      changes.push ({
        type: CHANGE_TYPE.disappear,
        piece: disappeared.piece,
        atIndex: disappeared.index,
      });
    });
    return changes;
  }

  createAnimation (fromSquares, toSquares) {
    const changes = this.seekChanges (fromSquares, toSquares);
    const animatedElements = [];
    changes.forEach (change => {
      const animatedItem = {
        type: change.type,
      };
      switch (change.type) {
        case CHANGE_TYPE.move:
          animatedItem.element = this.view.getPiece (change.atIndex);
          animatedItem.atPoint = this.view.squareIndexToPoint (change.atIndex);
          animatedItem.toPoint = this.view.squareIndexToPoint (change.toIndex);
          break;
        case CHANGE_TYPE.appear:
          animatedItem.element = this.view.drawPiece (
            change.atIndex,
            change.piece
          );
          animatedItem.element.style.opacity = 0;
          break;
        case CHANGE_TYPE.disappear:
          animatedItem.element = this.view.getPiece (change.atIndex);
          break;
      }
      animatedElements.push (animatedItem);
    });
    return animatedElements;
  }

  animationStep (time) {
    if (!this.startTime) {
      this.startTime = time;
    }
    const timeDiff = time - this.startTime;
    if (timeDiff <= this.duration) {
      this.frameHandle = requestAnimationFrame (this.animationStep.bind (this));
    } else {
      cancelAnimationFrame (this.frameHandle);
      this.view.animationRunning = false;
      this.callback ();
    }
    const t = Math.min (1, timeDiff / this.duration);
    const progress = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
    this.animatedElements.forEach (animatedItem => {
      if (animatedItem.element) {
        switch (animatedItem.type) {
          case CHANGE_TYPE.move:
            animatedItem.element.transform.baseVal.removeItem (0);
            const transform = this.view.svg.createSVGTransform ();
            transform.setTranslate (
              animatedItem.atPoint.x +
                (animatedItem.toPoint.x - animatedItem.atPoint.x) * progress,
              animatedItem.atPoint.y +
                (animatedItem.toPoint.y - animatedItem.atPoint.y) * progress
            );
            animatedItem.element.transform.baseVal.appendItem (transform);
            break;
          case CHANGE_TYPE.appear:
            animatedItem.element.style.opacity = progress;
            break;
          case CHANGE_TYPE.disappear:
            animatedItem.element.style.opacity = 1 - progress;
            break;
        }
      } else {
        console.warn ('animatedItem has no element', animatedItem);
      }
    });
  }

  squareDistance (index1, index2) {
    const file1 = index1 % 8;
    const rank1 = Math.floor (index1 / 8);
    const file2 = index2 % 8;
    const rank2 = Math.floor (index2 / 8);
    return Math.max (Math.abs (rank2 - rank1), Math.abs (file2 - file1));
  }
}
//Animation
//State
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

const SQUARE_COORDINATES = [
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
];

class ChessboardState {
  constructor () {
    this.squares = new Array (64).fill (null);
    this.orientation = null;
    this.markers = [];
  }

  setPiece (index, piece) {
    this.squares[index] = piece;
  }

  addMarker (index, type) {
    this.markers.push ({index: index, type: type});
  }

  removeMarkers (index = null, type = null) {
    if (index === null && type === null) {
      this.markers = [];
    } else {
      this.markers = this.markers.filter (marker => {
        if (marker.type === null) {
          if (index === marker.index) {
            return false;
          }
        } else if (index === null) {
          if (marker.type === type) {
            return false;
          }
        } else if (marker.type === type && index === marker.index) {
          return false;
        }
        return true;
      });
    }
  }

  setPosition (fen) {
    if (fen) {
      const parts = fen
        .replace (/^\s*/, '')
        .replace (/\s*$/, '')
        .split (/\/|\s/);
      for (let part = 0; part < 8; part++) {
        const row = parts[7 - part].replace (/\d/g, str => {
          const numSpaces = parseInt (str);
          let ret = '';
          for (let i = 0; i < numSpaces; i++) {
            ret += '-';
          }
          return ret;
        });
        for (let c = 0; c < 8; c++) {
          const char = row.substr (c, 1);
          let piece = null;
          if (char !== '-') {
            if (char.toUpperCase () === char) {
              piece = `w${char.toLowerCase ()}`;
            } else {
              piece = `b${char}`;
            }
          }
          this.squares[part * 8 + c] = piece;
        }
      }
    }
  }

  getPosition () {
    let parts = new Array (8).fill ('');
    for (let part = 0; part < 8; part++) {
      let spaceCounter = 0;
      for (let i = 0; i < 8; i++) {
        const piece = this.squares[part * 8 + i];
        if (piece === null) {
          spaceCounter++;
        } else {
          if (spaceCounter > 0) {
            parts[7 - part] += spaceCounter;
            spaceCounter = 0;
          }
          const color = piece.substr (0, 1);
          const name = piece.substr (1, 1);
          if (color === 'w') {
            parts[7 - part] += name.toUpperCase ();
          } else {
            parts[7 - part] += name;
          }
        }
      }
      if (spaceCounter > 0) {
        parts[7 - part] += spaceCounter;
        spaceCounter = 0;
      }
    }
    return parts.join ('/');
  }

  squareToIndex (square) {
    const file = square.substr (0, 1).charCodeAt (0) - 97;
    const rank = square.substr (1, 1) - 1;
    return 8 * rank + file;
  }
}

//state
const COLOR = {
  white: 'w',
  black: 'b',
};
const MOVE_INPUT_MODE = {
  viewOnly: 0,
  dragPiece: 1,
  dragMarker: 2,
};
const INPUT_EVENT_TYPE = {
  moveStart: 'moveStart',
  moveDone: 'moveDone',
  moveCanceled: 'moveCanceled',
  context: 'context',
  click: 'click',
};
const MARKER_TYPE = {
  move: {class: 'move', slice: 'marker1'},
  emphasize: {class: 'emphasize', slice: 'marker2'},
};
const PIECE = {
  wp: 'wp',
  wb: 'wb',
  wn: 'wn',
  wr: 'wr',
  wq: 'wq',
  wk: 'wk',
  bp: 'bp',
  bb: 'bb',
  bn: 'bn',
  br: 'br',
  bq: 'bq',
  bk: 'bk',
};
const FEN_START_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_EMPTY_POSITION = '8/8/8/8/8/8/8/8';

const DEFAULT_SPRITE_GRID = 40;

class Chessboard {
  constructor (element, props = {}) {
    if (!element) {
      throw new Error ('container element is ' + element);
    }
    this.element = element;
    let defaultProps = {
      position: 'empty', // set as fen, "start" or "empty"
      orientation: COLOR.white, // white on bottom
      style: {
        cssClass: 'default',
        showCoordinates: true, // show ranks and files
        showBorder: false, // display a border around the board
        aspectRatio: 1, // height/width. Set to null, if you want to define it only in the css.
      },
      responsive: false, // resizes the board on window resize, if true
      animationDuration: 300, // pieces animation duration in milliseconds
      moveInputMode: MOVE_INPUT_MODE.viewOnly, // set to MOVE_INPUT_MODE.dragPiece or MOVE_INPUT_MODE.dragMarker for interactive movement
      sprite: {
        url: './assets/images/chessboard-sprite.svg', // pieces and markers are stored es svg in the sprite
        grid: DEFAULT_SPRITE_GRID, // the sprite is tiled with one piece every 40px
      },
    };
    this.props = {};
    Object.assign (this.props, defaultProps);
    Object.assign (this.props, props);
    this.props.sprite = defaultProps.sprite;
    this.props.style = defaultProps.style;
    if (props.sprite) {
      Object.assign (this.props.sprite, props.sprite);
    }
    if (props.style) {
      Object.assign (this.props.style, props.style);
    }
    if (this.props.style.aspectRatio) {
      this.element.style.height =
        this.element.offsetWidth * this.props.style.aspectRatio + 'px';
    }
    this.state = new ChessboardState ();
    this.state.orientation = this.props.orientation;
    this.initialization = new Promise (resolve => {
      this.view = new ChessboardView (this, () => {
        if (this.props.position === 'start') {
          this.state.setPosition (FEN_START_POSITION);
        } else if (
          this.props.position === 'empty' ||
          this.props.position === null
        ) {
          this.state.setPosition (FEN_EMPTY_POSITION);
        } else {
          this.state.setPosition (this.props.position);
        }
        setTimeout (() => {
          this.view.redraw ().then (() => {
            resolve ();
          });
        });
      });
    });
  }

  // API //

  setPiece (square, piece) {
    return new Promise (resolve => {
      this.initialization.then (() => {
        this.state.setPiece (this.state.squareToIndex (square), piece);
        this.view.drawPiecesDebounced (this.state.squares, () => {
          resolve ();
        });
      });
    });
  }

  getPiece (square) {
    return this.state.squares[this.state.squareToIndex (square)];
  }

  setPosition (fen, animated = true) {
    return new Promise (resolve => {
      this.initialization.then (() => {
        const currentFen = this.state.getPosition ();
        const fenParts = fen.split (' ');
        const fenNormalized = fenParts[0];
        if (fenNormalized !== currentFen) {
          const prevSquares = this.state.squares.slice (0); // clone
          if (fen === 'start') {
            this.state.setPosition (FEN_START_POSITION);
          } else if (fen === 'empty' || fen === null) {
            this.state.setPosition (FEN_EMPTY_POSITION);
          } else {
            this.state.setPosition (fen);
          }
          if (animated) {
            this.view.animatePieces (
              prevSquares,
              this.state.squares.slice (0),
              () => {
                resolve ();
              }
            );
          } else {
            this.view.drawPiecesDebounced ();
            resolve ();
          }
        } else {
          resolve ();
        }
      });
    });
  }

  getPosition () {
    return this.state.getPosition ();
  }

  addMarker (square, type = MARKER_TYPE.emphasize) {
    this.state.addMarker (this.state.squareToIndex (square), type);
    this.view.drawMarkersDebounced ();
  }

  getMarkers (square = null, type = null) {
    const markersFound = [];
    this.state.markers.forEach (marker => {
      const markerSquare = SQUARE_COORDINATES[marker.index];
      if (
        (square === null && (type === null || type === marker.type)) ||
        (type === null && square === markerSquare) ||
        (type === marker.type && square === markerSquare)
      ) {
        markersFound.push ({
          square: SQUARE_COORDINATES[marker.index],
          type: marker.type,
        });
      }
    });
    return markersFound;
  }

  removeMarkers (square = null, type = null) {
    const index = square !== null ? this.state.squareToIndex (square) : null;
    this.state.removeMarkers (index, type);
    this.view.drawMarkersDebounced ();
  }

  setOrientation (color) {
    this.state.orientation = color;
    this.view.redraw ();
  }

  getOrientation () {
    return this.state.orientation;
  }

  destroy () {
    return new Promise (resolve => {
      this.initialization.then (() => {
        this.view.destroy ();
        this.view = null;
        this.state = null;
        this.element.removeEventListener (
          'contextmenu',
          this.contextMenuListener
        );
        resolve ();
      });
    });
  }

  enableMoveInput (eventHandler, color = null) {
    if (this.props.moveInputMode === MOVE_INPUT_MODE.viewOnly) {
      throw Error ('props.moveInputMode is MOVE_INPUT_MODE.viewOnly');
    }
    if (color === COLOR.white) {
      this.state.inputWhiteEnabled = true;
    } else if (color === COLOR.black) {
      this.state.inputBlackEnabled = true;
    } else {
      this.state.inputWhiteEnabled = true;
      this.state.inputBlackEnabled = true;
    }
    this.moveInputCallback = eventHandler;
    this.view.setCursor ();
  }

  disableMoveInput () {
    this.state.inputWhiteEnabled = false;
    this.state.inputBlackEnabled = false;
    this.moveInputCallback = null;
    this.view.setCursor ();
  }

  enableContextInput (eventHandler) {
    if (this.contextMenuListener) {
      console.warn ('contextMenuListener already existing');
      return;
    }
    this.contextMenuListener = function (e) {
      e.preventDefault ();
      const index = e.target.getAttribute ('data-index');
      eventHandler ({
        chessboard: this,
        type: INPUT_EVENT_TYPE.context,
        square: SQUARE_COORDINATES[index],
      });
    };
    this.element.addEventListener ('contextmenu', this.contextMenuListener);
  }

  disableContextInput () {
    this.element.removeEventListener ('contextmenu', this.contextMenuListener);
    this.contextMenuListener = null;
  }

  enableBoardClick (eventHandler) {
    if (this.boardClickListener) {
      console.warn ('boardClickListener already existing');
      return;
    }
    this.boardClickListener = function (e) {
      const index = e.target.getAttribute ('data-index');
      eventHandler ({
        chessboard: this,
        type: INPUT_EVENT_TYPE.click,
        square: SQUARE_COORDINATES[index],
      });
    };
    this.element.addEventListener ('click', this.boardClickListener);
  }

  disableBoardClick () {
    this.element.removeEventListener ('click', this.boardClickListener);
    this.boardClickListener = null;
  }
}
//View
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

class ChessboardView {
  constructor (chessboard, callbackAfterCreation) {
    this.animationRunning = false;
    this.currentAnimation = null;
    this.chessboard = chessboard;
    this.moveInput = new ChessboardMoveInput (
      this,
      chessboard.state,
      chessboard.props,
      this.moveStartCallback.bind (this),
      this.moveDoneCallback.bind (this),
      this.moveCanceledCallback.bind (this)
    );
    this.animationQueue = [];
    if (chessboard.props.responsive) {
      this.resizeListener = this.handleResize.bind (this);
      window.addEventListener ('resize', this.resizeListener);
    }
    if (chessboard.props.moveInputMode !== MOVE_INPUT_MODE.viewOnly) {
      this.pointerDownListener = this.pointerDownHandler.bind (this);
      this.chessboard.element.addEventListener (
        'mousedown',
        this.pointerDownListener
      );
      this.chessboard.element.addEventListener (
        'touchstart',
        this.pointerDownListener
      );
    }
    this.createSvgAndGroups ();
    this.updateMetrics ();
    callbackAfterCreation ();
    if (chessboard.props.responsive) {
      setTimeout (() => {
        this.handleResize ();
      });
    }
  }

  pointerDownHandler (e) {
    this.moveInput.onPointerDown (e);
  }

  destroy () {
    this.moveInput.destroy ();
    window.removeEventListener ('resize', this.resizeListener);
    this.chessboard.element.removeEventListener (
      'mousedown',
      this.pointerDownListener
    );
    this.chessboard.element.removeEventListener (
      'touchstart',
      this.pointerDownListener
    );
    window.clearTimeout (this.resizeDebounce);
    window.clearTimeout (this.redrawDebounce);
    window.clearTimeout (this.drawPiecesDebounce);
    window.clearTimeout (this.drawMarkersDebounce);
    Svg.removeElement (this.svg);
    this.animationQueue = [];
    if (this.currentAnimation) {
      cancelAnimationFrame (this.currentAnimation.frameHandle);
    }
  }

  // Sprite //

  createSvgAndGroups () {
    if (this.svg) {
      Svg.removeElement (this.svg);
    }
    this.svg = Svg.createSvg (this.chessboard.element);
    let cssClass = this.chessboard.props.style.cssClass
      ? this.chessboard.props.style.cssClass
      : 'default';
    if (this.chessboard.props.style.showBorder) {
      this.svg.setAttribute ('class', 'cm-chessboard has-border ' + cssClass);
    } else {
      this.svg.setAttribute ('class', 'cm-chessboard ' + cssClass);
    }
    this.updateMetrics ();
    this.boardGroup = Svg.addElement (this.svg, 'g', {class: 'board'});
    this.coordinatesGroup = Svg.addElement (this.svg, 'g', {
      class: 'coordinates',
    });
    this.markersGroup = Svg.addElement (this.svg, 'g', {class: 'markers'});
    this.piecesGroup = Svg.addElement (this.svg, 'g', {class: 'pieces'});
  }

  updateMetrics () {
    this.width = this.chessboard.element.offsetWidth;
    this.height = this.chessboard.element.offsetHeight;
    if (this.chessboard.props.style.showBorder) {
      this.borderSize = this.width / 32;
    } else {
      this.borderSize = this.width / 320;
    }
    this.innerWidth = this.width - 2 * this.borderSize;
    this.innerHeight = this.height - 2 * this.borderSize;
    this.squareWidth = this.innerWidth / 8;
    this.squareHeight = this.innerHeight / 8;
    this.scalingX = this.squareWidth / this.chessboard.props.sprite.grid;
    this.scalingY = this.squareHeight / this.chessboard.props.sprite.grid;
    this.pieceXTranslate =
      this.squareWidth / 2 -
      this.chessboard.props.sprite.grid * this.scalingY / 2;
  }

  handleResize () {
    window.clearTimeout (this.resizeDebounce);
    this.resizeDebounce = setTimeout (() => {
      if (this.chessboard.props.style.aspectRatio) {
        this.chessboard.element.style.height =
          this.chessboard.element.offsetWidth *
            this.chessboard.props.style.aspectRatio +
          'px';
      }
      if (
        this.chessboard.element.offsetWidth !== this.width ||
        this.chessboard.element.offsetHeight !== this.height
      ) {
        this.updateMetrics ();
        this.redraw ();
      }
      this.svg.setAttribute ('width', '100%'); // safari bugfix
      this.svg.setAttribute ('height', '100%');
    });
  }

  redraw () {
    return new Promise (resolve => {
      window.clearTimeout (this.redrawDebounce);
      this.redrawDebounce = setTimeout (() => {
        this.drawBoard ();
        this.drawCoordinates ();
        this.drawMarkers ();
        this.setCursor ();
      });
      this.drawPiecesDebounced (this.chessboard.state.squares, () => {
        resolve ();
      });
    });
  }

  // Board //

  drawBoard () {
    while (this.boardGroup.firstChild) {
      this.boardGroup.removeChild (this.boardGroup.lastChild);
    }
    let boardBorder = Svg.addElement (this.boardGroup, 'rect', {
      width: this.width,
      height: this.height,
    });
    boardBorder.setAttribute ('class', 'border');
    if (this.chessboard.props.style.showBorder) {
      const innerPos = this.borderSize - this.borderSize / 9;
      let borderInner = Svg.addElement (this.boardGroup, 'rect', {
        x: innerPos,
        y: innerPos,
        width: this.width - innerPos * 2,
        height: this.height - innerPos * 2,
      });
      borderInner.setAttribute ('class', 'border-inner');
    }
    for (let i = 0; i < 64; i++) {
      const index = this.chessboard.state.orientation === COLOR.white
        ? i
        : 63 - i;
      const squareColor = ((9 * index) & 8) === 0 ? 'black' : 'white';
      const fieldClass = `square ${squareColor}`;
      const point = this.squareIndexToPoint (index);
      const squareRect = Svg.addElement (this.boardGroup, 'rect', {
        x: point.x,
        y: point.y,
        width: this.squareWidth,
        height: this.squareHeight,
      });
      squareRect.setAttribute ('class', fieldClass);
      squareRect.setAttribute ('data-index', '' + index);
    }
  }

  drawCoordinates () {
    if (!this.chessboard.props.style.showCoordinates) {
      return;
    }
    while (this.coordinatesGroup.firstChild) {
      this.coordinatesGroup.removeChild (this.coordinatesGroup.lastChild);
    }
    const inline = !this.chessboard.props.style.showBorder;
    for (let file = 0; file < 8; file++) {
      let x =
        this.borderSize +
        (18 + this.chessboard.props.sprite.grid * file) * this.scalingX;
      let y = this.height - this.scalingY * 2.6;
      let cssClass = 'coordinate file';
      if (inline) {
        x = x + this.scalingX * 15.5;
        if (this.chessboard.props.style.showBorder) {
          y = y - this.scalingY * 11;
        }
        cssClass += file % 2 ? ' dark' : ' light';
      }
      const textElement = Svg.addElement (this.coordinatesGroup, 'text', {
        class: cssClass,
        x: x,
        y: y,
        style: `font-size: ${this.scalingY * 8}px`,
      });
      if (this.chessboard.state.orientation === COLOR.white) {
        textElement.textContent = String.fromCharCode (97 + file);
      } else {
        textElement.textContent = String.fromCharCode (104 - file);
      }
    }
    for (let rank = 0; rank < 8; rank++) {
      let x = this.borderSize / 1.7;
      let y = this.borderSize + 24 * this.scalingY + rank * this.squareHeight;
      let cssClass = 'coordinate rank';
      if (inline) {
        cssClass += rank % 2 ? ' light' : ' dark';
        if (this.chessboard.props.style.showBorder) {
          x = x + this.scalingX * 10;
          y = y - this.scalingY * 15;
        } else {
          x = x + this.scalingX * 2;
          y = y - this.scalingY * 15;
        }
      }
      const textElement = Svg.addElement (this.coordinatesGroup, 'text', {
        class: cssClass,
        x: x,
        y: y,
        style: `font-size: ${this.scalingY * 8}px`,
      });
      if (this.chessboard.state.orientation === COLOR.white) {
        textElement.textContent = 8 - rank;
      } else {
        textElement.textContent = 1 + rank;
      }
    }
  }

  // Pieces //

  drawPiecesDebounced (
    squares = this.chessboard.state.squares,
    callback = null
  ) {
    window.clearTimeout (this.drawPiecesDebounce);
    this.drawPiecesDebounce = setTimeout (() => {
      this.drawPieces (squares);
      if (callback) {
        callback ();
      }
    });
  }

  drawPieces (squares = this.chessboard.state.squares) {
    while (this.piecesGroup.firstChild) {
      this.piecesGroup.removeChild (this.piecesGroup.lastChild);
    }
    for (let i = 0; i < 64; i++) {
      const pieceName = squares[i];
      if (pieceName) {
        this.drawPiece (i, pieceName);
      }
    }
  }

  drawPiece (index, pieceName) {
    // console.log(index, pieceName)
    const pieceGroup = Svg.addElement (this.piecesGroup, 'g');
    pieceGroup.setAttribute ('data-piece', pieceName);
    pieceGroup.setAttribute ('data-index', index);
    const point = this.squareIndexToPoint (index);
    const transform = this.svg.createSVGTransform ();
    transform.setTranslate (point.x, point.y);
    pieceGroup.transform.baseVal.appendItem (transform);
    const pieceUse = Svg.addElement (pieceGroup, 'use', {
      href: `${this.chessboard.props.sprite.url}#${pieceName}`,
      class: 'piece',
    });
    // center on square
    const transformTranslate = this.svg.createSVGTransform ();
    transformTranslate.setTranslate (this.pieceXTranslate, 0);
    pieceUse.transform.baseVal.appendItem (transformTranslate);
    // scale
    const transformScale = this.svg.createSVGTransform ();
    transformScale.setScale (this.scalingY, this.scalingY);
    pieceUse.transform.baseVal.appendItem (transformScale);
    return pieceGroup;
  }

  setPieceVisibility (index, visible = true) {
    const piece = this.getPiece (index);
    if (visible) {
      piece.setAttribute ('visibility', 'visible');
    } else {
      piece.setAttribute ('visibility', 'hidden');
    }
  }

  getPiece (index) {
    return this.piecesGroup.querySelector (`g[data-index='${index}']`);
  }

  // Markers //

  drawMarkersDebounced () {
    window.clearTimeout (this.drawMarkersDebounce);
    this.drawMarkersDebounce = setTimeout (() => {
      this.drawMarkers ();
    }, 10);
  }

  drawMarkers () {
    while (this.markersGroup.firstChild) {
      this.markersGroup.removeChild (this.markersGroup.firstChild);
    }
    this.chessboard.state.markers.forEach (marker => {
      this.drawMarker (marker);
    });
  }

  drawMarker (marker) {
    const markerGroup = Svg.addElement (this.markersGroup, 'g');
    markerGroup.setAttribute ('data-index', marker.index);
    const point = this.squareIndexToPoint (marker.index);
    const transform = this.svg.createSVGTransform ();
    transform.setTranslate (point.x, point.y);
    markerGroup.transform.baseVal.appendItem (transform);
    const markerUse = Svg.addElement (markerGroup, 'use', {
      href: `${this.chessboard.props.sprite.url}#${marker.type.slice}`,
      class: 'marker ' + marker.type.class,
    });
    const transformScale = this.svg.createSVGTransform ();
    transformScale.setScale (this.scalingX, this.scalingY);
    markerUse.transform.baseVal.appendItem (transformScale);
    return markerGroup;
  }

  // animation queue //

  animatePieces (fromSquares, toSquares, callback) {
    this.animationQueue.push ({
      fromSquares: fromSquares,
      toSquares: toSquares,
      callback: callback,
    });
    if (!this.animationRunning) {
      this.nextPieceAnimationInQueue ();
    }
  }

  nextPieceAnimationInQueue () {
    const nextAnimation = this.animationQueue.shift ();
    if (nextAnimation !== undefined) {
      this.currentAnimation = new ChessboardPiecesAnimation (
        this,
        nextAnimation.fromSquares,
        nextAnimation.toSquares,
        this.chessboard.props.animationDuration /
          (this.animationQueue.length + 1),
        () => {
          if (!this.moveInput.draggablePiece) {
            this.drawPieces (nextAnimation.toSquares);
          }
          this.nextPieceAnimationInQueue ();
          if (nextAnimation.callback) {
            nextAnimation.callback ();
          }
        }
      );
    }
  }

  // Callbacks //

  moveStartCallback (index) {
    if (this.chessboard.moveInputCallback) {
      return this.chessboard.moveInputCallback ({
        chessboard: this.chessboard,
        type: INPUT_EVENT_TYPE.moveStart,
        square: SQUARE_COORDINATES[index],
      });
    } else {
      return true;
    }
  }

  moveDoneCallback (fromIndex, toIndex) {
    if (this.chessboard.moveInputCallback) {
      return this.chessboard.moveInputCallback ({
        chessboard: this.chessboard,
        type: INPUT_EVENT_TYPE.moveDone,
        squareFrom: SQUARE_COORDINATES[fromIndex],
        squareTo: SQUARE_COORDINATES[toIndex],
      });
    } else {
      return true;
    }
  }

  moveCanceledCallback (reason, index) {
    if (this.chessboard.moveInputCallback) {
      this.chessboard.moveInputCallback ({
        chessboard: this.chessboard,
        type: INPUT_EVENT_TYPE.moveCanceled,
        reason: reason,
        square: index ? SQUARE_COORDINATES[index] : undefined,
      });
    }
  }

  // Helpers //

  setCursor () {
    this.chessboard.initialization.then (() => {
      if (
        this.chessboard.state.inputWhiteEnabled ||
        this.chessboard.state.inputBlackEnabled ||
        this.chessboard.boardClickListener
      ) {
        this.boardGroup.setAttribute ('class', 'board input-enabled');
      } else {
        this.boardGroup.setAttribute ('class', 'board');
      }
    });
  }

  squareIndexToPoint (index) {
    let x, y;
    if (this.chessboard.state.orientation === COLOR.white) {
      x = this.borderSize + index % 8 * this.squareWidth;
      y = this.borderSize + (7 - Math.floor (index / 8)) * this.squareHeight;
    } else {
      x = this.borderSize + (7 - index % 8) * this.squareWidth;
      y = this.borderSize + Math.floor (index / 8) * this.squareHeight;
    }
    return {x: x, y: y};
  }
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
class Svg {
  /**
       * create the Svg in the HTML DOM
       * @param containerElement
       * @returns {Element}
       */
  static createSvg (containerElement = null) {
    let svg = document.createElementNS (SVG_NAMESPACE, 'svg');
    if (containerElement) {
      svg.setAttribute ('width', '100%');
      svg.setAttribute ('height', '100%');
      containerElement.appendChild (svg);
    }
    return svg;
  }

  /**
       * Add an Element to a SVG DOM
       * @param parent
       * @param name
       * @param attributes
       * @returns {Element}
       */
  static addElement (parent, name, attributes) {
    let element = document.createElementNS (SVG_NAMESPACE, name);
    if (name === 'use') {
      attributes['xlink:href'] = attributes['href']; // fix for safari
    }
    for (let attribute in attributes) {
      if (attributes.hasOwnProperty (attribute)) {
        if (attribute.indexOf (':') !== -1) {
          const value = attribute.split (':');
          element.setAttributeNS (
            'http://www.w3.org/1999/' + value[0],
            value[1],
            attributes[attribute]
          );
        } else {
          element.setAttribute (attribute, attributes[attribute]);
        }
      }
    }
    parent.appendChild (element);
    return element;
  }

  /**
       * Remove an Element from a SVG DOM
       * @param element
       */
  static removeElement (element) {
    element.parentNode.removeChild (element);
  }
}

//View
