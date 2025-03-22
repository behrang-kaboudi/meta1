import {
   LiveBoards
} from "./liveBoards.js";
import {
   Info
} from "./info.js";
import {
   RegisterBtn
} from "./registerBtn.js";
import {
   TimeToStart
} from "./timeToStart.js";
import {
   Chat
} from "../chat/chat.js";
import {
   Rounds
} from "./Rounds.js";
import {
   StandingList
} from "./standing.js";
class TourManager extends SbkC {
   static instance;
   constructor(props) {
      super(props);
      this.initial = false;
      // this.joinGameRooms();
      let self = this;
      this.event.on('create', function () {
         socket.on('data', function (swissTour) {
            if (swissTour.root == 'swiss-' + tourId && swissTour.data.tour._id == tourId) {
               self.setData(swissTour);
               if (!self.initial) {
                  self.initialComps()
               } else {
                  self.update();
               }
               self.gotoLastGame();
            }
         });
      })
      socket.on('gameData', function (obj) {
         if (!obj.game) return;
         if (self.props.data.tour._id != obj.game.tournamentId) return;
         self.gameDataProcess(obj.game);
      });
   }
   update() {
      this.joinGameRooms();
      this.registerBtn.update();
      this.timeToStart.update();
      this.standing.update();
      this.rounds.update();
      this.liveBoards.update();
   }
   setData(swissTour) {
      for (const key in swissTour.data) {
         TourManager.instance.props.data[key] = swissTour.data[key];
      }
   }
   gameDataProcess(game) {
      let index = this.props.data.games.findIndex(g => g._id == game._id);
      this.props.data.games[index] = game;
      //todo also set for recon
   }
   joinGameRooms() {
      this.props.data.games.forEach(g => {
         socket.emit('joinRoom', 'gameRome' + g._id);
      });
      //todo also set for recon
   }
   getGame(id) {
      let g = this.getPartGame(id)
      if ('pgn' in g) {
         return g;
      }
      socket.emit('newGameData', id);
   }
   getPartGame(id) {
      let g = this.props.data.games.find(g => g._id == id);
      return g;
   }
   gotoLastGame() {
      let me = this.props.data.standing.find(p => p.userName == userName);
      if (me) {
         let myLastGameId = me.gameIds[me.gameIds.length - 1];
         if (myLastGameId) {
            let lastGame = this.props.data.games.find(g => g._id == myLastGameId);
            if (lastGame) {
               if (lastGame.whiteResult || lastGame.blackResult) return;
               let remainingTime = lastGame.acceptedTime - Date.now();
               if (remainingTime > 5000) {
                  setTimeout(() => {
                     window.location.href = '/game/play/' + lastGame._id;
                  }, remainingTime - 6000);
               } else {
                  window.location.href = '/game/play/' + lastGame._id;
               }
            }
         }
      }
   }
   initialComps() {
      this.timeToStart = SbkC.render({
         class: TimeToStart,
         parent: document.getElementById('swiss-timeToStart'),
      })
      this.registerBtn = SbkC.render({
         class: RegisterBtn,
         parent: document.getElementById('swiss-registerBtn'),
      });
      this.rounds = SbkC.render({
         class: Rounds,
         parent: document.getElementById('bodyRounds'),
      })
      this.standing = SbkC.render({
         class: StandingList,
         parent: document.getElementById('swissStanding')
      });
      this.liveBoards = SbkC.render({
         class: LiveBoards,
         parent: document.getElementById('swissAllGames')
      });
      this.info = SbkC.render({
         class: Info,
         parent: document.getElementById('bodyInfo'),
      })
      this.chat = SbkC.render({
         class: Chat,
         data: {
            data: {
               to: this.props.data.tour_id,
               room: 'swiss'
            },
            server: {
               root: 'chat',
               fName: 'getChat',
               id: 'swiss-' + this.props.data.tour._id,
               req: true,
            }
         },
         parent: document.getElementById('swissChat')
      });
      this.initial = true;
   }
   _create() {

   }
}
function getManager(data) {
   if (TourManager.instance) return TourManager.instance;
   TourManager.instance = new TourManager(data)
   TourManager.instance._createComp()
   return TourManager.instance;
}
export { getManager }