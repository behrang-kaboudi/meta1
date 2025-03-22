const { express, io } = require('./mainRout');
const Chat = require('../module/chat/chat')
const Events = require('events');
const { json } = require('express');
const router = {}

router.event = new Events();
const eventsName = {
    create: 'create',
}
router.event.on(eventsName.create, async (msg) => {
    let rName = 'chat-' + msg.room + '-' + msg.to;
    io.to(rName).emit(eventsName.create, { root: rName, data: msg });
})
router.ioF = async function (data, ack, userData) {

    if (!data) return;
    await router.io[data.signal](data.data, ack, userData);
}
router.io = {};
router.io.text = async (data, ack, userData) => {
    if (!userData || !userData.userName) return;
    //todo if allow
    let parts = data.id.split('-');
    let ch = {};
    ch.to = parts[1];
    ch.room = parts[0];
    ch.text = data.text.replace(/(<([^>]+)>)/gi, " ");
    ch.time = Date.now();
    ch.userName = userData.userName;
    let msg = new Chat(ch);
    await msg.save();
    router.event.emit(eventsName.create, msg);
    // ack();
}
router.io.getChat = async (data, ack, userData) => {
    //todo if not allowed for each room
    let parts = data.id.split('-')
    let chats = await Chat.find({ room: parts[0], to: parts[1] });
    io.in(userData.socket.id).emit('chats', { root: 'chat-' + data.id, data: chats });
}
module.exports = router;