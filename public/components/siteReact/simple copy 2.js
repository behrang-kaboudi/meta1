
rc.SbkComp = class {
  constructor() {
    this.mainElement = null;
    this.mainData = null;
    this.parent = null;
    this._create();
  }
  render(parent = null, append = false) {
    this._create();
    this.html= this.html.trim();
    this.elements = this.creatEl();
    if (this.parent) {
      this.parent.innerHtml = '';
    }
    if (parent) {
      this.parent = parent
    }
    if (!this.parent) return;
    if (!append) {
      this.parent.innerHTML = '';
    }
    // this.parent.append(this.mainElement);
    this.elements.forEach(element => {
      this.parent.append(element);
    });
  }
  _preCreate() {
    let el = rc.d.createElement('div');
    el.classList.add('mt-3')
    this.mainElement = el;
    let loader = new rc.Loader();
    el.append(loader.mainElement);
    // this.mainElement = loader;
    return this.mainElement;
  }
  _create() {
    if (!this.mainData) {
      this._preCreate();
    }
    else {
      this._createComp()
    }

  };
  _createComp() {
  };
  creatEl(){
    // let el = rc.d.createElement(elObj.type);
    // if (elObj.style) el.style.cssText = elObj.style;
    // if (elObj.html) el.innerHTML = elObj.html;
    // el.classList.add(...rc.creatElCssClasses(elObj.class));
    // if (elObj.comps) {
    //   el.classList.add('d-none')
    //   document.body.append(el);
    //   let placeHolders = document.querySelectorAll("[rcTemplate]")
    //   for (let i = 0; i < placeHolders.length; i++) {
    //     const holder = placeHolders[i];
    //     let compName = holder.getAttribute("rcTemplate");
    //     if (!compName) continue;
    //     comp = elObj.comps[compName];
    //     comp.render(holder);
    //     holder.setAttribute('rcTemplate', '')
    //   }
    //   el.classList.remove('d-none')
    //   document.body.removeChild(el);
  
      let el = $.parseHTML( this.html );
    //   let placeHolders = document.querySelectorAll("[rcTemplate]")
    //   console.log('',tags);
    // }
    console.log('',el);
    return el;
  }
}
rc.creatEl = (elObj) => {
  let el = rc.d.createElement(elObj.type);
  if (elObj.style) el.style.cssText = elObj.style;
  if (elObj.html) el.innerHTML = elObj.html;
  el.classList.add(...rc.creatElCssClasses(elObj.class));
  if (elObj.comps) {
    el.classList.add('d-none')
    document.body.append(el);
    let placeHolders = document.querySelectorAll("[rcTemplate]")
    for (let i = 0; i < placeHolders.length; i++) {
      const holder = placeHolders[i];
      let compName = holder.getAttribute("rcTemplate");
      if (!compName) continue;
      comp = elObj.comps[compName];
      comp.render(holder);
      holder.setAttribute('rcTemplate', '')
    }
    el.classList.remove('d-none')
    document.body.removeChild(el);

    // let tags = $.parseHTML( el.innerHTML );
    // let placeHolders = document.querySelectorAll("[rcTemplate]")
    // console.log('',tags);
  }
  return el
}
// rc.creatElCssClasses = (strClass) => {
//   let classes = strClass.split(' ');
//   let newClasses = [];
//   for (let i = 0; i < classes.length; i++) {
//     let c = classes[i].trim();
//     if (c) newClasses.push(c);
//   }
//   return newClasses
// }


rc.Loader = class {
  constructor(type) {
    this.size = type;
    this.create();
  }
  create() {
    let cssSpinner =  /*html*/
      `
          border: 16px solid #f3f3f3;
          border-radius: 50%;
          border-top: 16px solid #3498db;
          width: 90px;
          height: 90px;
      `;
    let spinner = rc.d.createElement('div');
    spinner.classList.add('mx-auto')
    spinner.style.cssText = cssSpinner;
    spinner.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ],
      {
        duration: 1500,
        iterations: Infinity
      });
    this.mainElement = spinner;
    return this.mainElement;
  }
}


