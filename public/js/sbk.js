// const e = require("cors");

function sendJSON(obj, url, on = null) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (on) {
                on(this.responseText);
            }
        }
    };
    var data = JSON.stringify(obj);
    xhr.send(data);
}
let display = {
    // isInPersonChiled:false,
    show: function (id) {
        document.getElementById(id).classList.remove('d-none');
    },
    hide: function (id) {
        document.getElementById(id).classList.add('d-none');
    },
    toggle: function (id) {
        let x = document.getElementById(id);
        console.log(x);
        if (!x.classList.contains('d-none')) {
            display.hide(id);
            return;
        }
        if (x.classList.contains('d-none')) {
            display.show(id);
            return;
        }
        display.hide(id);
    },
};
let sbkTimer = {
    getTimeParts: function (secs) {
        if (secs < 1) {
            secs = 0;
        }
        let parts = {};
        parts.secs = parseInt(secs % 60);
        let minuts = parseInt((secs - parts.secs) / 60);
        parts.mins = minuts % 60;
        parts.hours = parseInt(minuts / 60);
        parts.stringify = parts.hours + 'h' + ':' + parts.mins + 'm' + ':' + parts.secs + 's';
        parts.stringify = parts.stringify.replace(/0h:/g, '')
        // parts.stringify = parts.stringify.replace(/0m:/g, '')
        // parts.stringify = parts.stringify.replace(/:0s/g, ':0')

        parts.simpleStr = parts.stringify.replace(/h/g, '')
        parts.simpleStr = parts.simpleStr.replace(/m/g, '')
        parts.simpleStr = parts.simpleStr.replace(/s/g, '')
        return parts;
    }
}
class MyEvent {
    constructor() {
        this._events = {};
    }
    on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(listener);
    }

    removeListener(name, listenerToRemove) {
        if (!this._events[name]) {
            // throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
            return;
        }

        const filterListeners = (listener) => listener !== listenerToRemove;

        this._events[name] = this._events[name].filter(filterListeners);
    }

    emit(name, data) {
        if (!this._events[name]) {
            // throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
            return;
        }
        this._events[name].forEach(f => f(data));
    }
}
class Fen {
    constructor(str) {
        var parts = str.split(' ');
        this.strFen = str;
        this.position = parts[0];
        this.side = parts[1];
        this.castling = parts[2];
        this.enp = parts[3];
        this.capOrPawnCounter = parts[4];
        this.moves = parts[5];
    }
}
let userObjectUt = {
    toLogin: function () {
        if (userName) return;
        window.location.href = '/user/login'
    }
}
var timeControllLogo = {
    timeControll: function (mainTime, timeIncresment = 0) {
        let totalTime = mainTime + 40 * timeIncresment;
        if (totalTime < 179) return 'bullet';
        if (totalTime < 479) return 'blitz';
        if (totalTime < 1499) return 'rapid';
        if (totalTime > 1500) return 'classic';
        // if (totalTime < 179) return 'correspond';
    },
    tour: function (tour) {
        let totalTime = tour.gameDuration;
        return timeControllLogo.timeControll(totalTime, tour.extraTime);
    },
    gameTimeControll: function (game) {
        let totalTime = game.gameTimeMins * 60 + game.gameTimeSecs;
        return timeControllLogo.timeControll(totalTime, game.timeIncresment);
    },
    getClassListFromType(type) {
        switch (type) {
            case 'bullet':
                return ["fas", "fa-space-shuttle"]
            case 'blitz':
                return ["fas", "fa-fire"]
            case 'rapid':
                return ["fas", "fa-rabbit"]
            case 'classic':
                return ["fas", "fa-turtle"]
        }
    },
    creatGameTimeLogo: (game, size = 14) => {
        let logo = document.createElement('i');
        let gameType = timeControllLogo.gameTimeControll(game);
        logo.classList.add(...timeControllLogo.getClassListFromType(gameType));
        logo.style.fontSize = size + 'px'
        return logo;
    },

}
// todo remove this function to under Object
function registerEmmit(channel, signal, getDataFunc, ack = () => null) {
    if (!getDataFunc) getDataFunc = () => { };
    $(document).ready(function () {
        socket.emit(channel, { signal, data: getDataFunc() }, ack);
        socket.on(channel + '-' + signal, (data) => {
            socket.emit(channel, { signal, data: getDataFunc() }, ack);
        });
        socket.io.on('reconnect', function () {
            socket.emit(channel, { signal, data: getDataFunc() }, ack);
        });
    })
}
const socketIoFuncs = {
    // join: (rout, room, data) => {
    //     // $(document).ready(function () {
    //         socket.emit(rout, { signal: 'join', data: { room, ...{ data } } });
    //         socket.io.on('reconnect', () => {
    //             socket.emit(rout, { signal: 'join', data: { room, ...{ data } } });
    //         });
    //     // })

    // },
    // join: (rout,room,joinObj) => {
    //     //joinObj = {room,ack}
    //     let joinData= {} ; 
    //     let ack =  ()=> {  }; 
    //     if(joinObj.data) joinData = joinObj.data;
    //     if(joinObj.ack) ack = joinObj.ack;

    //     // $(document).ready(function () {
    //         socket.emit(rout, { signal: 'join', data: { room , ...{ joinData } } },ack);
    //         socket.io.on('reconnect', () => {
    //             socket.emit(rout, { signal: 'join', data: { room, ...{ joinData } } });
    //         });
    //     // })

    // },

    emitOnce: (channel, signal, getDataFunc, ack) => {
        $(document).ready(function () {
            if (!getDataFunc) getDataFunc = () => null;
            if (typeof getDataFunc === 'object') {
                let obj = getDataFunc;
                getDataFunc = () => { return obj };
            }
            if (!ack) ack = () => null;
            socket.emit(channel, { signal, data: getDataFunc() }, ack);
        })
    },
    emit: (channel, signal, getDataFunc, ack) => {
        $(document).ready(function () {
            // if (!getDataFunc) getDataFunc = () => null;
            // if (!ack) ack = () => null;
            // socket.emit(channel, { signal, data: getDataFunc() }, ack);
            socketIoFuncs.emitOnce(channel, signal, getDataFunc, ack)
            socket.io.on('reconnect', listener);
            function listener(data) {
                // socket.io.removeAllListeners("reconnect");
                socketIoFuncs.emitOnce(channel, signal, getDataFunc, ack)
            }
            socket.io.off("reconnect", listener);
        })
    },
    emitObj: (eData) => {
        socketIoFuncs.emitOnce(eData);
        socket.io.on('reconnect', function () {
            socketIoFuncs.emitOnce(eData);
        });
    }
    ,
    // emitOnce: (eData) => {
    //     // eData = {channel,signal,room,getDataFunc,ack}
    //         let data = {};
    //         let ack = () => { return{} };
    //         let room = false;
    //         if (eData.room) room = true;
    //         if (eData.getDataFunc) data = eData.getDataFunc();
    //         if (eData.ack) ack = eData.ack
    //         socket.emit(eData.rout,
    //             {
    //                 signal:eData.signal,
    //                 data: {
    //                     joinRoom: room,
    //                     ...data
    //                 }
    //             },
    //             ack
    //         )
    // },
    // joinEmit:(eData)=>{
    //     $(document).ready(function () {
    //         joinEmitOnce(eData)
    //         socket.io.on('reconnect', function () {
    //             joinEmitOnce(eData);
    //         });
    //     })
    // }
    // ,

}
class TblCreate {
    constructor(parentId, headers) {
        this.headers = headers;
        this.parent = document.getElementById(parentId);
        this.creat();
    }
    creat() {
        this.parent.innerHTML = '';
        this.table = document.createElement('table');
        this.table.classList.add('table');
        this.tableHeader = document.createElement('thead')
        this.table.append(this.tableHeader);
        this.tableHeaderRow = document.createElement('tr')
        this.tableHeader.append(this.tableHeaderRow);
        // number Part 
        this.num = document.createElement('th');
        this.num.scope = 'col';
        this.num.innerText = '#';
        this.tableHeaderRow.append(this.num)
        for (let j = 0; j < this.headers.length; j++) {
            const col = this.headers[j];
            let th = document.createElement('th')
            th.innerText = col;
            this.tableHeaderRow.append(th)
        }
        this.parent.append(this.table)
        this.body = document.createElement('tbody')
        this.table.append(this.body)
    }
    creatInside(arrayOfObj) {
        this.body.innerHTML = '';
        for (let i = 0; i < arrayOfObj.length; i++) {
            const obj = arrayOfObj[i];
            let row = document.createElement('tr');
            let inner = `<th scope="row">${i + 1}</th>`;
            for (let j = 0; j < this.headers.length; j++) {
                const col = this.headers[j];
                console.log('obj[col]', obj[col]);
                inner += `
                        <td>${obj[col]}</td>
                    `
            }
            row.innerHTML = inner
            this.body.append(row)
        }
    }
}
