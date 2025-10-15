class Event {
    constructor() {
        this._events = {};
    }
    on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(listener);
    }
    removeListener(name, listenerToRemove) {
        if (!this._events[name]) {
            // throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
            return;
        }
        const filterListeners = (listener) => listener !== listenerToRemove;
        this._events[name] = this._events[name].filter(filterListeners);
    }
    emit(name, data) {
        if (!this._events[name]) {
            // throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
            return;
        }
        this._events[name].forEach(f => f(data));
    }
  }
  export {Event}