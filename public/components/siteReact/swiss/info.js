import { getManager } from "./tourManager.js";
let manager, swiss;
class Info extends SbkC {
   constructor(props) {
      super(props);
      let self = this;
   }
   _create() {
      let d = new Date(swiss.tour.startTime);
      this.html =  /*html*/
         `
            <div class='mb-3  px-0 '  style = 'border:solid 1px rgb(204, 204, 204); border-radius: 6px;height:1000px;    '>
               <div style='background-color: rgb(58, 80, 137);color:white;font-size:clamp(0.6rem,1.2vw,2rem);border:solid 1px rgb(204, 204, 204); border-radius: 6px;' class='p-3 fs-5'>
               Tournament information
               </div>   
               <div style='height:90%' ${this.hc('rows')}  class='px-1 py-1 m-1  overflow-auto border rounded-1'>
                     <!--
                     <div class='mx-auto mb-4' style='width:90%' >
                           <div style='background-color: rgb(184 187 193);color:white;font-size:clamp(0.6rem,1.2vw,2rem);border:solid 1px rgb(204, 204, 204); border-radius: 6px; height:60px ;'  class='p-3 fs-5  mx-auto mt-4'>
                           
                           </div> 
                     </div>
                     -->
                  <div class='mx-auto px-4' style='width:90%;margin-top:40px'>
                     <div class=' d-flex  align-items-center p-0'>
                        <div>
                           ${ejsDesign.gameTypeIcon(timeControllLogo.tour(swiss.tour), 75)}
                        </div>
                        <div class='fs-1 mx-2 fw-bold'>
                           ${timeControllLogo.tour(swiss.tour)}
                        </div>
                     </div>
                     <div class=' d-flex  align-items-center mt-4'>
                        ${parseInt(swiss.tour.gameDuration / 60)}:${swiss.tour.gameDuration % 60} +
                        ${Math.ceil(swiss.tour.extraTime / 60)} . ${timeControllLogo.tour(swiss.tour)} . Rated
                     </div>
                     <div class=' d-flex  align-items-center mt-1'>
                        ${swiss.tour.maxRound} Rounds .  
                        <span style='color:blue; font-weight:600'>
                             &nbsp Swiss
                        </span>
                     </div>
                     <div class=' d-flex  align-items-center mt-1'>
                        ${swiss.tour.restTime} minutes between rounds
                     </div>
                     <div class=' d-flex  align-items-center mt-1'>
                        Started: ${d.toLocaleString('en-US',
            { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', }) +
         d.toLocaleTimeString('en-US')} 
                     </div>
                     <div class=' my-3'>
                        <span style='color:blue; font-weight:600'>
                              Regulation
                        </span>
                        <div class=' mt-3 border rounded' style='height:500px'>
                        
                        </div>
                     </div>
                  </div>
               </div>    
            </div>
        `;
   }
}
class InfoHolder extends SbkC {
   constructor(props) {
      super(props);
      manager = getManager()
      swiss = manager.props.data;
   }
   update() {
      this.disposeChild();
      let inner = this.dChild(Info);
      this.h.parent.append(inner.mainElement);
   }
   _create() {
      this.html =  /*html*/
         `
              <div ${this.hc('parent')}>
                  ${this.child(Info, this.props, 'rounds')}
              </div>
          `;
   }

}

export { InfoHolder as Info }
