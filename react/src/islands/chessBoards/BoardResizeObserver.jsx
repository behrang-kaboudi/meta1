import { useEffect, useRef, useLayoutEffect } from 'react';
import useResizeObserver from 'use-resize-observer';

import { Chessboard } from 'react-chessboard';
// add
export default function BoardResizeObserver(props) {
  const {
    ref,
    width = 0,
    height = 0,
  } = useResizeObserver({
    onResize: ({ width, height }) => {
      console.log(`BoardResizeObserver: width: ${width}, height: ${height}`);
    },
  }); // ref رو به المان بده
  useEffect(() => {
    // window.addEventListener('resize', checkSize);
    // return () => window.removeEventListener('resize', checkSize);
  }, []);
  useLayoutEffect(() => {
    console.log(`BoardResizeObserver props:`);

    // if (!innerRef.current) return;
    // const target = outerRef.current;
    // const prevWidthRef = { current: boardWidth };

    // const update = (entry) => {
    //   const width = Math.round(entry.contentRect.width);

    //   // اگر اختلاف کمتر از 10 بود، کاری نکن
    //   if (Math.abs(width - prevWidthRef.current) < 10) return;

    //   prevWidthRef.current = width; // به‌روزرسانی مقدار قبلی
    //   setBoardWidth(width);
    //   setGutter(Math.floor(width / 26));
    // };

    // const onResize = (entries) => {
    //   update(entries[0]);
    // };

    // const ro = new ResizeObserver(onResize);
    // ro.observe(target);

    // return () => {
    //   ro.disconnect();
    // };
  }, []);

  return (
    <div ref={ref}>
      <Chessboard options={props} />
    </div>
  );
}
