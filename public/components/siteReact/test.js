class Test extends SbkC{
    constructor() {
        super();
    }
    click(e){
        console.log('bbbbbbb',);
        console.log('this.jqHandlers',this.jqHandlers);
        this.h('test').text('232425')
        // this.jqHandlers.test.text('232425')
    }
    _create(){
        // this.children = {
        //     ch1: new Child('xxxx')
        // }
        // for (let i = 2; i < 4; i++) {
        //     this.children['ch'+i] = new Child(i)
        // }
        // <span ${this.childName} = 'ch2('ss')''>
                // </span>
                // <span ${this.childName} = 'ch3({})'>
                // </span>  
        let sam ={my:'dssdsd',id:12}
        this.html =  /*html*/
        `
            <div class= 'text-center fs-5'>
                <span ${this.evName} ='{"click":"click"}'>
                    Loading .....
                </span>
                <span ${this.evName} ='{"click":"click"}'>
                    Loading .....
                </span>
                <span ${this.hc('test')}>
                    Loading .....
                </span>
                ${this.child(Child,sam,'ch1')}
                ${this.child(Child,sam,'ch1')}
                ${this.child(Child,sam,'ch1')}
                
            </div>
        `; 
    }
}
class Child extends SbkC{
    constructor(d) {
        super();
    }
    click(e){
        console.log('ccccccccccc',);
    }
    _create(){
        this.html =  /*html*/
        `
            <div class= 'text-center fs-5'>
                <span ${this.evName} ='{"click":"click"}'>
                    Loading2 .....
                </span>
            </div>
        `; 
    }
}
export {Test}