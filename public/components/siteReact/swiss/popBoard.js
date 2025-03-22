import { PopOverName } from "../designs/design.js";
import { LiveBoard } from "../boards/liveBoard.js";
import { getManager } from "./tourManager.js";
let manager, swiss;
class PopBoard extends SbkC {
   constructor(props) {
      super(props);
      let self = this;
      manager = getManager()
      swiss = manager.props.data;
      //this.event.on('create', function () {
      // if (self.game) {
      //         let g = manager.getGame(self.game._id);
      //         if (g) {
      //               self.game = g

      //               console.log('ggggg1', g);
      //         }

      //   }


      // todo if on hover not game in main req game
      // and in live aftwr rwcivwd set from main dab

      //})

      // this.event.on('render', function () {
      //         self.gbd = new bkGraphicalBoard.BkBoard(self.h.board, {
      //                 imgSrc: '/public/components/bk-chessboard/pices/'
      //         });
      //         socket.emit('newGameData', self.props.gameId);
      //         // todo if game end remove recon
      //         socket.io.on('reconnect', () => {
      //                 socket.emit('newGameData', self.props.gameId);
      //         })
      //         socket.on('gameData', function (obj) {
      //                 if (!obj.game) return;
      //                 if (self.props.gameId != obj.game._id) return;
      //                 self.game = obj.game;
      //                 self.gameDataProcess();
      //         });
      //         self.gbd.creat();
      //         self.gameDataProcess();.previousElementSibling
      // })
      /**
     ${this.ec({ mouseenter: "mouseenter", mouseout: "mouseout", mouseover: "mouseenter", mouseleave: "mouseout" })}
      */

      this.event.on('create', function () {
         // document.append(self.h.board)
         // self.mainElement.style.position = "relative";
         SbkC.funcs.hover(self.props.data.parent,
            () => { self.hoverIn() }, () => { self.hoverOut() });
         socket.on('gameData', function (obj) {
            if (!obj.game) return;
            if (obj.game._id != self.props.data.id) return;
            self.setBoard()
         });
      });
   }
   setBoard() {
      let g = manager.getGame(this.props.data.id);
      if (g) {
         this.game = g;
         if (this.c.liveBoard) this.c.liveBoard.setGame(g)
      }
   }
   hoverIn() {
      // if(this.game)return

      this.setBoard()
      //todo f(game)
      let rect = this.props.data.parent.getBoundingClientRect()
      //todo add to litner
      this.h.board.style.top = rect.bottom + window.scrollY + 2 + 'px';
      this.h.board.style.left = rect.left + window.scrollX - 70 + 'px';
      this.h.board.classList.remove('d-none');

   }
   hoverOut() {
      this.h.board.classList.add('d-none')
   }
   _create() {
      this.html =  /*html*/
         `
         <div ${this.hc('board')} class='bg-danger d-none'  style='position: absolute; width: 280px'>
                  ${this.child(LiveBoard, {}, 'liveBoard')}
         </div>
            
      `;
   }
}
export { PopBoard }