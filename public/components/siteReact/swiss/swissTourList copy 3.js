

rc.swiss.tourList={};

rc.swiss.tourList.SwissRow = class extends rc.SbkComp {
    constructor(props) {
        super();
        let self = this;
        this.mainData = props.tour;
        this.theme = props.theme;
        this.time = sbkTimer.getTimeParts(this.mainData.gameDuration)
    }
    getWhenCreated(time){
        // let createdTime = parseInt((Date.now() -  this.mainData.registerTime)/1000);
        let years = parseInt(time/(60*60*24*30*12));
        let months =  parseInt(time/(60*60*24*30));
        let days =  parseInt(time/(60*60*24));
        let hours =  parseInt(time/(60*60));
        let minutes =  parseInt(time/60);
        let parts = {};
        if(years >= 1 ) return {num:years , type:'year'}; 
        if(months >= 1) return {num:months , type:'month'};  
        if(days >= 1) return {num:days , type:'day'};  
        if(hours >= 1) return {num:hours , type:'hour'};  
        if(minutes >= 1) return {num:minutes , type:'minute'};  
        if(time >= 0) return {num:time , type:'second'};  


        // if(years >= 1 ) return this.whenCreatedString(years,'year');
        // if(months >= 1) return this.whenCreatedString(months,'month');
        // if(days >= 1) return this.whenCreatedString(days,'day');
        // if(hours >= 1) return this.whenCreatedString(hours,'hour');
        // if(minutes >= 1) return this.whenCreatedString(minutes,'minute');
        // if(time >= 0) return this.whenCreatedString(time,'second');
    }
    getTimingStr(){
        let t = Date.now() -  this.mainData.startTime;
        let strObj = {};
        strObj.started = t < 0 ? true : false;
        if(strObj.started){
            strObj = this.getWhenCreated(parseInt((Date.now() -  this.mainData.registerTime)/1000));
            strObj.startStr = 'in';
            strObj.endStr = '';
        }else{
            strObj = this.getWhenCreated(parseInt(t));
            strObj.startStr = '';
            strObj.endStr = 'ago';
        }
        if(strObj.num>1) strObj.type += 's';
        return strObj.startStr +' ' + strObj.num + ' ' + strObj.type + ' ' + strObj.endStr;
    }
    // whenCreatedString(time,type , ){
    //     let end = '';
    //     if(time>1) end = 's';
    //     return time +' '+ type + end;
    // }
    _createComp() {
        let whenCreated = this.getTimingStr();
        let elCss =  /*html*/
        `
            border-width: 1px;
            border-color: rgb(217 217 217);
            border-style: solid;
            padding-top: clamp(0.1rem, 0.8vw, 8rem);
            padding-bottom: clamp(0.1rem, 0.8vw, 8rem);
        `;
        if(this.theme =='dark'){
            elCss += 'background-color: rgb(240, 238, 225);';
        }
        this.html =  /*html*/
        `
            <div  style='${elCss}'>
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
                                ${this.mainData.creator.charAt(0).toUpperCase()+this.mainData.creator.slice(1)}
                            </span>
                        </div>

                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(30, 27, 27)};font-size: clamp(0.5rem, 1.1vw, 1.1rem); font-weight: 70">
                    <div class='mt-0 w-100  p-0 d-flex flex-column justify-content-start' >
                        <span class= ''>
                            ${this.mainData.round}
                        </span>
                        <span class='' >
                        ${this.time.stringify}+${this.mainData.extraTime > 0 ? this.mainData.extraTime + 's' : ''} . ${timeControllLogo.tour(this.mainData)} . Rated
                        </span>
                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(16, 22, 22)}; font-size: clamp(0.4rem, 1vw, 1rem)">
                    <div class='mt-0 w-100  pe-1 d-flex flex-column align-items-end' >
                        <span  >
                        ${whenCreated} 
                        </span>
                        <span  >
                            <span>
                                <img class='pb-1'  src='/public/img/participants.png' style= " width: ${dataCreator.clampBuilder(1, 2.2, 1.8)}">
                            </span>
                            <span class='ms-1 mt-4'  style= " font-size: clamp(0.5rem, 1.2vw, 1.2rem);color:dataCreator.getColor('primary'),font-weight:600" >
                                ${this.mainData.players.length}
                            </span>            
                        </span>
                    </div>
                </div>
            
            </div>
        `;

        
        // let el = rc.creatEl({
        //     type: 'div',
        //     style: elCss,
        //     class: 'container-fluid d-flex align-items-center m-0 w-100',
        //     comps: { 
        //         // roundNumber: new rc.swiss.roundNumber(this.mainData),
        //         // playersCount:new rc.swiss.players(this.mainData)
        //      },
        //     html: /*html*/
        //         `
                
        //     `
        // })
        // this.mainElement = el;
        // return this.mainElement;
    }
}

