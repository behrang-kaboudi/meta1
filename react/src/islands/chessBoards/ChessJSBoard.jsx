import { useEffect, useState, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import ChessboardOuterNotation from './ChessboardOuterNotation';
import { defaultPieces as chessPieces } from 'react-chessboard';

export default function ChessJSBoard(props) {
  const gameRef = useRef(new Chess());
  const [FEN, setFEN] = useState(props.position);
  const [squareStyles, setSquareStyles] = useState({});
  const [promoArrows, setPromoArrows] = useState([]);
  const [showAnimations, setShowAnimations] = useState(true);
  const [moveFrom, setMoveFrom] = useState('');
  const [allowDragging, setAllowDragging] = useState(true);

  // ✅ پروموشن در انتظار انتخاب: { from, to, color: 'w'|'b' }
  const [pendingPromo, setPendingPromo] = useState(null);

  // ----- effects همگام‌سازی‌ها -----
  useEffect(() => {
    if (props.enrichedMove) {
      const m = props.enrichedMove;
      setFEN(m.enriched.fenBefore);
      setShowAnimations(false);
      setTimeout(() => {
        setMoveColor(m.enriched.from, m.enriched.to);
        setShowAnimations(true);
        setFEN(m.enriched.fenAfter);
      }, 200);
    }
  }, [props.enrichedMove]);

  useEffect(() => {
    if (props.position) {
      setFEN(props.position);
      setSquareStyles({});
    }
  }, [props.position]);

  useEffect(() => {
    if (!FEN) return;
    gameRef.current.load(FEN);
  }, [FEN]);

  useEffect(() => {
    // وقتی دیالوگ پروموشن باز است، درگ را ببند
    setAllowDragging(!pendingPromo);
  }, [pendingPromo]);

  // ----- کمکی‌ها -----
  function setMoveColor(from, to) {
    setSquareStyles({
      [from]: { backgroundColor: 'rgba(38, 121, 2, 0.25)' },
      [to]: { backgroundColor: 'rgba(237, 6, 6, 0.22)' },
    });
  }

  function setFirstSquare(sq) {
    setMoveFrom(sq);
    setSquareStyles((prev) => ({
      ...prev,
      [sq]: { backgroundColor: 'rgba(184,203,8,.25)' },
    }));
  }

  function removeFirst() {
    setSquareStyles((prev) => {
      const { [moveFrom]: _removed, ...rest } = prev;
      return rest;
    });
    setMoveFrom('');
  }

  const tryMove = (from, to, promotion = 'q') => {
    try {
      return gameRef.current.move({ from, to, ...(promotion ? { promotion } : {}) }) || null;
    } catch {
      return null;
    }
  };

  // آیا حرکتِ پیاده به ردیف آخر است؟
  function needsPromotion(from, to) {
    const p = gameRef.current.get(from); // { type:'p', color:'w'|'b' } | null
    if (!p || p.type !== 'p') return false;
    const rank = to[1]; // '1'..'8'
    return (p.color === 'w' && rank === '8') || (p.color === 'b' && rank === '1');
  }

  // باز کردن دیالوگ انتخاب
  function openPromotion(from, to) {
    const p = gameRef.current.get(from);
    if (!p) return;
    setPendingPromo({ from, to, color: p.color });
    setPromoArrows([
      {
        startSquare: from,
        endSquare: to,
        color: 'red',
      },
    ]);
  }

  // بستن دیالوگ بدون اعمال
  function cancelPromotion() {
    setPendingPromo(null);
    setPromoArrows([]);
  }

  // نهایی‌سازی پروموشن با مهره انتخاب‌شده: 'q' | 'r' | 'b' | 'n'
  function confirmPromotion(piece) {
    if (!pendingPromo) return;
    const { from, to } = pendingPromo;
    const mv = tryMove(from, to, piece);
    if (!mv) {
      // حرکت نامعتبر (نادر)، دیالوگ را ببند
      setPendingPromo(null);
      return;
    }
    setFEN(gameRef.current.fen());
    setMoveColor(from, to);
    setMoveFrom('');
    setPendingPromo(null);
    setPromoArrows([]);
    setShowAnimations(false);
    // یک تیک بعد انیمیشن روشن شود
    setTimeout(() => setShowAnimations(true), 10);
    afterMove(mv);
  }

  // ----- تعامل‌ها -----
  function onSquareClick(sq) {
    if (pendingPromo) return; // وقتی دیالوگ باز است، کلیک‌ها را نادیده بگیر
    const to = sq.square;

    // انتخاب خانهٔ اول
    if (!moveFrom && sq.piece) {
      // فقط مهره‌ی نوبت فعلی
      if (sq?.piece?.pieceType[0] !== gameRef.current.turn()) return;
      setFirstSquare(to);
      return;
    }

    // کلیک دوباره روی همان خانه
    if (moveFrom === to) {
      removeFirst();
      return;
    }

    // اگر نیاز به پروموشن دارد، دیالوگ را باز کن
    if (needsPromotion(moveFrom, to)) {
      openPromotion(moveFrom, to);
      return;
    }

    // حرکت عادی
    const mv = tryMove(moveFrom, to);
    if (mv) {
      setFEN(gameRef.current.fen());
      setMoveFrom('');
      setMoveColor(moveFrom, to);
      afterMove(mv); // ⟵ لاگ/کال‌بک یکجا
    } else {
      removeFirst();
    }
  }

  function canDragPiece({ piece }) {
    return piece.pieceType[0] === gameRef.current.turn();
  }

  function onPieceDrop(action) {
    if (pendingPromo) return false; // تا انتخاب نشده، هیچ دراپی قبول نشود
    const { sourceSquare, targetSquare } = action;
    if (!targetSquare) return false;

    // برگشت روی همان خانه → فقط انتخاب/هایلایت
    if (sourceSquare === targetSquare) {
      setFirstSquare(sourceSquare);
      return false;
    }

    // نیاز به پروموشن؟
    if (needsPromotion(sourceSquare, targetSquare)) {
      openPromotion(sourceSquare, targetSquare);
      return false; // فعلاً حرکت را نگه دار تا انتخاب شود
    }
    const mv = tryMove(sourceSquare, targetSquare);
    if (mv) {
      setMoveFrom('');
      setShowAnimations(false);
      setFEN(gameRef.current.fen());
      setMoveColor(sourceSquare, targetSquare);
      setTimeout(() => setShowAnimations(true), 10);
      afterMove(mv); // ⟵ اینجا هم
      return true;
    } else {
      return false;
    }
  }

  function onBoardMouseDownCapture(square) {
    const piece = gameRef.current.get(square);
    if (moveFrom && piece?.color === gameRef.current.turn()) {
      removeFirst();
    }
  }
  function afterMove(moveObj) {
    // moveObj خروجی chess.js است: {color, from, to, san, flags, piece, promotion, ...}

    props.afterBoardMove(moveObj);
    // اگر خواستی به والد هم خبر بدهی:
    // props.onMoveCommitted?.(moveObj, gameRef.current.fen());
  }

  return (
    <div style={{ position: 'relative' }}>
      <ChessboardOuterNotation
        {...props}
        squareStyles={squareStyles}
        showAnimations={showAnimations}
        position={FEN}
        dragActivationDistance={1}
        onBoardMouseDownCapture={onBoardMouseDownCapture}
        onSquareClick={onSquareClick}
        allowDragging={allowDragging}
        onPieceDrop={onPieceDrop}
        canDragPiece={canDragPiece}
        arrows={promoArrows}
      />

      {/* دیالوگ پروموشن */}
      {pendingPromo && (
        <PromotionPicker
          color={pendingPromo.color}
          pieceRenderers={props.customPieces ?? chessPieces}
          squarePx={
            document.querySelector('[data-column="a"][data-row="1"]')?.getBoundingClientRect()
              ?.width ?? 48
          }
          onPick={confirmPromotion}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  );
}

/* ---------- ویجت سادهٔ انتخاب پروموشن ---------- */
function PromotionPicker({ color, onPick, onCancel, pieceRenderers, squarePx = 48 }) {
  const pieces = ['q', 'r', 'b', 'n'];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        width: '55%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // مرکز دقیق
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#11111175',
          color: '#fff',
          padding: '1px',
          borderRadius: 12,
          display: 'flex',
          gap: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,.5)',
          //   width: '100%',
        }}
      >
        {pieces.map((p) => {
          const code = `${color}${p.toUpperCase()}`; // مثلا 'wQ' یا 'bN'
          const renderPiece = pieceRenderers?.[code]; // فانکشن رندر SVG
          const svg = renderPiece ? renderPiece({ squareWidth: squarePx * 3 }) : null;
          return (
            <button
              key={p}
              onClick={() => onPick(p)}
              style={{
                display: 'flex',
                padding: 0,
                width: squarePx,
                height: squarePx,
                lineHeight: '48px',
                textAlign: 'center',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              title={`Promote to ${p.toUpperCase()}`}
            >
              {svg /* SVG خودِ بورد */}
            </button>
          );
        })}
        <button
          onClick={onCancel}
          style={{
            marginInlineStart: 6,
            padding: '3px',
            borderRadius: 8,
            background: '#333',
            color: '#ddd',
            border: '1px solid #444',
            cursor: 'pointer',
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { Chess } from 'chess.js';
// import ChessboardOuterNotation from './ChessboardOuterNotation';
// export default function ChessJSBoard(props) {
//   //   const moveByDragStart = useRef(false);
//   const gameRef = useRef(new Chess());
//   const [FEN, setFEN] = useState(props.position);
//   const [squareStyles, setSquareStyles] = useState({});
//   const [showAnimations, setShowAnimations] = useState(true);
//   const [moveFrom, setMoveFrom] = useState('');
//   const [allowDragging, setAllowDragging] = useState(true);
//   //تنظم پوزیسیون از کلیک روی حرکت پی جی ان یا دریافت حرکت جدید به صورت انرچ شده
//   useEffect(() => {
//     if (props.enrichedMove) {
//       const m = props.enrichedMove;
//       setFEN(m.enriched.fenBefore);

//       setShowAnimations(false);
//       setTimeout(() => {
//         setMoveColor(m.enriched.from, m.enriched.to);
//         setShowAnimations(true);
//         setFEN(m.enriched.fenAfter);
//       }, 200); // 200ms یا هر مقداری که می‌خوای
//     }
//   }, [props.enrichedMove]);
//   useEffect(() => {
//     if (props.position) {
//       setFEN(props.position);
//       setSquareStyles({});
//     }
//   }, [props.position]);
//   useEffect(() => {
//     if (!FEN) return;
//     gameRef.current.load(FEN); // بارگذاری موقعیت فعلی
//   }, [FEN]);
//   useEffect(() => {
//     if (moveFrom) {
//       console.log('setMoveFrom useEffect', { from: moveFrom }, squareStyles);
//     } else {
//       console.log('invalid move:', { from: moveFrom });
//     }
//   }, [moveFrom]);
//   function setMoveColor(from, to) {
//     const newStyles = {};
//     newStyles[from] = { backgroundColor: 'rgba(38, 121, 2, 0.25)' };
//     newStyles[to] = { backgroundColor: 'rgba(237, 6, 6, 0.22)' };
//     setSquareStyles(newStyles);
//   }
//   function setFirstSquare(sq) {
//     setMoveFrom(sq); // async است؛ برای استایل از from استفاده کن
//     setSquareStyles((prev) => ({
//       ...prev,
//       [sq]: { backgroundColor: 'rgba(184,203,8,.25)' },
//     }));
//   }
//   function removeFirst() {
//     setSquareStyles((prev) => {
//       const { [moveFrom]: _removed, ...rest } = prev;
//       return rest;
//     });
//     setMoveFrom('');
//   }

//   const isMove = (from, to, promotion = 'q') => {
//     const move = gameRef.current.move({ from, to, promotion });
//     if (!move) return false; // حرکت غیرقانونی → رد
//     return true;
//   };

//   function onSquareClick(sq) {
//     let to = sq.square;
//     if (!moveFrom && sq.piece) {
//       if (sq?.piece?.pieceType[0] !== gameRef.current.turn()) return;
//       setFirstSquare(to);
//       return;
//     }
//     if (moveFrom === to) {
//       removeFirst();
//       return;
//     }
//     //to, check if valid move
//     if (isMove(moveFrom, to)) {
//       setFEN(gameRef.current.fen()); // UI به‌روز شود
//       setMoveFrom('');
//       setMoveColor(moveFrom, to);
//     } else {
//       removeFirst();
//     }
//   }
//   function canDragPiece({ piece }) {
//     return piece.pieceType[0] === gameRef.current.turn(); // فقط سفیدها
//   }

//   function onPieceDrop(action) {
//     const { sourceSquare, targetSquare } = action;
//     if (!targetSquare) return false;

//     if (sourceSquare === targetSquare) {
//       setFirstSquare(sourceSquare);
//       return false; // drop واقعی انجام نشده
//     }

//     if (isMove(sourceSquare, targetSquare)) {
//       setMoveFrom('');
//       setShowAnimations(false);
//       setFEN(gameRef.current.fen());
//       setMoveColor(sourceSquare, targetSquare);
//       setTimeout(() => setShowAnimations(true), 10);
//       return true; // موفق
//     } else {
//       return false; // غیرقانونی
//     }
//   }

//   function onBoardMouseDownCapture(square) {
//     const piece = gameRef.current.get(square);
//     // const pieceType = toPieceType(piece); // مثلا 'wP'
//     if (moveFrom && piece?.color === gameRef.current.turn()) {
//       removeFirst();
//     }
//   }

//   return (
//     <div>
//       {/* Render chess board here */}
//       <ChessboardOuterNotation
//         {...props}
//         squareStyles={squareStyles}
//         showAnimations={showAnimations}
//         position={FEN}
//         dragActivationDistance={1}
//         // onSquareMouseDown={onSquareMouseDown}
//         onBoardMouseDownCapture={onBoardMouseDownCapture}
//         onSquareClick={onSquareClick}
//         allowDragging={allowDragging}
//         onPieceDrop={onPieceDrop}
//         canDragPiece={canDragPiece}
//         // onMouseOverSquare={(e) => {
//         //   console.log(e, moveFrom);
//         // }}
//       />
//     </div>
//   );
// }
