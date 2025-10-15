
import { getManager } from "./tourManager.js";
let manager, swiss;
class RegisterBtn extends SbkC {
    constructor() {
        super();
        let self = this;
        manager = getManager()
        swiss = manager.props.data;
        this.event.on('create', function () {
            self.update()
        })
    }
    update() {
        this.displayNone();
        if (swiss.tour.status == 'finished') return
        if (swiss.tour.status != 'open') {
            this.h.registered.classList.remove('d-none')
        } else {
            if (swiss.tour.players.includes(userName)) {
                this.h.withdraw.classList.remove('d-none');
            }
            else {
                this.h.join.classList.remove('d-none');
            }
        }
    }
    withdraw(e) {
        this.displayNone()
        this.h.waiting.classList.remove('d-none');
        socket.emit('swiss', { signal: 'withdraw', data: { id: swiss.tour._id } })
    }
    register(e) {
        if (!userName) {
            window.location.href = '/user/login';
            return;
        }
        this.displayNone()
        this.h.waiting.classList.remove('d-none');
        socket.emit('swiss', { signal: 'register', data: { id: swiss.tour._id } })
    }
    displayNone() {
        this.h.waiting.classList.add('d-none');
        this.h.withdraw.classList.add('d-none');
        this.h.registered.classList.add('d-none');
        this.h.join.classList.add('d-none');
    }
    _create() {
        // ${this.hc('test')}
        this.html =  /*html*/
            `
                <div class='sbkc-fs-9'>
                    <button ${this.hc('waiting')}   class="btn btn-outline-dark d-none" disabled>
                    Waiting ...
                    </button>
                    <button ${this.hc('withdraw')}   class="btn btn-outline-danger d-none" ${this.ec({ click: "withdraw" })}>
                        Withdraw
                    </button>
                    <button ${this.hc('registered')}   class="btn btn-outline-warning d-none">
                        You Registered Before
                    </button>
                    <button ${this.hc('join')}   class="btn btn-outline-success d-none" ${this.ec({ click: "register" })}>
                        Join
                    </button>
                </div>
               
            
        `;


    }
}
export { RegisterBtn }