// function (params) {
    
    
    // var myTourDiv=document.getElementById('mainDiv-myTours');
    // let myTours = new rc.swiss.tourList.MyOpens();
    // // let myTours = new rc.swiss.ToursList({type:'myOpens'});
    // myTours.render(myTourDiv);
// } 
rc.swiss.tourList.List  = class extends rc.SbkComp {
    constructor(props) {
        super();
        // let self = this;
        // this.tours = props.tours;
        // this.room = 'myOpens';
        // this.serverSignal ='swiss-' + this.room;
    }
    // getServerData(){
    //     let self= this;
    //     socketIoFuncs.emit('swiss', this.room, null , (data)=> { self.updateServerData(data) });
    // }
    tourData(tourData) {
        // 
        let index =  this.tours.findIndex((t)=>  t._id ==  tourData._id);
        if(index> -1){
            this.tours[index] = tourData;
            this.mainData = this.tours;
            this.render();
            return true;
        }
        return false;
    }
    removeTour(tour){
        this.tours = this.tours.filter((t)=>  t._id !=  tour._id);
        this.mainData = this.tours;
        this.render();
    }
    newTour(newTour) {
        // console.log('',this.serverSignal,data);
        let index =  this.tours.findIndex((t)=>  t._id ==  newTour._id);
        if(index > -1){
            return false;
        }
        this.tours = this.tours.reverse();
        this.tours.push(newTour);
        this.tours = this.tours.reverse();
        this.mainData = this.tours;
        this.render();
        return true;
    }
    updateNewData(data) {
        // console.log('',this.serverSignal,data);
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
                let theme = '';
                if(i%2 == 1) theme='dark';
                let tComp = new rc.swiss.tourList.SwissRow({theme,tour});
                tComp.render(el, true);
            }
            this.mainElement = el;
            return this.mainElement;
        }
    }
}
// rc.swiss.tourList.list = class extends rc.SbkComp {
//     constructor(props) {
//         super();
//         console.log('',props);
//         let self = this;
//         this.tours = null;
//         this.room = props.type;
//         this.serverSignal ='swiss-' + this.room;
//         $(() => {
//             socketIoFuncs.emit(
//                 'swiss',
//                 'join',
//                 ()=> { return {room:this.room} } ,
//                 ()=> { self.getServerData() } 
//             )
//             // socket.on(this.serverSignal,(data)=>{ self.updateServerData(data)});
//             socket.on('swiss-'+'update',()=>{ self.getServerData(); })
//         })
//     }
//     getServerData(){
//         let self= this;
//         socketIoFuncs.emit('swiss', this.room, null , (data)=> { self.updateServerData(data) });
//     }
//     updateServerData(data) {
//         console.log('',this.serverSignal,data);
//         this.tours = data.reverse();
//         this.mainData = this.tours;
//         this.render();
//     }
//     _createComp() {
//         if (this.tours.length == 0) {
//             let el = rc.d.createElement('div');
//             el.innerText = 'There Is No Data';
//             el.classList.add('mx-auto', 'text-center','mt-3','fs-5')
//             this.mainElement = el;
//             return this.mainElement;
//         }
//         else {
//             let el = rc.d.createElement('div');
//             for (let i = 0; i < this.tours.length; i++) {
//                 const tour = this.tours[i];
//                 let tComp = new rc.swiss.SwissRow(tour);
//                 tComp.render(el, true);
//             }
//             this.mainElement = el;
//             return this.mainElement;
//         }
//     }
// }


