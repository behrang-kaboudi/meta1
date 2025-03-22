class SimpleText extends SbkC{
    constructor(d) {
        super();
    }
    _create(){
        this.html =  /*html*/
        `
            <div class= 'text-center fs-5'>
                <span>
                    Loading .....
                </span>
            </div>
        `; 
    }
}
class PageLoader extends SbkC{
    constructor() {
        super();
    }
    _create(){
        this.html =  /*html*/
        `
            <div class="dir-ltr d-flex position-fixed w-100 align-items-center justify-content-center" style="height: 100%;background-color: rgba(139, 168, 223, 0.6);z-index: 10000; top:0px">
                <span class="fs-1 text-danger">
                    Loading ........
                </span>
            </div>
        `; 
    }
}
export {SimpleText}