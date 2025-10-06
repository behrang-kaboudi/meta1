import { useMemo, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Chessboard } from 'react-chessboard';
import useResizeObserver from '../../hooks/useResizeObserver.ts';
import { debounce } from 'throttle-debounce';
import Box from '@mui/material/Box';
import styles from './styles.js';
import './outer-notation.css';
// add
const boardSizeToHideNotation = 350;
export default function ChessboardOuterNotation(props) {
  const [orientation, setOrientation] = useState(props.boardOrientation || 'white');
  const [showNotation, setShowNotation] = useState(true);
  const [gutter, setGutter] = useState(0);

  // const { ref: containerRef } = useResizeObserver({
  //   onResize: ({ width = 0, height = 0 }) => {
  //     console.log(`ChessboardOuterNotation: width: ${width}, height: ${height}`);

  //     latest.current.containerWidth = width;
  //     latest.current.containerHeight = height;
  //     handleResizeDebounce();
  //   },
  // });
  const { ref: containerRef } = useResizeObserver({
    onResize: ({ width = 0, height = 0 }) => {
      latest.current.containerWidth = width;
      latest.current.containerHeight = height;
      handleResizeDebounce();
    },
  });
  const latest = useRef({
    containerWidth: 0,
    containerHeight: 0,
  });
  useEffect(() => {
    // console.log('Arrows updated:', props.arrows);
  }, []);
  useEffect(() => {
    if (props.boardOrientation) setOrientation(props.boardOrientation);
  }, [props.boardOrientation]);
  useEffect(() => {
    const checkSize = () => {
      // اگر بزرگتر از 768px (مثلاً تبلت و دسکتاپ) → نوتیشن خاموش
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Derive gutter when width changes

  const handleResizeDebounce = useMemo(
    () =>
      debounce(20, () => {
        const { containerWidth, containerHeight } = latest.current;
        // if (Math.abs(containerWidth - prevContainerWidth.current) < 8) return;
        let gutter = Math.floor(containerWidth / 28);
        setGutter(gutter);
        setShowNotation(containerWidth <= boardSizeToHideNotation);

        /* derive gutter, set state, etc. */
      }),
    [],
  );

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
    showNotation: showNotation,
    // id: 'show-notation',
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
  };

  const onBoardMouseDownCapture = (e) => {
    const el = e.target.closest('[data-square]');

    if (!el || !props.onBoardMouseDownCapture) return;
    props?.onBoardMouseDownCapture(el.getAttribute('data-square'));
  };
  let isBig = latest.current.containerWidth > boardSizeToHideNotation;
  return (
    <div ref={containerRef}>
      <Box
        className={clsx(`cb-wrap`, isBig ? `cb-wrap-big` : `cb-wrap-small`)}
        sx={{ bgcolor: '#bca28799' }}
        // sx={{ bgcolor: '#adadad' }}
        style={{
          '--cb-horizontal-gutter': `${3.2}%`,
          '--cb-gutter': `${gutter}px`,
          '--cb-font': `${(gutter * 135) / 100}px`,
          '--cb-board-size-to-hide-notation': `${boardSizeToHideNotation}px`,
        }}
      >
        <div className="cb-board">
          {/* رپر داخلی: shrink-wrap تا اندازه به اندازه‌ی واقعی برد شود */}
          <div onMouseDownCapture={onBoardMouseDownCapture}>
            <Chessboard
              options={{
                ...props,
                ...chessboardOptions,
                boardOrientation: orientation,
                // darkSquareStyle: {
                //   backgroundColor: '#138550',
                // },
                // lightSquareStyle: { backgroundColor: '#E2FAE6' }, // رنگ خانه‌های روشن
              }}
            />
          </div>
        </div>
        {/* <div className="mt-2 text-xs">board width: {boardWidth}px</div> */}
        {/* اورلی‌های بیرونی (کلیک‌پذیری را مسدود نمی‌کنند) */}
        <div className="cb-overlay">
          {/* <div className="cb-files cb-top">
          {files.map((f) => (
            <span key={`t-${f}`}>{f}</span>
          ))}
        </div> */}
          <div
            className={clsx(
              'cb-files cb-bottom',
              isBig ? 'cb-files-big cb-bottom-big' : 'cb-bottom-small',
            )}
          >
            {files.map((f) => (
              <span key={`b-${f}`}>{f}</span>
            ))}
          </div>
          <div className={clsx('cb-ranks cb-left', isBig ? `cb-ranks-big` : `cb-ranks-small`)}>
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
      </Box>
    </div>
  );
}
