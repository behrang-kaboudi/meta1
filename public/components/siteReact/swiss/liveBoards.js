import { LiveBoard } from "../boards/liveBoard.js";
import { getManager } from "./tourManager.js";
let manager, swiss;
class BoardManager extends SbkC {
   constructor(props) {
      super(props);
      let self = this;
      this.event.on('create', function () {
         self.setBoard()
         socket.on('gameData', function (obj) {
            if (!obj.game) return;
            if (obj.game._id != self.props.data.id) return;
            self.setBoard()
         });//TODO
      });
   }
   setBoard() {
      let g = manager.getGame(this.props.data.id);
      if (g) {
         this.game = g;
         if (this.c.liveBoard) this.c.liveBoard.setGame(g)
      }
   }
   _create() {
      let self = this;
      this.html =  /*html*/
         `
            <div ${this.hc('board')} class='mx-auto    '  style='' >
               ${this.child(LiveBoard, { data: { size: 100 }, funcs: { click: () => { window.location.href = '/game/play/' + self.props.data.id; } } }, 'liveBoard')}
            </div>
         `;
   }
}
class LiveBoards extends SbkC {
   constructor(props) {
      super(props);
   }
   setInner() {
      let length = this.props.data.games.length
      if (!length) return;
      let setEnd = false;
      let html = '';
      for (let i = 0; i < length; i++) {
         const id = this.props.data.games[i]._id;
         if (i % 4 == 0) {
            html += '<div class="row mb-4 " >';
            setEnd = false;
         }
         html +=  /*html*/
            `
                <div class="col-lg-3 " style=""  ${this.hc(id)}>
                       ${this.child(BoardManager, { data: { id } }, '')}
                </div>
            `;
         if (i % 4 == 3) {
            html += '</div>'
            setEnd = true;
         }
      }
      if (!setEnd) html += '</div>';
      return html;
   }

   _create() {
      let innerHtml = this.setInner();
      if (!innerHtml) {
         innerHtml = ''
      }
      this.html = /*html*/
         `
            <div>
                    ${innerHtml}
            </div>
                
        `;

   }
}
class LiveBoardsHolder extends SbkC {
   constructor(props) {
      super(props);
      manager = getManager()
      swiss = manager.props.data;
      this.getLastRdGames();

   }
   getLastRdGames() {
      this.games = swiss.games.filter(g => g.tournamentRound == swiss.tour.round);
   }
   update() {
      this.disposeChild();
      this.getLastRdGames();
      let inner = this.dChild(LiveBoards, { data: { games: this.games } });
      this.h.parent.append(inner.mainElement);
   }
   _create() {

      this.html =  /*html*/
         `
            <div ${this.hc('parent')}>
                ${this.child(LiveBoards, { data: { games: this.games } })}
            </div>
        `;
   }

}
export { LiveBoardsHolder as LiveBoards }