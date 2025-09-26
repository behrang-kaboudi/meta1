import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ChessboardOuterNotation from './ChessboardOuterNotation/ChessboardOuterNotation.jsx';

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
  );
}
