class PopOverName extends SbkC {
      constructor(props) {
            super(props);
            let self = this;
            this.event.on('create', function () {
                  self.setName(self.props.data.name);
            });

      }
      setName(name) {
            if (!name) return;
            let partName = name.slice(0, 9);
            if (name.length > 9) {
                  partName += '..'
            }
            this.h.name.setAttribute('title', name);
            this.h.name.innerText = partName;
            let pop = new bootstrap.Popover(this.h.name);
      }
      _create() {
            this.html =  /*html*/
                  `
                        <span ${this.hc('name')} title="" data-bs-placement="top"  data-bs-toggle="popover" data-bs-trigger="hover focus "   class='w-100' style= "cursor:default " >
                              ${name}
                        </span>
                  
          `;
      }
}

export { PopOverName }