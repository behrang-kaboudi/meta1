rc.swiss={};

// rc.swiss.Test = class  extends rc.SbkComp {
//     constructor(type) {
//         super();
//         let self = this;
//         this.tours = null;
//         this.mainData=1;
//         setInterval(() => {
//             this.mainElement.innerText = Date.now();
//         }, 1000);
//     }
    
//     _createComp(){
//             let el = rc.d.createElement('div');
//             el.innerText='ddssdsdsdsdsdsddssd';
//             this.mainElement = el;
//             return this.mainElement;
//     }
//   }
// rc.creatEl= (elObj)=> {
//     function executeFunctionByName(functionName, context /*, args */) {
//         var args = Array.prototype.slice.call(arguments, 2);
//         var namespaces = functionName.split(".");
//         var func = namespaces.pop();
//         for(var i = 0; i < namespaces.length; i++) {
//           context = context[namespaces[i]];
//         }
//         return context[func].apply(context, args);
//       }
//      let el = rc.d.createElement(elObj.type);
//      if(elObj.style)el.style.cssText = elObj.style;
//      if(elObj.html) el.innerHTML = elObj.html;
//     //  if(elObj.children){
//     //      for (let i = 0; i < elObj.children.length; i++) {
//     //         el.append(elObj.children[i]);
//     //      }
//     //  }
//     // if(elObj.comps){
//         el.classList.add('d-none')
//         document.body.append(el);
//         let placeHolders = document.querySelectorAll("[rcComp]")
//         console.log('sss',placeHolders);
//         for (let i = 0; i < placeHolders.length; i++) {
//             const holder = placeHolders[i];
//             let compName = holder.getAttribute("rcComp");
//             if(!compName)continue;
//             // let tempComp = new Function('mainComp' ,'data', 
//             //  `
//             //     data = JSON.parse(data);
//             //     console.log('sfff',mainComp,data)
//             //     let camp =  new mainComp (data);
//             //     return camp;
//             //  `);
             
//             // let comp = tempComp(holder.getAttribute("rcComp"),holder.getAttribute("rcData"));
//             // 
//             let comp =  eval('new ' + holder.getAttribute("rcComp"),(JSON.parse(holder.getAttribute("rcData"))));
//             // comp = elObj.comps[compName];
//             comp.render(holder);
//             holder.setAttribute('rcComp','')
//         }
//         el.classList.remove('d-none')
//         document.body.removeChild(el);
//     // }

//      let classes = elObj.class.split(' ')
//      let newClasses = [];
//      for (let i = 0; i < classes.length; i++) {
//          let c = classes[i].trim();
//          if(c)newClasses.push(c);
//      }
//      if(newClasses.length>0){
         
//          el.classList.add(...newClasses);
//      }
     
//      return el
// }
// ///
// rc.swiss.RoundNumber = class  extends rc.SbkComp {
//     constructor(tour) {
//         super();
//         this.mainData=1;
//         let self = this;
//         this.tour = tour;
//         console.log('this.tour',this.tour);
//     }
//     _createComp(){
//             let el = rc.d.createElement('span');
//             // if()
//             console.log('',this.tour.maxRound);
//             el.innerText=` ${this.tour.maxRound} Rounds Swiss`;
//             if(this.tour.round>0){
//                 el.innerText= `${this.tour.round} /` + el.innerText
//             }
//             this.mainElement = el;
//             return this.mainElement;
//     }
//   }

