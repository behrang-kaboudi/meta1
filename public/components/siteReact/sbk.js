class SbkC {
  constructor(props = {}) {
    let self = this;
    SbkC.evName = 'sbkEvents';
    SbkC.jqHandlerName = 'jq-handler';
    SbkC.childName = 'children';
    this.html = '';
    this.c = {};//this.children
    this.h = {};//jqHandlers
    this.mainElement = null;
    this.props = props;
    if (!props.data) this.props.data = {};
    if (!props.server) this.props.server = {};
    this.setEvent();
    this.event.on('create', function () {
      self.firstCon();
      socket.io.on('reconnect', function () {
        self.reCon();
      });
    })
  }
  firstCon() {
    if (!this.props.server.root) return;
    this.props.server.room = this.props.server.root;
    this.props.server.room += this.props.server.id ? '-' + this.props.server.id : '';
    socket.emit('joinRoom', this.props.server.room);
    if (this.props.server.req) {
      this.emit()
    }
  }
  emit() {
    socket.emit(this.props.server.root, { signal: this.props.server.fName, data: { id: this.props.server.id } })
  }
  reCon() {
    socket.emit('joinRoom', this.props.server.room);
    this.emit()
  }
  static isInPage(node) {
    const rect = node.getBoundingClientRect();
    // let inPar =  (node === document.body) ? false : document.body.contains(node);
    let wh = rect.top != 0 || rect.left != 0 || rect.bottom != 0 || rect.right != 0;
    return wh
  }
  static parenDivStyle = 'margin:0px;padding:0px;'
  static render(obj) {
    let comp = new obj.class(obj.data);
    if (obj.parent) comp.parent = obj.parent;
    comp._createComp();
    // 
    return comp;
  }
  static serverRomes = {};
  static roomNameMaker(obj) {
    let name = JSON.stringify(obj);
    return name
  }

  static setHtml(parent, html) {
    parent.innerHTML = html
    // const sanitizer = new Sanitizer();
    // parent.setHtml(html)
  }
  dispose() {
    this.disposeChild();
    //todo 
    this.html = '';
    this.h = {};
    this.mainElement.remove()
    this.event.emit('dispose');
    if (this.props.server) {
      socket.emit('leaveRoom', this.props.server.root);
    }

  }
  disposeChild() {
    for (const key in this.c) {
      const element = this.c[key];
      element.dispose();
    }
    //todo 
    this.c = {};
    // todo dispose events and joins
  }
  setEvent() {
    this.event = {};
    this.event._events = {};
    this.event.on = (name, listener) => {
      if (!this.event._events[name]) {
        this.event._events[name] = [];
      }
      this.event._events[name].push(listener);
    }
    this.event.removeListener = (name, listenerToRemove) => {
      if (!this.event._events[name]) {
        // throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
        return;
      }
      const filterListeners = (listener) => listener !== listenerToRemove;
      this.event._events[name] = this.event._events[name].filter(filterListeners);
    }
    this.event.emit = (name, data) => {
      if (!this.event._events[name]) {
        // throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
        return;
      }
      this.event._events[name].forEach(f => f(data));
    }
  }
  dChild(className, data = {}, objName = null) {
    if (!objName) objName = 'xxxxxx' + Object.keys(this.c).length + 1;
    this.c[objName] = new className(data);
    this.c[objName]._createComp();
    return this.c[objName]
  }
  child(className, data = {}, objName = null) {
    if (!objName) objName = 'xxxxxx' + Object.keys(this.c).length + 1;
    this.c[objName] = new className(data);
    // this.c[objName].parentModule = this
    let html =  /*html*/
      `
        <div style ='${SbkC.parenDivStyle}' ${SbkC.childName} = '${objName}'>
        </div>
    `;
    return html.trim();
  }
  ec(data) {
    let evText = SbkC.evName + '=';
    evText += JSON.stringify(data);
    return evText;
  }
  hc(name) {
    let jqHandler = SbkC.jqHandlerName + '=' + `'${name}'`;
    return jqHandler;
  }
  _create() { };

  _createComp() {
    let self = this
    this._create();
    this.mainElement = this._creatElement(this.html);
    if (this.parent) {
      SbkC.setHtml(this.parent, '');
      this.parent.append(this.mainElement)
    }
    this.event.emit('create');
  }

  _creatElement(html) {
    html = html.trim();
    let tempParent = document.createElement('div');
    // tempParent.style.cssText = SbkC.parenDivStyle;
    SbkC.setHtml(tempParent, html);
    let self = this;
    let tagsHaveEvent = tempParent.querySelectorAll(`[${SbkC.evName}]`);
    tagsHaveEvent.forEach(tg => {
      let evObj = JSON.parse(tg.getAttribute(SbkC.evName));
      for (const ev in evObj) {
        tg.addEventListener(ev, function (e) {
          self[evObj[ev]](e);
        })
      }
    });
    let tagsHaveHandler = tempParent.querySelectorAll(`[${SbkC.jqHandlerName}]`);
    tagsHaveHandler.forEach(tg => {
      self.h[tg.getAttribute(SbkC.jqHandlerName)] = tg;
    });

    if (Object.keys(this.c).length > 0) {
      let components = tempParent.querySelectorAll(`[${SbkC.childName}]`);
      components.forEach(tg => {
        let compName = tg.getAttribute(SbkC.childName).trim();
        self.c[compName].parent = tg;
        self.c[compName]._createComp();

        tg.replaceWith(tg.childNodes[0])
      });
    }
    tempParent = tempParent.childNodes[0];
    return tempParent;
  }
}
SbkC.funcs = {
  hover: (el, inFunc, OutFunc = () => { }) => {
    el.addEventListener('mouseenter', function (e) {
      inFunc();
    })
    // el.addEventListener('mouseOver', function () {
    //   inFunc();
    // })
    // el.addEventListener('mouseout', function () {
    //   console.log('e2',);
    //   OutFunc();
    // })
    el.addEventListener('mouseleave', function () {
      OutFunc();
    })
  }
}
// let Loader = class {
//   constructor(type) {
//     this.size = type;
//     this.create();
//   }
//   create() {
//     let cssSpinner =  /*html*/
//       `
//           border: 16px solid #f3f3f3;
//           border-radius: 50%;
//           border-top: 16px solid #3498db;
//           width: 90px;
//           height: 90px;
//       `;
//     let spinner = rc.d.createElement('div');
//     spinner.classList.add('mx-auto')
//     spinner.style.cssText = cssSpinner;
//     spinner.animate([
//       { transform: 'rotate(0deg)' },
//       { transform: 'rotate(360deg)' }
//     ],
//       {
//         duration: 1500,
//         iterations: Infinity
//       });
//     this.mainElement = spinner;
//     return this.mainElement;
//   }
// }
// export { Sbk }


