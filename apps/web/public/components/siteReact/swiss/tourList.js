import { SimpleText } from "../designs/loadings.js";

class SwissRow extends SbkC {
    constructor(props) {
        super(props);
        let self = this;
        this.time = sbkTimer.getTimeParts(this.props.data.tour.gameDuration);
        // todo update by self 
    }
    playersCount() {
        this.h.playersCount.innerText = this.props.data.tour.players.length;
    }
    getWhenCreated(t) {
        // let time = parseInt((Date.now() - this.props.registerTime) / 1000);
        let time = Math.floor(t / 1000);
        time = Math.abs(time)
        let years = Math.floor(time / (60 * 60 * 24 * 30 * 12));
        let months = Math.floor(time / (60 * 60 * 24 * 30));
        let days = Math.floor(time / (60 * 60 * 24));
        let hours = Math.floor(time / (60 * 60));
        let minutes = Math.floor(time / 60);
        let parts = {};
        if (years >= 1) return { num: years, type: 'year' };
        if (months >= 1) return { num: months, type: 'month' };
        if (days >= 1) return { num: days, type: 'day' };
        if (hours >= 1) return { num: hours, type: 'hour' };
        if (minutes >= 1) return { num: minutes, type: 'minute' };
        return { num: time, type: 'second' };


        // if(years >= 1 ) return this.whenCreatedString(years,'year');
        // if(months >= 1) return this.whenCreatedString(months,'month');
        // if(days >= 1) return this.whenCreatedString(days,'day');
        // if(hours >= 1) return this.whenCreatedString(hours,'hour');
        // if(minutes >= 1) return this.whenCreatedString(minutes,'minute');
        // if(time >= 0) return this.whenCreatedString(time,'second');
    }
    getTimingStr() {
        let t = this.props.data.tour.rdStartTimes[0] - Date.now();
        if (!t) t = 30000;
        console.log(this.props.data.tour, t);

        let strObj = {};
        strObj.started = t < 0 ? true : false;
        console.log('started', strObj.started);

        if (!strObj.started) {
            strObj = this.getWhenCreated(parseInt(t));

            strObj.startStr = 'in';
            strObj.endStr = '';
        } else {
            strObj = this.getWhenCreated(parseInt(t));
            strObj.startStr = '';
            strObj.endStr = 'ago';
        }
        if (strObj.num > 1) strObj.type += 's';
        let str = strObj.startStr + ' ' + strObj.num + ' ' + strObj.type + ' ' + strObj.endStr;
        console.log("🚀 ~ file: tourList.js ~ line 41 ~ SwissRow ~ getTimingStr ~ strObj.started", strObj, str)
        return str;
    }
    // whenCreatedString(time,type , ){
    //     let end = '';
    //     if(time>1) end = 's';
    //     return time +' '+ type + end;
    // }
    _create() {
        let whenCreated = this.getTimingStr();
        console.log(this, whenCreated)
        let elCss =  /*html*/
            `
            border-width: 1px;
            border-color: rgb(217 217 217);
            border-style: solid;
            padding-top: clamp(0.1rem, 0.8vw, 8rem);
            padding-bottom: clamp(0.1rem, 0.8vw, 8rem);
        `;
        if (this.props.data.theme == 'dark') {
            elCss += 'background-color: rgb(240, 238, 225);';
        }
        elCss = elCss.replace(/\r|\n/g, '')
        this.html =  /*html*/
            `
            <div  style='${elCss}' class='d-flex dir-ltr'>
                <div class=' d-flex justify-content-center align-items-center p-0' style= " width: ${dataCreator.clampBuilder(9, 7, 7)}">
                 ${ejsDesign.gameTypeIcon(timeControllLogo.tour(this.props.data.tour), 75)}
                </div>
                <div class='px-2 px-lg-4 d-flex  justify-content-start' style= "width: ${dataCreator.clampBuilder(45, 55, 55)}" >
                    <div class=' mt-1 d-flex flex-column justify-content-start'>
                        <a href="/swiss/tournament/${this.props.data.tour._id}"  class='my-0 w-100 ' style= " color: ${dataCreator.getColor('primary')}; font-size: clamp(0.7rem, 1.7vw, 1.7rem)">${this.props.data.tour.title}</a>
                        <div class=' w-100  p-0 text-start' style= " margin-top: -6px">
                            <span class='' style= " font-size: clamp(0.6rem, 1.2vw, 1.2rem); font-weight: 70">
                                By:
                            </span>
                            <span class='' style= " color:${dataCreator.getColor('primary')}; font-size: clamp(0.5rem, 1vw, 1rem)">
                                ${this.props.data.tour.creator.charAt(0).toUpperCase() + this.props.data.tour.creator.slice(1)}
                            </span>
                        </div>

                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(30, 27, 27)};font-size: clamp(0.5rem, 1.3vw, 1.1rem); font-weight: 70">
                    <div class='mt-0 w-100  p-0 d-flex flex-column text-center' >
                        <span class= ''>
                            ${this.props.data.tour.round}/${this.props.data.tour.maxRound}
                        </span>
                        <span class='' >
                        ${this.time.stringify}+${this.props.data.tour.extraTime > 0 ? this.props.data.tour.extraTime + 's' : ''} . ${timeControllLogo.tour(this.props.data.tour)} . Rated
                        </span>
                    </div>
                </div>
                <div class='' style= " width: ${dataCreator.clampBuilder(16, 22, 22)}; font-size: clamp(0.4rem, 1vw, 1rem)">
                    <div class='mt-0 w-100  pe-3 d-flex flex-column align-items-end' >
                        <span  >
                        ${whenCreated} 
                        </span>
                        <span  >
                            <span>
                                <img class='pb-1'  src='/public/img/participants.png' style= " width: ${dataCreator.clampBuilder(1, 2.2, 1.8)}">
                            </span>
                            <span class='ms-1 mt-4'  style= " font-size: clamp(0.5rem, 1.2vw, 1.2rem);color:dataCreator.getColor('primary'),font-weight:600" ${this.hc('playersCount')}>
                                ${this.props.data.tour.players.length}
                            </span>            
                        </span>
                    </div>
                </div>
            
            </div>
        `;
    }

}
//todo remove this
class SwissRowHolder extends SbkC {
    constructor(props) {
        super(props);
        let self = this;
        this.event.on('create', function () {
            socket.on(self.props.server.fName, (data) => {
                if (data.root == self.props.server.room) {
                    let tour = data.data.tour;
                    if (tour._id == self.props.server.id) {
                        self.update(tour)
                    }

                }
            })
        })
    }
    update(data) {
        this.props.data.tour = data;
        this.disposeChild();
        let inner = this.dChild(SwissRowHolder, this.props);
        this.h.parent.append(inner.mainElement);
    }
    _create() {
        this.html =  /*html*/
            `
            <div ${this.hc('parent')}>
                ${this.child(SwissRow, this.props)}
            </div>
        `;
    }

}
class List extends SbkC {
    constructor(props) {
        super(props);
        let self = this;
        // this.tours = props.data.tours;
        this.event.on('create', function () {
            socket.on(self.props.server.fName, (data) => {
                if (data.root == self.props.server.room) {
                    self.newTours(data.data)
                }
            })
            // todo change update too selective event like create here fo finished and start and ....
            socket.on('update', (data) => {
                if (data.root == self.props.server.room) {
                    self.reCon();
                }
            })

        })
    }
    newTours(tours) {
        //todo compare tours and update news this.props.data.tours
        this.props.data.tours = tours.reverse();
        this.disposeChild();
        if (!this.props.data.tours || this.props.data.tours.length == 0) {
            let html =  /*html*/
                `
                <div class = "mx-auto text-center mt-3 fs-5">
                    There Is No Data
                </div>
            `;
            SbkC.setHtml(this.h.parent, html)
            return;
        }
        let inner = '';
        for (let i = 0; i < this.props.data.tours.length; i++) {
            const tour = this.props.data.tours[i];
            let theme = 'light';
            if (i % 2 == 1) theme = 'dark';
            inner = this.dChild(SwissRowHolder, {
                data: {
                    tour, theme,
                },
                server: {
                    root: 'swiss',
                    fName: 'tour',
                    id: tour._id
                }
            })
            this.h.parent.append(inner.mainElement);
        }

    }
    tourData(tourData) {
        // 
        let index = this.props.data.tours.findIndex((t) => t._id == tourData._id);
        if (index > -1) {
            this.props.data.tours[index] = tourData;
            this._render();
            return true;
        }
        return false;
    }
    removeTour(tour) {
        this.props.data.tours = this.props.data.tours.filter((t) => t._id != tour._id);
        this.mainData = this.props.data.tours;
        this._render();
    }
    newTour(newTour) {
        let index = this.props.data.tours.findIndex((t) => t._id == newTour._id);
        if (index > -1) {
            return false;
        }
        // this.dispose();
        this.props.data.tours = this.props.data.tours.reverse();
        this.props.data.tours.push(newTour);
        this.props.data.tours = this.props.data.tours.reverse();
        this.mainData = this.props.data.tours;
        this._createComp();
        return true;
    }
    updateNewData(data) {

        this.props.data.tours = data.reverse();
        this._render();
    }
    _create() {

        this.html =  /*html*/
            `
                <div ${this.hc('parent')}>
                    ${this.child(SimpleText)}
                </div>
               
        `;
    }
}



export { List }
