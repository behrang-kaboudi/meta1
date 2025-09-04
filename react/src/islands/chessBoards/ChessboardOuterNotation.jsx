import { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import './outer-notation.css';

export default function ChessboardOuterNotation() {
  const [orientation, setOrientation] = useState('black');
  const [showNotation, setShowNotation] = useState(true);
  const [boardWidth, setBoardWidth] = useState(0);
  const [gutter, setGutter] = useState(0);

  const outerRef = useRef(null); // والد flex
  const innerRef = useRef(null); // رپرِ shrink-wrap
  // console.log(orientation, initialOrientation);

  useEffect(() => {
    const checkSize = () => {
      // اگر بزرگتر از 768px (مثلاً تبلت و دسکتاپ) → نوتیشن خاموش
      setShowNotation(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const target = outerRef.current;
    const prevWidthRef = { current: boardWidth };

    const update = (entry) => {
      const width = Math.round(entry.contentRect.width);

      // اگر اختلاف کمتر از 10 بود، کاری نکن
      if (Math.abs(width - prevWidthRef.current) < 10) return;

      prevWidthRef.current = width; // به‌روزرسانی مقدار قبلی
      setBoardWidth(width);
      setGutter(Math.floor(width / 26));
    };

    const onResize = (entries) => {
      update(entries[0]);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(target);

    return () => {
      ro.disconnect();
    };
  }, []);

  // useLayoutEffect(() => {
  //   // let preW = width;
  //   console.log('inside 1', boardWidth);
  //   if (!innerRef.current) return;
  //   const target = outerRef.current;

  //   const update = (entry) => {
  //     // if(preW ==)
  //     const width = Math.round(entry.contentRect.width);
  //     if (boardWidth == width) return;
  //     console.log('inside observer (live):', boardWidth, width, entry.contentRect.height);
  //     setBoardWidth(width);
  //     setGutter(Math.floor(width / 26));
  //   };

  //   const onResize = (entries) => {
  //     const entry = entries[0];
  //     update(entry);
  //   };

  //   const ro = new ResizeObserver(onResize);

  //   ro.observe(target);

  //   return () => {
  //     ro.disconnect();
  //   };
  // }, [boardWidth]);

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
    id: 'show-notation',
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

  return (
    <div className="cb-wrap-parent">
      <div
        className={`cb-wrap`}
        style={{ '--cb-gutter': `${gutter}px`, '--cb-font': `${(gutter * 135) / 100}px` }}
      >
        <div ref={outerRef} className="cb-board">
          {/* رپر داخلی: shrink-wrap تا اندازه به اندازه‌ی واقعی برد شود */}
          <div ref={innerRef} className="cb-inner">
            <Chessboard options={{ ...chessboardOptions, boardOrientation: orientation }} />
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
    </div>
  );
}
