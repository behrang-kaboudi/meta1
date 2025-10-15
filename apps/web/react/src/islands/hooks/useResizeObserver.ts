import * as React from 'react';

/**
 * Options for useResizeObserver
 */
export type BoxOption = 'content-box' | 'border-box' | 'device-pixel-content-box';
export type Size = { width?: number; height?: number };

export interface UseResizeObserverOpts<T extends HTMLElement = HTMLElement> {
  ref?: React.RefObject<T | null> | ((node: T | null) => void) | null;
  box?: BoxOption;
  round?: (n: number) => number;
  onResize?: (size: Required<Size>) => void;
}

type ROEntry = ResizeObserverEntry & {
  // Some engines expose array or single object; keep it loose
  contentBoxSize?: any;
  borderBoxSize?: any;
  devicePixelContentBoxSize?: any;
};

/**
 * extractSize — mirrors the logic of the original library:
 * - Prefer requested box measurement if available
 * - Accept both array and single-object forms
 * - Fallback to contentRect when needed
 * Source idea: extractSize() in the uploaded bundles.
 */
function extractSize(
  entry: ROEntry,
  boxProp: 'contentBoxSize' | 'borderBoxSize' | 'devicePixelContentBoxSize',
  key: 'inlineSize' | 'blockSize',
) {
  const val = (entry as any)[boxProp];
  if (!val) {
    if (boxProp === 'contentBoxSize') {
      // Spec equivalence with contentRect
      const cr = entry.contentRect;
      return key === 'inlineSize' ? cr.width : cr.height;
    }
    return undefined;
  }
  // Accept array or single object
  const unit = Array.isArray(val) ? val[0] : val;
  if (unit && unit[key] != null) return unit[key];
  // Final fallback
  const cr = entry.contentRect;
  return key === 'inlineSize' ? cr.width : cr.height;
}

/**
 * useResolvedElement — a callback-ref that (re)subscribes when the node changes,
 * inspired by the upstream approach.
 */
function useResolvedElement<T extends HTMLElement>(
  subscriber: (el: T) => void | (() => void),
  foreignRef?: React.RefObject<T | null> | ((node: T | null) => void) | null,
) {
  const last = React.useRef<{
    element: T | null;
    cleanup?: () => void;
    subscriber: typeof subscriber;
  } | null>(null);

  const foreignRefRef = React.useRef(foreignRef);
  foreignRefRef.current = foreignRef;

  const evaluate = React.useCallback(
    (element: T | null) => {
      // If nothing changed, skip
      if (
        last.current &&
        last.current.element === element &&
        last.current.subscriber === subscriber
      )
        return;

      // cleanup previous
      if (last.current?.cleanup) {
        try {
          last.current.cleanup();
        } catch {}
      }

      last.current = {
        element,
        subscriber,
        cleanup: element ? (subscriber(element) as any) : undefined,
      };
    },
    [subscriber],
  );

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (last.current?.cleanup) {
        try {
          last.current.cleanup();
        } catch {}
        last.current = null;
      }
    };
  }, []);

  // Returned callback ref (composed with an external ref if provided)
  return React.useCallback(
    (node: T | null) => {
      // Forward to external ref (object or function)
      const fr = foreignRefRef.current;
      if (fr) {
        if (typeof fr === 'function') fr(node);
        else (fr as React.RefObject<T | null>).current = node;
      }
      evaluate(node);
    },
    [evaluate],
  );
}

/**
 * The hook
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  opts: UseResizeObserverOpts<T> = {},
) {
  const { ref: externalRef = null, box = 'content-box', round = Math.round, onResize } = opts;

  // state for consumers that prefer width/height over callback
  const [size, setSize] = React.useState<Required<Size>>({ width: 0, height: 0 });
  const prevRef = React.useRef<Required<Size>>({ width: 0, height: 0 });
  const onResizeRef = React.useRef(onResize);
  onResizeRef.current = onResize;

  const didUnmount = React.useRef(false);
  React.useEffect(() => {
    didUnmount.current = false;
    return () => {
      didUnmount.current = true;
    };
  }, []);

  const subscriber = React.useCallback(
    (element: T) => {
      if (typeof window === 'undefined' || typeof (window as any).ResizeObserver === 'undefined') {
        // Fallback: initialize with current rect; no continuous updates without RO
        try {
          const r = element.getBoundingClientRect();
          const next = { width: round(r.width), height: round(r.height) };
          prevRef.current = next;
          if (onResizeRef.current) onResizeRef.current(next);
          else if (!didUnmount.current) setSize(next);
        } catch {}
        return () => {};
      }

      let frame: number | null = null;
      const RO: typeof ResizeObserver = (window as any).ResizeObserver;

      const ro = new RO((entries: ResizeObserverEntry[]) => {
        const e = entries[0] as ROEntry;
        if (!e) return;

        // Map box option -> prop
        const prop =
          box === 'border-box'
            ? 'borderBoxSize'
            : box === 'device-pixel-content-box'
              ? 'devicePixelContentBoxSize'
              : 'contentBoxSize';

        const w = extractSize(e, prop as any, 'inlineSize');
        const h = extractSize(e, prop as any, 'blockSize');

        // Coalesce bursts
        if (frame != null) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const next = {
            width: w != null ? round(w) : undefined,
            height: h != null ? round(h) : undefined,
          } as Required<Size>;

          // avoid unnecessary updates
          if (prevRef.current.width !== next.width || prevRef.current.height !== next.height) {
            prevRef.current = next;
            if (onResizeRef.current) onResizeRef.current(next);
            else if (!didUnmount.current) setSize(next);
          }
        });
      });

      // Initial read so consumers get a value even if no RO tick fires
      try {
        const r = element.getBoundingClientRect();
        const next = { width: round(r.width), height: round(r.height) };
        prevRef.current = next;
        if (onResizeRef.current) onResizeRef.current(next);
        else if (!didUnmount.current) setSize(next);
      } catch {}

      try {
        ro.observe(element, { box } as any);
      } catch {
        // Older Safari might throw on { box }, fall back
        ro.observe(element);
      }

      return () => {
        if (frame != null) cancelAnimationFrame(frame);
        ro.disconnect();
      };
    },
    [box, round],
  );

  const ref = useResolvedElement<T>(subscriber, externalRef);

  return React.useMemo(
    () => ({ ref, width: size.width, height: size.height, size }),
    [ref, size.width, size.height],
  );
}

export default useResizeObserver;
