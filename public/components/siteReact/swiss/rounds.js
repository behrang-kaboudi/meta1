import { PopOverName } from "../designs/design.js";
import { PopBoard } from "./popBoard.js";
import { getManager } from "./tourManager.js";
let manager, swiss;

class GameRaw extends SbkC {
   constructor(props) {
      super(props);
      let self = this;
      this.game = swiss.games.find(g => g.tournamentRound == this.props.data.round && g.boardNo == this.props.data.table);
      this.event.on('create', function () {
         self.setRow();
      })
      /// todo update results on game data
      // socket.on('gameData', function (obj) {
      //       try {
      //             if (!obj.game) return;
      //             if (self.game.gameId != obj.game._id) return;
      //             self.game = obj.game;
      //             self.setBoard(obj.game);
      //       } catch (error) {

      //       }
      // });

   }
   setBy() {
      let notPlaying = swiss.standing.find(p => p.gameIds[this.props.data.round - 1] == '-')
      this.c.wName.setName(notPlaying.userName)
      this.c.bName.setName('bye')
      this.h.wr.innerText = '+';
      this.h.br.innerText = '-';
   }
   setBoard() {
      let bd = this.dChild(PopBoard, { data: { id: this.game._id, parent: this.h.result } }, 'popBoard')
      this.h.result.append(bd.mainElement)
   }
   setRow() {
      if (!this.game) {
         this.setBy();
         return;
      }
      this.c.wName.setName(this.game.whiteUserName)
      this.c.bName.setName(this.game.blackUserName)
      if (!this.game.blackResult && !this.game.whiteResult) {
         this.h.wr.innerText = '*';
         this.h.br.innerText = '*';
      }
      else {
         this.h.wr.innerText = this.game.whiteResult;
         this.h.br.innerText = this.game.blackResult;
      }
      this.setBoard();
   }
   _create() {
      let elCss =  /*html*/
         `
            border-width: 1px;
            border-color: rgb(217 217 217);
            border-style: solid;
            padding-top: clamp(0.1rem, 0.7vw, 7rem);
            padding-bottom: clamp(0.1rem, 0.5vw, 5rem);
        `;
      if (this.props.data.theme == 'dark') {
         elCss += 'background-color: rgb(240, 238, 225);';
      }
      elCss = elCss.replace(/\r|\n/g, '')
      this.html =  /*html*/
         `
            <div  style='${elCss}' class='d-flex dir-ltr' >
                  <div class='ms-4' style="width:10%">
                        ${this.props.data.table}
                  </div>
                  <div ${this.hc('w')} style="width:20%">
                        ${this.child(PopOverName, {}, 'wName')}
                  </div>
                  <div  style="width:5%">
                  </div>
                  <div class=' ' style="width:20%">
                        <div  ${this.hc('result')} class='text-center '>
                              <span ${this.hc('wr')} >
                              </span>
                              <span class='mx-1'>
                                    -
                              </span>
                              <span ${this.hc('br')} >
                        </div>
                  </div>
                        
                  <div  style="width:15%">
                  </div>
                  <div class='' ${this.hc('b')} style="width:35%">
                        ${this.child(PopOverName, {}, 'bName')}
                  </div>
            </div>
        `;
   }

}
class RoundPage extends SbkC {
   constructor(props) {
      super(props);
   }
   roundClicked(e) {
      // console.log('', e.path[0].getAttribute("sbkcdata"));
   }
   display() {
      this.h.rows.classList.remove('d-none')
   }
   hide() {
      this.h.rows.classList.add('d-none')
   }
   _create() {
      let inner = '';
      for (let i = 0; i < Math.ceil(swiss.standing.length / 2); i++) {
         let theme = 'light';
         if (i % 2 == 1) theme = 'dark';
         inner += this.child(GameRaw, {
            data: {
               ...this.props.data,
               table: i + 1,
               theme
            }
         }, i + 1)
      }

      this.html =  /*html*/
         `
                  
                  <div  ${this.hc('rows')}  class='px-1 py-1 m-1  overflow-auto border rounded-1 d-none'>
                        <div class='mx-2 text-danger fw-bolder'>
                              Rd${this.props.data.round}
                        </div>
                        <div>
                        ${inner}
                        </div>
                        
                  </div>    
            `;
   }
}
class Rounds extends SbkC {
   constructor() {
      super();
      let self = this;

      this.event.on('create', function () {
         if (swiss.games.length > 0) {
            self.c['1'].display();

            self.h[1].classList.add('text-info')
         }

      })
   }
   roundClicked(e) {
      for (let i = 0; i < swiss.tour.round; i++) {
         this.c[i + 1].hide();
         this.h[i + 1].classList.remove('text-info')
      }
      let round = e.path[0].getAttribute("sbkcdata")
      this.c[round].display();
      this.h[round].classList.add('text-info')
   }
   _create() {

      let roundNums = '';
      let roundPages = '';
      for (let i = 0; i < swiss.tour.round; i++) {
         roundNums += /*html*/
            `
                        <div ${this.hc(i + 1)})} class='ms-2  mt-3 pointer ' ${this.ec({ click: "roundClicked" })} sbkcdata='${i + 1}'>
                              Round ${i + 1}
                        </div>
                  `;
         roundPages += /*html*/
            `
                        <div class='ms-2 mt-3 pointer'  sbkcdata='${i + 1}'>
                        ${this.child(RoundPage, {
               data: {
                  round: i + 1
               }
            }, (i + 1).toString())}
                        </div>
                  `;
      }
      this.html =  /*html*/
         `
            <div class='d-flex mx-auto  justify-content-between'>
               <div  class='mb-3  px-0 '  style = 'border:solid 1px rgb(204, 204, 204); border-radius: 6px;min-width:30%'>
                  <div style='background-color: rgb(58, 80, 137);color:white;border:solid 1px rgb(204, 204, 204); border-radius: 6px;' class='px-2 py-2'>
                        Rounds
                  </div>   
                  <div  ${this.hc('rows')}  class='px-1 py-1 m-1  overflow-auto border rounded-1 sbkc-fs-10'>
                        ${roundNums}
                  </div>   
               </div>
               <div class='mb-3 px-0 overflow-auto'  style = 'border:solid 1px rgb(204, 204, 204); border-radius: 6px;height:700px;
                  min-width:67% ;max-width:69%'>
                  <div class='' style='min-width:300px;'>
                     <div class='d-flex p-2 mx-auto' style='background-color: rgb(58, 80, 137);color:white;width:100%;
                        border:solid 1px rgb(204, 204, 204); border-radius: 6px;' class='px-2 py-2'>
                        <div class='ms-auto text-center d-flex justify-content-center' style="color:white;width:10%">
                           Table
                        </div>
                        <div  style="width:5%">
                        </div>
                        <div class='ms-1' style="color:white;width:55%">
                           White
                        </div>
                        <div  style="color:white;width:35%">
                           Black
                        </div>
                     </div> 
                     ${roundPages}
                  </div>
               </div>
            </div>
                
        `;
   }
}
class RoundsHolder extends SbkC {
   constructor() {
      super();
      manager = getManager()
      swiss = manager.props.data;

   }
   update() {
      this.disposeChild();
      this.h.parent.innerHTML = '';
      let inner = this.dChild(Rounds);
      this.h.parent.append(inner.mainElement);
   }
   _create() {
      console.log("🚀 ~ file: rounds.js ~ line 229 ~ RoundsHolder ~ constructor ~ swiss", swiss)

      //    return
      // }
      let inner =  /*html*/
         `
            <div class='mx-auto text-center fs-2 p-5' style='';>
               Rounds not Started 
            </div>
         `;
      if (swiss.games.length > 0) {
         inner =  /*html*/
            `
         ${this.child(Rounds, {}, 'rounds')}
         `;
      }
      this.html =  /*html*/
         `
            <div ${this.hc('parent')} style='height:95%' class='sbkc-fs-8'>
                  ${inner}
            </div>
         `;
   }

}

export { RoundsHolder as Rounds }
