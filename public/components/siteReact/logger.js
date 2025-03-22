export class Logger extends SbkC {
   constructor(props) {
      super(props);
      let self = this;
      this.event.on('create', function () {
         socket.on('log', (data) => {
            try {
               console.log('newData-JSON: ', JSON.parse(data.data));
            } catch (error) {
               console.log('newData-String: ', data);
            }
         })
         socket.on('logs', (data) => {
            console.clear()
            let lines = data.data.trim().split('\n');
            self.log = lines
            // self.h.parent.innerText = data.data;
            lines.forEach(l => {
               try {
                  console.log('JSON: ', JSON.parse(l));
               } catch (error) {
                  console.log('String: ', l);
               }

            });
         })
         // self.setName(self.props.data.name);
      });
   }
   setName(name) {

   }
   _create() {
      this.html = /*html*/`
      <div class='' style='height: 100%';>
         <div ${this.hc('parent')} class='overflow-auto' style='height: 500px' >
            xxxxfff
         </div>
      </div>
        
      `;
   }
}