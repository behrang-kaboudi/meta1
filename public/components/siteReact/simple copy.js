
const rc = {};
rc.cm = (html) => {
    // setInnerHtml
    // return {__html: DOMPurify.sanitize(html) };
  }
// rc.d = document;
// rc.SbkComp = class{
//   constructor() {
//     this.mainElement = null;
//     this.mainData = null;
//     this.parent = null;
//     this._create();
//   }
//   render(parent = null,append = false){
//     this._create();
//     if(this.parent){
//       this.parent.innerHtml='';
//     }
//     if(parent){
//       this.parent = parent
//     }
//     if(!this.parent)return;
//     if(!append){
//       this.parent.innerHTML='';
//       // this.parent.innerText='';
//     }
//     this.parent.append(this.mainElement);
//   }
//   _preCreate(){
//     // let el = rc.d.createElement('div');
//     // this.mainElement = el;
//     let loader = new rc.Loader();
//     // el.append(loader.mainElement);
//     this.mainElement = loader.mainElement;
//     return this.mainElement;
//   }
//   _create(){
//     if(!this.mainData){
//       this._preCreate();
//     }
//     else{
//       this._createComp()
//     }
    
//   };
//   _createComp(){
//   };
// }
rc.Loader = ()=>  {
      let cssSpinner=  /*html*/
      `
          border: 16px solid #f3f3f3;
          border-radius: 50%;
          border-top: 16px solid #3498db;
          width: 120px;
          height: 120px;
      `;
      let spinner= rc.d.createElement('div');
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
rc.simple ={};




// function Hello(props, ref) {
//     const [count, setCount] = R.useState(0);
//     function setC(c) {
//         setCount(c)
//     }
//     ref.current = {};
//     ref.current.setC = setC;
//     return (
//         <div>
//             <p>You clicked {count} times</p>
//             <button onClick={() => setCount(count + 1)}>
//                 Click me
//             </button>
//         </div>
//     );
// }
// const Fc= React.forwardRef(Hello);
// const ref2 = React.createRef({});
// let x2 = <Fc ref={ref2}/>;
// ReactDOM.render(x2, document.getElementById('myDiv2'))
// console.log('rf',ref2);
// ref2.current.setC(6);

// const element = <rc.bsDiv id="Sara" />;
// console.log('el',element);
// ReactDOM.render(element, document.getElementById('myDiv3'))

