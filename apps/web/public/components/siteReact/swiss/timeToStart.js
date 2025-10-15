import { getManager } from "./tourManager.js";
let manager, swiss;
class TimeToStart extends SbkC {
   constructor() {
      super();
      let self = this;
      manager = getManager()
      swiss = manager.props.data;

      this.countDawnTime = 0;
      this.timer = null; // interval holder
      this.event.on('dispose', function () {
         clearInterval(self.timer)
      })
      this.event.on('create', function () {
         self.setTime();
      })
      // 
   }
   setTourCountDawn(time) {
      let self = this;
      this.countDawnTime = Math.ceil(time / 1000);
      self.setTimerText(sbkTimer.getTimeParts(--this.countDawnTime).simpleStr)
      this.timer = setInterval(() => {
         let timerobj = sbkTimer.getTimeParts(--this.countDawnTime)
         self.setTimerText(timerobj.simpleStr)
         if (this.countDawnTime == 5) {// 5 to go to game
            //todo change
            manager.emit();
         }
         if (this.countDawnTime == 0) {
            clearInterval(self.timer);
            manager.emit();
         }
      }, 1000);
   }
   setTimerText(time, text = null) {
      this.h.time.innerText = time;
      if (text) this.h.text.innerText = text;
   }
   setTime() {
      clearInterval(this.timer);
      if (swiss.tour.status == 'finished') {

         this.setTimerText('', 'Finished')
         return;
      }
      let timeToStart = Number(swiss.tour.rdStartTimes[swiss.tour.rdStartTimes.length - 1]) - Date.now();

      if (swiss.tour.status == 'open') {
         this.setTimerText('', 'Time To Start Tournament:');
         if (timeToStart > 0) {
            this.setTourCountDawn(timeToStart);
         }
         else {
            this.setTimerText('seconds...');
            setTimeout(() => {
               manager.emit();
            }, 3000);
         }
         return;
      }
      if (timeToStart > 1000) {
         this.setTimerText(``, `Next Round In:`);
         this.setTourCountDawn(timeToStart);
      } else {
         this.setTimerText(``, `Round ${swiss.tour.rdStartTimes.length} In Progress`);
      }

   }
   _create() {
      let cssText = 'font-size: clamp(0.6rem,1vw,2.5rem)';
      this.html = /*html*/
         `
               <span class='sbkc-fs-8'>
                  <span class="fw-bold me-1" ${this.hc('text')}>
                  </span>
                  <span class=""  ${this.hc('time')}>
                  </span>
               </span>
               
         `;
   }
}

class TimeToStartHolder extends SbkC {
   constructor() {
      super();
   }
   update() {
      this.disposeChild();
      let inner = this.dChild(TimeToStart, this.props);
      this.h.parent.append(inner.mainElement);
   }
   _create() {

      this.html =  /*html*/
         `
            <div ${this.hc('parent')}>
                ${this.child(TimeToStart, this.props)}
            </div>
        `;
   }

}
export { TimeToStartHolder as TimeToStart }