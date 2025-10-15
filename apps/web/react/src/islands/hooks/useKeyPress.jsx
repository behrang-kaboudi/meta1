import { useEffect } from 'react';
function useKeyPress(targetKey, handler) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === targetKey) {
        handler(event);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [targetKey, handler]);
}
export default useKeyPress;
