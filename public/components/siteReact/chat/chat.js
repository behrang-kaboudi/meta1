class Message extends SbkC {
    constructor(props) {
        super(props);
    }
    _create() {
        this.html =  /*html*/
            `
            <div>
                <span class='fs-6' >
                    ${this.props.data.userName}: 
                </span>
                <span >
                    ${this.props.data.text}
                </span>
            </div>

            `
    }
}
class Chat extends SbkC {
    constructor(props) {
        super(props);
        let self = this;
        this.chats = [];
        this.event.on('create', () => {
            socket.on('create', (data) => {
                if (data.root == this.props.server.room) {
                    self.setNewMsg(data.data);
                }

            });
            socket.on('chats', (data) => {
                if (data.root == this.props.server.room) {
                    let mainData = data.data;
                    self.setChats(mainData);
                }
            });
            socket.io.on('reconnect', function () {
                self.reCon();
            });
        });
    }
    setNewMsg(msg) {
        this.chats.push(msg);
        let d = this.dChild(Message, { data: msg });
        this.h.messageBox.append(d.mainElement);
        this.h.messageBox.scrollTo(0, this.h.messageBox.clientHeight);
    }
    setChats(chats) {
        this.chats = chats;
        this.disposeChild();
        this.chats.forEach(msg => {
            // this.receivedMessageCreator(msg);
            let d = this.dChild(Message, { data: msg });
            this.h.messageBox.append(d.mainElement)
        });
        this.h.messageBox.scrollTo(0, this.h.messageBox.clientHeight);
    }
    sendText() {
        let text = this.h.textInput.value.trim();
        this.h.textInput.setAttribute('placeholder', '');
        if (text === '') {
            return;
        }
        socket.emit('chat', { signal: 'text', data: { text, id: this.props.server.id } })
        this.h.textInput.value = '';
    }
    _create() {
        this.html =  /*html*/
            `
                <div  style = 'border:solid 1px rgb(204, 204, 204); border-radius: 6px;'>
                    <div style='background-color: rgb(58, 80, 137);color:white;font-size:clamp(0.6rem,1.2vw,2rem);border:solid 1px rgb(204, 204, 204); border-radius: 6px;' class='px-2 py-2'>
                            Chat Room
                    </div>   
                    <div ${this.hc('messageBox')} style='height:350px' class='px-1 py-1 m-1  overflow-auto border rounded-1'>
                    </div>    
                    <div class="d-flex">
                        <div class="m-1 w-75">
                            <textarea ${this.hc('textInput')} class="form-control w-100" rows="1" placeholder="Please be nice in the chat!"></textarea>
                        </div>
                        <input type="button" class="btn btn-success w-25 m-1" value="Send" ${this.ec({ click: "sendText" })} >
                    </div> 
                </div>

            `
    }
}
export { Chat };
