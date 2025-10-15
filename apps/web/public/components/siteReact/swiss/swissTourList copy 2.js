

rc.swiss.tourList={}

rc.swiss.Test = class extends rc.SbkComp {
    constructor(type) {
        super();
        let self = this;
        this.tours = null;
        this.mainData = 1;
        $(() => {
            socketIoFuncs.emitObj({ rout: 'swiss', signal: 'test', room: true, ack: (data) => { self.updateServerData(data) } })
            // socket.on('updateTestData', () => {
            //     socketIoFuncs.emitOnce({ rout: 'swiss', signal: 'test', ack: updateServerData })
            //     return
            // })
            // function updateServerData(data) {
            //     console.log('data', data);
            //     self.mainData = data;
            //     self.updateServerData();
            // }
            socket.on('newTestData', (data) => { self.updateServerData(data) })
        })

    }
    updateServerData(data) {
        
        this.mainData = data;
        this.render();
    }

    _createComp() {
        let el = rc.d.createElement('div');
        el.innerText = this.mainData;
        this.mainElement = el;
        return this.mainElement;
    }
}

///
rc.swiss.roundNumber = class extends rc.SbkComp {
    constructor(tour) {
        super();
        this.mainData = 1;
        let self = this;
        this.tour = tour;
    }
    _createComp() {
        let el = rc.d.createElement('span');
        el.innerText = ` ${this.tour.maxRound} Rounds Swiss`;
        if (this.tour.round > 0) {
            el.innerText = `${this.tour.round} /` + el.innerText
        }
        this.mainElement = el;
        return this.mainElement;
    }
}
rc.swiss.players = class extends rc.SbkComp {
    constructor(tour) {
        super();
        this.mainData = tour;
        let self = this;
        this.tour = tour;
        this.playersCount = this.mainData.players.length;
        // $(() => {
        //     socketIoFuncs.emit(
        //         'swiss',
        //         'join',
        //         ()=> { return {room:'playersCountInTour',tourId:this.tour._id} } 
        //     )
        //     // socket.on('swiss-playersCountInTour',(data)=>{ self.updateServerData(data)})
        //     socket.on('swiss-'+'update',()=>{ self.getServerData(); })
        // })
    }
    getServerData(){
        let self= this;
        socketIoFuncs.emit('swiss', 'playersCountInTour',  ()=> { return {tourId:self.tour._id} }  , (data)=> { self.updateServerData(data) });
    }
    updateServerData(data) {
        console.log('',data);
        if(data.tourId != this.tour._id) return;
        this.playersCount = data.playersCount;
        // this.mainElement.innerText = ` ${this.playersCount}`;
        this.render();
    }
    _createComp() {
        let el = rc.d.createElement('span');                           
        el.innerText = ` ${this.playersCount}`;
        this.mainElement = el;
        return this.mainElement;
    }
}

