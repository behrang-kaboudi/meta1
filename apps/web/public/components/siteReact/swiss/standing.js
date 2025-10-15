import { SimpleText } from "../designs/loadings.js";
import { LiveBoard } from "../boards/liveBoard.js";
import { PopOverName } from "../designs/design.js";
import { getManager } from "./tourManager.js";
import { PopBoard } from "./popBoard.js";
let manager, swiss;

class Point extends SbkC {
	constructor(props) {
		super(props);
		let self = this;

		this.event.on("create", function () {
			self.setPoint();
			//todo on game data change result get event from manager eventName: game-id
			// socket.on('gameData', function (obj) {
			//       if (!obj.game) return;
			//       if (self.props.player.gameIds[self.props.round - 1] != obj.game._id) return;
			//       if (obj.game.blackResult || obj.game.whiteResult) {
			//             if (self.props.player.userName == obj.game.blackUserName) {
			//                   // console.log('', self.h);
			//                   self.h.point.innerText = obj.game.blackResult;
			//             } else {
			//                   self.h.point.innerText = obj.game.whiteResult;
			//             }
			//       }
			// });
		});
	}
	setPoint() {
		this.setBoard();
	}
	setBoard() {
		if (this.pointText == "+") return;
		let gameId = this.props.player.gameIds[this.props.round - 1];
		let bd = this.dChild(
			PopBoard,
			{ data: { id: gameId, parent: this.h.parent } },
			"popBoard"
		);
		this.h.parent.append(bd.mainElement);
	}
	getPointText() {
		let p = this.props.player.results[this.props.round - 1];
		if (this.props.player.gameIds[this.props.round - 1] == "-") return "+";
		if (p === null || p === undefined) return "*";
		return p;
	}
	//  
	_create() {
		let p = this.getPointText();
		this.pointText = p;
		let style = "color: rgb(58, 80, 137);";
		if (p == 0) style = "color: #cb1212;";
		let link = "";
		if (p != "+")
			link = `href='/game/play/${this.props.player.gameIds[this.props.round - 1]
				}'`;
		this.html =/*html*/`
            <div ${this.hc("parent")} style="width: ${100 / this.props.player.gameIds.length}%">
               	<a  ${link} ${this.hc("point")}   style="${style};z-index:0 !important;">
                  ${p}
				</a>
			</div>
         `;
	}
}
class PlayerRow extends SbkC {
	constructor(props) {
		super(props);
		let self = this;

		this.player = props.data.player;
		this.theme = props.data.theme;
		this.rank = props.data.rank;
	}
	changed(data) {
		this.player = data;
		this._createComp();
	}
	setRoundPoints() {
		let html = "";
		for (let r = 0; r < this.player.gameIds.length; r++) {
			html +=
				/*html*/
				`
               ${this.child(Point, { player: this.player, round: r + 1 })}
                  
            `;
		}
		html += "";
		return html;
	}
	points() {
		let point = 0;
		this.player.results.forEach((r) => {
			point += r;
		});

		return point;
	}
	_create() {
		let roundPoints = this.setRoundPoints();
		let points = this.points();
		let elCss =
			/*html*/
			`
            border-width: 1px;
            border-color: rgb(217 217 217);
            border-style: solid;
            padding-top: clamp(0.1rem, 0.7vw, 7rem);
            padding-bottom: clamp(0.1rem, 0.5vw, 5rem);
        `;
		//
		if (this.theme == "dark") {
			elCss += "background-color: rgb(240, 238, 225);";
		}
		elCss = elCss.replace(/\r|\n/g, "");
		this.html =
			/*html*/
			`
            <div  style='${elCss}' class='d-flex justify-content-between dir-ltr'>
                <div class=' d-flex justify-content-center align-items-center p-0' style= "width:6%">
                	${this.rank}
                </div>
                <div data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Disabled popover"  class='d-flex ' style= "width: 30%;" >
                        ${this.child(PopOverName, { data: { name: this.player.userName }, })}
                </div>
                <div class='d-flex  me-5 ' style= "width: 44%">
                    ${roundPoints}
                </div>
                <div class='text-center d-flex justify-content-center' style= "width: 20% ";>
					<span class='d-flex px-2' style=''>
						<span class='text-left' style="font-weight: 750;width:4ch" >
							${points}
						</span>   
						<span class='text-left' style='width:4ch'>
							${this.player.buc1 ? this.player.buc1 : "0"}
						</span>
				  	</span>
                </div>
            </div>
        `;
	}
}
class StandingList extends SbkC {
	constructor(props) {
		super(props);
		let self = this;
	}
	_create() {
		if (swiss.standing.length == 0) {
			this.html =
				/*html*/
				`
                    <div class="mx-auto text-center mt-3 fs-5">
						There Is No Data
					</div>
                `;
			return;
		}
		let inner = "";
		for (let i = 0; i < swiss.standing.length; i++) {
			const player = swiss.standing[i];
			const games = swiss.games.filter(
				(g) =>
					g.blackUserName == player.userName ||
					g.whiteUserName == player.userName
			);
			let theme = "light";
			if (i % 2 == 1) theme = "dark";
			inner += this.child(PlayerRow, {
				data: { games, player, theme, rank: i + 1 },
			});
		}
		this.html =
			/*html*/
			`
            <div class='mb-3 sbkc-fs-8'  style = 'border:solid 1px rgb(204, 204, 204); border-radius: 6px;height:700px;min-width: ${swiss.tour.round * 15 + 200}px'>
				<div style='background-color: rgb(58, 80, 137);color:white;border:solid 1px rgb(204, 204, 204); border-radius: 6px;' class='px-2 py-2'>
						Standings
				</div>   
				<div style='height:90%' ${this.hc("rows")}  class='px-1 py-1 m-1  overflow-auto border rounded-1 sbkc-fs-9'>
				${inner}
				</div>    
            </div>
                
        `;
	}
}
class StandingListHolder extends SbkC {
	constructor(props) {
		super(props);
		let self = this;
		manager = getManager();
		swiss = manager.props.data;
		this.event.on("create", function () { });
	}
	update() {
		this.disposeChild();
		let inner = this.dChild(StandingList, this.props);
		this.h.parent.append(inner.mainElement);
	}
	_create() {
		this.html =
			/*html*/
			`
              <div ${this.hc("parent")} class='overflow-auto'>
                  ${this.child(StandingList)}
              </div>
              
          `;
	}
}

export { StandingListHolder as StandingList };
