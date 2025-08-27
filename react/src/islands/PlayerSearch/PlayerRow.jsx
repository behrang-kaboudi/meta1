import { memo } from 'react';

function PlayerRow({ user, isActive = false, rightSlot = null }) {
  return (
    <div className={`list-group-item text-start ${isActive ? 'active' : ''}`} role="listitem">
      <div className="bg-light" style={{ border: '1px solid' }}>
        <div className="m-2 h5" style={{ width: '100%' }}>
          <i className="fa fa-toggle-off" />
          <strong className="mx-2 h5">{user.userName}</strong>
        </div>
        <div className="mx-2 my-1 d-flex justify-content-between">
          <span>
            {' '}
            <i className="fas fa-space-shuttle" /> <span id="bullet"> {user.bullet} </span>{' '}
          </span>
          <span>
            {' '}
            <i className="fas fa-fire" /> <span id="blitz"> {user.blitz} </span>{' '}
          </span>
          <span>
            {' '}
            <i className="fas fa-rabbit" /> <span id="rapid"> {user.rapid} </span>{' '}
          </span>
          <span>
            {' '}
            <i className="fas fa-turtle" /> <span id="classic"> {user.classic} </span>{' '}
          </span>
        </div>

        <div
          className="py-1 d-flex justify-content-between"
          style={{ borderTop: '1px solid', backgroundColor: 'darkgray' }}
        >
          <span className="flex-fill text-center pointer" style={{ borderRight: '1px solid' }}>
            <i className="fas fa-photo-video" />
          </span>
          <span className="flex-fill text-center pointer" style={{ borderRight: '1px solid' }}>
            <i className="far fa-comments" />
          </span>
          <span
            className="flex-fill text-center pointer"
            onClick={() => {
              //   console.log(user.id);
              showCreatChalenge(user.userName);
            }}
            style={{ borderRight: '1px solid' }}
          >
            <i className="far fa-swords" />
          </span>
          <span className="flex-fill text-center pointer">
            {' '}
            <i className="fal fa-thumbs-up" /> follow{' '}
          </span>
        </div>

        {rightSlot ? <div className="mt-2 d-flex justify-content-end">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
function showCreatChalenge(oppName) {
  //   console.log(oppName, userName);
  if (!userName || oppName == userName) {
    return;
  }
  document.getElementById('selectedUserForChalenge').innerText = oppName;
  creatChalengeModal.show();
}

export default memo(PlayerRow);
