import { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import './outer-notation.css';

export default function ChessboardOuterNotation({
  orientation = 'white', // "white" | "black"
  className = '',
  gutter = 11, // فاصله برای برچسب‌ها (px)
  rankGutter = 11,
  props,
}) {
  if (!props.rankGutter) console.log('no', rankGutter);

  const files = useMemo(
    () =>
      orientation === 'white'
        ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'],
    [orientation],
  );
  const ranks = useMemo(
    () =>
      orientation === 'white'
        ? ['8', '7', '6', '5', '4', '3', '2', '1']
        : ['1', '2', '3', '4', '5', '6', '7', '8'],
    [orientation],
  );
  const chessboardOptions = {
    // showNotation: false,
    showNotation: true,
    id: 'show-notation',
    boardOrientation: { orientation },
    boardStyle: {
      //   borderRadius: '10px',
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
      border: '2px solid #000',
      //   margin: '20px 0',
    },
    alphaNotationStyle: {
      color: 'cyan',
      fontSize: '0px',
      //   fontWeight: 'bold',
    },
    ...boardProps,
  };

  return (
    // <div style={{ paddingLeft: `${gutter}px` }}>
    <div
      className={`cb-wrap ${className}`}
      style={{ '--cb-gutter': `${gutter}px`, '--cb-rankGutter': `${rankGutter}px` }}
    >
      <div className="cb-board">
        <Chessboard options={chessboardOptions} />
      </div>

      {/* اورلی‌های بیرونی (کلیک‌پذیری را مسدود نمی‌کنند) */}
      <div className="cb-overlay">
        {/* <div className="cb-files cb-top">
          {files.map((f) => (
            <span key={`t-${f}`}>{f}</span>
          ))}
        </div> */}
        <div className="cb-files cb-bottom">
          {files.map((f) => (
            <span key={`b-${f}`}>{f}</span>
          ))}
        </div>
        <div className="cb-ranks cb-left">
          {ranks.map((r, i) => (
            <span key={`l-${r}-${i}`}>{r}</span>
          ))}
        </div>
        {/* <div className="cb-ranks cb-right">
          {ranks.map((r, i) => (
            <span key={`r-${r}-${i}`}>{r}</span>
          ))}
        </div> */}
      </div>
    </div>
    // </div>
  );
}