// rc.swiss.SwissRow = class  extends rc.SbkComp {
//     constructor(tour) {
//         super();
//         let self = this;
//         this.mainData = tour;
//         this.time = sbkTimer.getTimeParts(tour.gameDuration)
//     }
//     _createComp(){
//         let elCss=  /*html*/
//         `
//             border-width: 1px;
//             border-color: rgb(217 217 217);
//             border-style: solid;
//             padding-top: clamp(0.1rem, 0.8vw, 8rem);
//             padding-bottom: clamp(0.1rem, 0.8vw, 8rem);
//         `;
//         let el = rc.creatEl({
//             type:'div',
//             style:elCss,
//             class:'container-fluid d-flex align-items-center m-0 w-100',
//             // comps:{RoundNumber:new rc.swiss.RoundNumber(this.mainData)},
//             html: /*html*/
//             `
//                 <div class=' d-flex justify-content-center align-items-center p-0' style= " width: ${dataCreator.clampBuilder(9, 7, 7)}">
//                     ${ejsDesign.gameTypeIcon(timeControllLogo.tour(this.mainData),75)}
//                 </div>
//                 <div class='px-2 px-lg-4' style= " width: ${dataCreator.clampBuilder(45, 55, 55)}" >
//                     <div class='w-100 mt-1 d-flex flex-column justify-content-start'>
//                         <a href="/swiss/tournament/${this.mainData._id}"  class='my-0 w-100 ' style= " color: ${dataCreator.getColor('primary')}; font-size: clamp(0.7rem, 1.7vw, 1.7rem)">${this.mainData.title}</a>
//                         <div class=' w-100  p-0' style= " marginTop: '-1'px''">
//                             <span class='' style= " font-size: 'clamp(0.6rem, 1.2vw, 1.2rem)', fontWeight: 70">
//                                 By:
//                             </span>
//                             <span class='' style= " color:${dataCreator.getColor('primary')}; font-size: clamp(0.5rem, 1vw, 1rem)">
//                                 Tournament Creator
//                             </span>
//                         </div>

//                     </div>
//                 </div>
//                 <div class='' style= " width: ${dataCreator.clampBuilder(30, 27, 27)};font-size: clamp(0.5rem, 1.1vw, 1.1rem)', font-weight: 70">
//                     <div class='mt-0 w-100  p-0 d-flex flex-column justify-content-start' >
//                         <span class= '' rcComp='rc.swiss.RoundNumber' rcData = '${JSON.stringify(this.mainData)}' >
                        
//                         </span>
//                         <span class='' >
//                         ${this.time.stringify}+${this.mainData.extraTime>0 ? this.mainData.extraTime+'s':''} . ${timeControllLogo.tour(this.mainData)} . Rated
//                         </span>
//                         <span class= '' rcComp='rc.swiss.Test' rcData = '${JSON.stringify(this.mainData)}' >
                        
//                         </span>
//                     </div>
//                 </div>
//                 <div class='' style= " width: ${dataCreator.clampBuilder(16, 22, 22)}; font-size: clamp(0.4rem, 1vw, 1rem)">
//                     <div class='mt-0 w-100  pe-1 d-flex flex-column align-items-end' >
//                         <span  >
//                         4 minutes ago
//                         </span>
//                         <span  >
//                             <span>
//                                 <img class='pb-1'  src='/public/img/participants.png' style= " width: ${dataCreator.clampBuilder(1, 2.2,1.8)}">
//                             </span>
//                             <span class='ms-1 mt-4'  style= " font-size: clamp(0.5rem, 1.2vw, 1.2rem);color:dataCreator.getColor('primary'),font-weight:600">
//                             ${this.mainData.players.length}
//                             </span>            
//                         </span>
//                     </div>
//                 </div>
//             `
//         })
//         this.mainElement =el;
//         return this.mainElement;
//     }
//   }
// // ${this.time.hours>0 ? this.time.hours + ':':''}${this.time.mins>0 ? this.time.mins+':' :''}${this.time.secs>0 ? ''+this.time.secs :''}+0 . ${timeControllLogo.tour(this.mainData)} . Rated
// rc.swiss.ToursList = class  extends rc.SbkComp {
//     constructor(type) {
//         super();
//         let self = this;
//         this.tours = null;
//         this.type = type;
//         this.tours= null;
//         socketIoFuncs.emit('swiss','myTours',null,  (data)=> {
//                 self.tours= data;
//                 self.mainData = self.tours;
//                 self.updateServerData()
//             }
//         )
//     }
//     updateServerData(){
//         console.log(this.tours);
//         this.render();
//     }
//     _createComp(){
//         if (this.tours.length == 0) {
//             let el = rc.d.createElement('div');
//             el.innerText = 'Register Tournament ';
//             el.classList.add('mx-auto','text-center')
//             this.mainElement =el;
//             return this.mainElement;
//         }
//         else{
//             let el = rc.d.createElement('div');
//             for (let i = 0; i < this.tours.length; i++) {
//                 const tour =  this.tours[i];
//                 let tComp = new rc.swiss.SwissRow(tour);
//                 tComp.render(el,true);
//             }
//             this.mainElement = el;
//             return this.mainElement;
//         }
//     }
//   }




