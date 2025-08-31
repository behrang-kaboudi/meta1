import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ChessboardOuterNotation from './ChessboardOuterNotation.jsx';

export default function RChessboard() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());

  const onPieceDrop = useCallback(
    (sourceSquare, targetSquare) => {
      // تلاش برای انجام حرکت
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move) {
        setFen(game.fen());
        return true; // به کتابخانه می‌گوید حرکت قابل قبول بود
      }
      return false; // حرکت نامعتبر
    },
    [game],
  );
  const chessboardOptions = {
    // id: 'board-style',
  };

  return (
    <>
      <ChessboardOuterNotation
        orientation="black"
        // هر prop خودِ react-chessboard را هم می‌پذیرد:
        position={fen}
        // onPieceDrop={onDrop}
        animationDurationInMs={200}
      />
    </>

    // <div className="p-4">
    //   <div className="mb-2 text-sm">FEN: {fen}</div>
    //   <Chessboard
    //     position={fen}
    //     onPieceDrop={onPieceDrop}
    //     boardOrientation="white"
    //     customBoardStyle={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,.15)' }}
    //     // width را معمولاً با CSS کنترل کن، ولی این prop هم مفید است اگر لازم داشتی:
    //     // boardWidth={480}
    //   />
    // </div>
  );
}
