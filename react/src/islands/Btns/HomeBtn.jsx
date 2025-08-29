import './HomeBtn.css';
export default function HomeBtn({
  //   timeText, // مثلا "1 + 0"
  labelText, // مثلا "Bullet"
  event = null,
  variant = 'light', // "light" یا "dark"
}) {
  function name(params) {
    // console.log('lll', event, pageEvs);
    pageEvs.emit(event);
  }

  return (
    <div className=" timeSets-col noSelect">
      <div
        className={`timeSets-box timeSets-box-${variant}  d-flex flex-column align-items-center justify-content-center`}
        role="button"
        tabIndex={0}
        onClick={() => name()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      >
        {/* <div className="timeSets-text">{timeText}</div> */}
        <div className="timeSets-text">{labelText}</div>
      </div>
    </div>
  );
}
