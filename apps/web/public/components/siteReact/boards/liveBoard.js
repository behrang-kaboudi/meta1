import { PopOverName } from "../designs/design.js";
class LiveBoard extends SbkC {
   constructor(props) {
      super(props);
      let self = this;

      this.timer = null;
      this.event.on('create', function () {
         self.gbd = new bkGraphicalBoard.BkBoard(self.h.board, {
            imgSrc: '/public/components/bk-chessboard/pices/'
         });
         self.gbd.creat();
      })
   }
   boardClick() {
      this.props.funcs.click();
   }
   setGame(game) {
      // if (!this.render) return;
      // if (!this.game) return;
      this.game = game;
      let self = this;
      if (Object.keys(this.h).length < 1) {
         this._createComp();
      }
      this.engine = new Chess(this.game.startPosition);
      let gmMoves = this.game.gmMoves;

      for (let i = 0; i < gmMoves.length; i++) {
         let mv = gmMoves[i];
         if (mv) {
            mv = JSON.parse(mv);
            this.engine.move(mv);
         }
      }
      this.gbd.setPosition(this.engine.fen());
      this.c.topUserName.setName(this.game.blackUserName);
      this.c.dawnUserName.setName(this.game.whiteUserName);
      if (this.game.blackResult !== null) {
         this.h.topResult.innerText = this.game.blackResult;
         this.h.dawnResult.innerText = this.game.whiteResult;
      }
      clearInterval(this.timer);
      this.h.topTime.innerText = sbkTimer.getTimeParts(this.game.blackRemainingTime / 1000).stringify;
      this.h.dawnTime.innerText = sbkTimer.getTimeParts(this.game.whiteRemainingTime / 1000).stringify;
      if (this.game.blackResult || this.game.whiteResult || this.game.result) return;
      this.timerTime = this.game.blackRemainingTime;
      this.timerSelectedPart = this.h.dawnTime;
      if (this.engine.turn() == 'b') {
         this.timerTime = this.game.whiteRemainingTime;
         this.timerSelectedPart = this.h.topTime;
      }
      this.timerTime = this.timerTime / 1000;
      this.timer = setInterval(function () {

         self.timerSelectedPart.innerText = sbkTimer.getTimeParts(--self.timerTime).stringify
         if (self.timerTime == 0) {
            clearInterval(self.timer);
            socket.emit('newGameData', self.props.gameId);
         }
      }, 1000)
   }
   // <span ${this.hc('topUserName')} style=" overflow: hidden;
   //                                         white-space: nowrap;text-overflow: ellipsis;max-width: 10ch;">

   //                                         </span>
   _create() {
      this.html =  /*html*/
         `
            <div class='p-1 border rounded' ${this.ec({ click: "boardClick" })} style='background-color:#dfe2e9;'>
               <div class='fs-6'>
                  <div class='d-flex justify-content-between'>
                     <span>
                        ${this.child(PopOverName, {}, 'topUserName')}
                     </span>
                     <span ${this.hc('topResult')}></span>
                     <span ${this.hc('topTime')}></span>
                  </div>   
               </div>   
               <div style='width: 100%' class=" pointer"   ${this.hc('board')} ></div>
               <div class='d-flex justify-content-between'>
                  <span>
                     ${this.child(PopOverName, {}, 'dawnUserName')}
                  </span>
                  <span ${this.hc('dawnResult')}></span>
                  <span ${this.hc('dawnTime')}></span>
               </div>   
            </div>
         `;
   }
}
export { LiveBoard }