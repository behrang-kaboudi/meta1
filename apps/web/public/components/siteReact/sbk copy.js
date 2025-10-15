$(function () {
  // console.log('keys', SbkC.serverRomes);
  socket.io.on('reconnect', function () {
    for (const key in SbkC.serverRomes) {
      // console.log('keys', SbkC.serverRomes[key]);
      socket.emit('joinRoom', SbkC.serverRomes[key].obj, () => { });
    }
  });

})
class SbkC {
  constructor(props = {}) {
    let self = this;
    this.evName = 'sbkEvents';
    this.jqHandlerName = 'jq-handler';
    this.childName = 'children';
    this.html = '';
    this.c = {};//this.children
    this.h = {};//jqHandlers
    this.mainElement = null;
    this.props = props;

    // this.parent = null;
    // this.parentModule = null;
    // this.root = props.root
    this.setEvent();
    this.event.on('render', function () {
      self.rendered = true;
      let keys = Object.keys(self.c);
      keys.forEach(k => {
        self.c[k].event.emit('render');
      });
    })
  }
  static render(obj) {
    let comp = new obj.class(obj.data);
    if (obj.parent) comp.parent = $(obj.parent);
    comp._createComp();
    // if (this.parent) {
    //   $(this.parent).html('');
    //   $(this.parent).append(mainElement2);
    // }
    // _createComp
    // comp.parent.html('');
    // comp.parent.append(comp.mainElement);
    comp.event.emit('render');
    return comp;
  }
  static serverRomes = {};
  static roomNameMaker(obj) {
    let name = JSON.stringify(obj);
    return name
  }
  joinRome(obj) {

    let roomName = SbkC.roomNameMaker(obj);

    this.event.on('dispose', function () {
      if (roomName in SbkC.serverRomes)
        if (--SbkC.serverRomes[roomName].count == 0) {
          delete SbkC.serverRomes[roomName];
          socket.emit('leaveRoom', obj)
        }
    })
    SbkC._joinRoom(obj);
    this.event.on('create', function () {
      SbkC._joinRoom(obj);
    })
  }
  static _joinRoom(obj) {
    let roomName = SbkC.roomNameMaker(obj);
    if (roomName in SbkC.serverRomes) {
      ++SbkC.serverRomes[roomName].count;
      return;
    }

    SbkC.serverRomes[roomName] = {
      count: 1,
      obj
    }

    socket.emit('joinRoom', obj, () => { })
  }


  static getData(root, fname, ack, sendData = {}) {
    if (!ack) ack = () => { };
    socket.emit(root, { signal: fname, data: sendData }, (data) => { ack(data); })
    socket.io.on('reconnect', function () {
      socket.emit(root, { signal: fname, data: sendData }, (data) => { ack(data); })
    });
  }
  dispose() {
    for (const key in this.c) {
      const element = this.c[key];
      element.dispose();
    }
    //todo 
    this.html = '';
    this.c = {};
    this.h = {};
    this.mainElement = null;
    // this.parentModule = null;
    this.event.emit('dispose');
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
  dHtml(html, parent = null, objName = null) {
    if (!objName) objName = 'xxxxxx' + Object.keys(this.c).length + 1;
    this.c[objName] = new SbkC({ parent });
    this.c[objName].html = html;
    this.c[objName].parent = this.h[parent];
    this.c[objName].mainElement = this.c[objName]._creatElement(this.c[objName].html);
    if (this.c[objName].parent) {
      $(this.c[objName].parent).append(this.c[objName].mainElement);
      // this.event.emit('render');
    }
    let el = $(document).find(this.c[objName].mainElement)
    // console.log('el', el);
    // el._createComp();
    // // let el = this._creatElement(html);
    // if (parent) this.h[parent].append(el);
    return this.c[objName];
  }
  dChild(className, data = {}, objName = null) {
    if (!objName) objName = 'xxxxxx' + Object.keys(this.c).length + 1;
    this.c[objName] = new className({ data });
    this.c[objName]._createComp();
    return this.c[objName].mainElement;
  }
  child(className, data = {}, objName = null) {
    if (!objName) objName = 'xxxxxx' + Object.keys(this.c).length + 1;
    this.c[objName] = new className(data);
    this.c[objName].parentModule = this
    let html =  /*html*/
      `
        <div class ='xxxx' ${this.childName} = '${objName}'>
        </div>
    `;
    return html.trim();
  }
  // h(key) {
  //   return this.jqHandlers[key];
  // }
  ec(data) {
    let evText = this.evName + '=';
    evText += JSON.stringify(data);
    return evText;
  }
  hc(name) {
    let jqHandler = this.jqHandlerName + '=' + `'${name}'`;
    return jqHandler;
  }
  _create() { };

  _createComp() {
    let self = this
    this.dispose();
    this._create();
    this.mainElement = this._creatElement(this.html);

    if (this.parent) {
      $(this.parent).html('');
      $(this.parent).append(self.mainElement);
    }
    this.event.emit('create');
  }

  _creatElement(html) {
    html = html.trim();
    let tempParent = document.createElement('<div>');
    tempParent.innerHTML = html;
    // html = '<div>' + html;
    // html += '</div>';
    let self = this;
    // let mainElement2 = $.parseHTML(html)[0];
    // let jsEl = mainElement2.get();
    console.log('', tempParent);

    $(tempParent).find(`[${self.evName}]`).each(function (i, els) {
      let el = $(els);
      let evObj = JSON.parse(el.attr(self.evName));
      for (const ev in evObj) {

        el.on(ev, function (e) {
          self[evObj[ev]](e);
        })
      }
    })

    $(tempParent).find(`[${this.jqHandlerName}]`).each(function (i, els) {
      let el = $(els);
      let handlerName = el.attr(self.jqHandlerName);
      self.h[handlerName] = el;
    })
    if (Object.keys(this.c).length > 0) {
      $(tempParent).find(`[${self.childName}]`).each(function (i, els) {
        let el = $(els);
        let compName = el.attr(self.childName).trim();
        self.c[compName].parent = el.parent();
        self.c[compName]._createComp();
      })
    }
    let mainElement3 = $(tempParent).children();
    $(tempParent).replaceWith(mainElement3);
    return mainElement3;

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