// rc.swiss.SwissRow = (props) => {
//     socketIoFuncs.join('swiss','tourInfo',{tourId:props.tourId});
//     let style={
//         borderWidth: '1px',
//         borderColor: 'rgb(217 217 217)',
//         borderStyle: 'solid',
//         paddingTop: 'clamp(0.1rem, 0.8vw, 8rem)',
//         paddingBottom: 'clamp(0.1rem, 0.8vw, 8rem)',
//     }
//     if(props.theme =='dark'){
//         // style.borderColor= 'rgb(240, 238, 225)';
//         style.backgroundColor= 'rgb(240, 238, 225)';
//     }
//     return (
//         <div  style={style} className='container-fluid d-flex align-items-center  m-0 w-100  m-0'>
//             <div className=' d-flex justify-content-center align-items-center p-0' style={{ width: dataCreator.clampBuilder(9, 7, 7) }} dangerouslySetInnerHTML={rc.cm(ejsDesign.gameTypeIcon('icon',75))}>
                
//             </div>
//             <div className='px-2 px-lg-4' style={{ width: dataCreator.clampBuilder(45, 55, 55), }} >
//  1               <div className='w-100 mt-1 d-flex flex-column justify-content-start'>
//                     <span className='my-0 w-100 ' style={{ color:dataCreator.getColor('primary'), fontSize: 'clamp(0.7rem, 1.7vw, 1.7rem)' }}>Tournament Title</span>
//                     <div className=' w-100  p-0' style={{ marginTop: '-10px' }}>
//                         <span className='' style={{ fontSize: 'clamp(0.6rem, 1.2vw, 1.2rem)', fontWeight: '570' }}>
//                             By:
//                         </span>
//                         <span className='' style={{ color:dataCreator.getColor('primary'), fontSize: 'clamp(0.5rem, 1vw, 1rem)' }}>
//                             Tournament Creator
//                         </span>
//                     </div>

//                 </div>
//             </div>
//             <div className='' style={{ width: dataCreator.clampBuilder(30, 27, 27),fontSize: 'clamp(0.5rem, 1.1vw, 1.1rem)', fontWeight: '570' }}>
//                 <div className='mt-0 w-100  p-0 d-flex flex-column justify-content-start' >
//                     <span className='' >
//                     2 / 5 Rounds Swiss
//                     </span>
//                     <span className='' >
//                     3+0 . Blitz . Rated
//                     </span>
//                 </div>
//             </div>
//             <div className='' style={{ width: dataCreator.clampBuilder(16, 22, 22), fontSize: 'clamp(0.4rem, 1vw, 1rem)'}}>
//                 <div className='mt-0 w-100  pe-1 d-flex flex-column align-items-end' >
//                     <span  >
//                     4 minutes ago
//                     </span>
//                     <span  >
//                         <span>
//                             <img className='pb-1'  src='/public/img/participants.png' style={{ width: dataCreator.clampBuilder(1, 2.2, 1.8)}}></img>
//                         </span>
//                         <span className='ms-1 mt-4'  style={{ fontSize: 'clamp(0.5rem, 1.2vw, 1.2rem)',color:dataCreator.getColor('primary'),fontWeight:"600"}}>
//                         72
//                         </span>            
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }


rc.swiss.Tours = (props)=> {
    const [tours, setTours] = React.useState(null);
    if (!tours) {
        return (
            
            <div>
                xxxxx
            </div>
        )
    }
     
     return (
         <div>
             dsddssd
         </div>
     )
}


  