rc.swiss.SwissRow = class extends rc.SbkComp {
    constructor(tour) {
        super();
        let self = this;
        this.mainData = tour;
        this.time = sbkTimer.getTimeParts(tour.gameDuration)
    }
    getWhenCreated(){
        let createdTime = parseInt((Date.now() -  this.mainData.registerTime)/1000);
        let years = parseInt(createdTime/(60*60*24*30*12));
        let months =  parseInt(createdTime/(60*60*24*30));
        let days =  parseInt(createdTime/(60*60*24));
        let hours =  parseInt(createdTime/(60*60));
        let minutes =  parseInt(createdTime/60);
        if(years > 0) return this.whenCreatedString(years,'year');
        if(months > 0) return this.whenCreatedString(months,'month');
        if(days > 0) return this.whenCreatedString(days,'day');
        if(hours > 0) return this.whenCreatedString(hours,'hour');
        if(minutes > 0) return this.whenCreatedString(minutes,'minute');
        if(createdTime >= 0) return this.whenCreatedString(createdTime,'second');
    }
    whenCreatedString(time,type){
        let end = '';
        if(time>1) end = 's';
        return time +' '+ type + end;
    }
    _createComp() {
        let whenCreated = this. getWhenCreated();
        let elCss =  /*html*/
            `
            border-width: 1px;
            border-color: rgb(217 217 217);
            border-style: solid;
            padding-top: clamp(0.1rem, 0.8vw, 8rem);
            padding-bottom: clamp(0.1rem, 0.8vw, 8rem);
        `;
        let el = rc.creatEl({
            type: 'div',
            style: elCss,
            class: 'container-fluid d-flex align-items-center m-0 w-100',
            comps: { 
                roundNumber: new rc.swiss.roundNumber(this.mainData),
                playersCount:new rc.swiss.players(this.mainData)
             },
            html: /*html*/
                `
                <div class=' d-flex justify-content-center align-items-center p-0' style= " width: ${dataCreator.clampBuilder(9, 7, 7)}">
                    ${ejsDesign.gameTypeIcon(timeControllLogo.tour(this.mainData), 75)}
                </div>
                <div class='px-2 px-lg-4' style= " width: ${dataCreator.clampBuilder(45, 55, 55)}" >
                    <div class='w-100 mt-1 d-flex flex-column justify-content-start'>
                        <a href="/swiss/tournament/${this.mainData._id}"  class='my-0 w-100 ' style= " color: ${dataCreator.getColor('primary')}; font-size: clamp(0.7rem, 1.7vw, 1.7rem)">${this.mainData.title}</a>
                        <div class=' w-100  p-0' style= " marginTop: '-1'px''">
                            <span class='' style= " font-size: 'clamp(0.6rem, 1.2vw, 1.2rem)', fontWeight: 70">
                                By:
                            </span>
                            <span class='' style= " color:${dataCreator.getColor('primary')}; font-size: clamp(0.5rem, 1vw, 1rem)">
                                Tournament Creator
                            </span>
                        </div>

                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(30, 27, 27)};font-size: clamp(0.5rem, 1.1vw, 1.1rem); font-weight: 70">
                    <div class='mt-0 w-100  p-0 d-flex flex-column justify-content-start' >
                        <span class= '' rcTemplate='roundNumber'>
                        
                        </span>
                        <span class='' >
                        ${this.time.stringify}+${this.mainData.extraTime > 0 ? this.mainData.extraTime + 's' : ''} . ${timeControllLogo.tour(this.mainData)} . Rated
                        </span>
                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(16, 22, 22)}; font-size: clamp(0.4rem, 1vw, 1rem)">
                    <div class='mt-0 w-100  pe-1 d-flex flex-column align-items-end' >
                        <span  >
                        ${whenCreated} ago
                        </span>
                        <span  >
                            <span>
                                <img class='pb-1'  src='/public/img/participants.png' style= " width: ${dataCreator.clampBuilder(1, 2.2, 1.8)}">
                            </span>
                            <span class='ms-1 mt-4'  style= " font-size: clamp(0.5rem, 1.2vw, 1.2rem);color:dataCreator.getColor('primary'),font-weight:600" rcTemplate='playersCount'>

                            </span>            
                        </span>
                    </div>
                </div>
            `
        })
        this.mainElement = el;
        return this.mainElement;
    }
}
// ${this.time.hours>0 ? this.time.hours + ':':''}${this.time.mins>0 ? this.time.mins+':' :''}${this.time.secs>0 ? ''+this.time.secs :''}+0 . ${timeControllLogo.tour(this.mainData)} . Rated
rc.swiss.ToursList = class extends rc.SbkComp {
    constructor(props) {
        super();
        console.log('',props);
        let self = this;
        this.tours = null;
        this.room = props.type;
        this.serverSignal ='swiss-' + this.room;
        $(() => {
            socketIoFuncs.emit(
                'swiss',
                'join',
                ()=> { return {room:this.room} } ,
                ()=> { self.getServerData() } 
            )
            // socket.on(this.serverSignal,(data)=>{ self.updateServerData(data)});
            socket.on('swiss-'+'update',()=>{ self.getServerData(); })
        })
    }
    getServerData(){
        let self= this;
        socketIoFuncs.emit('swiss', this.room, null , (data)=> { self.updateServerData(data) });
    }
    updateServerData(data) {
        console.log('',this.serverSignal,data);
        this.tours = data.reverse();
        this.mainData = this.tours;
        this.render();
    }
    _createComp() {
        if (this.tours.length == 0) {
            let el = rc.d.createElement('div');
            el.innerText = 'There Is No Data';
            el.classList.add('mx-auto', 'text-center','mt-3','fs-5')
            this.mainElement = el;
            return this.mainElement;
        }
        else {
            let el = rc.d.createElement('div');
            for (let i = 0; i < this.tours.length; i++) {
                const tour = this.tours[i];
                let tComp = new rc.swiss.SwissRow(tour);
                tComp.render(el, true);
            }
            this.mainElement = el;
            return this.mainElement;
        }
    }
}


