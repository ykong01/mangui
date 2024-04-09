export const Events = {
  RENDER_RESULT: 0,
  BREADCRUMB_REFRESH: 1,
  DATABASE_REFRESH: 2
}

export const EventEmitter = {
  _events: [],
  dispatch (event, data, dispatchCallback) {
    if (!this._events[event]) return
    this._events[event].forEach((eventCallback) => {
      eventCallback(data)
    })
    if (dispatchCallback !== undefined && dispatchCallback !== null) {
      dispatchCallback()
    }
  },
  subscribe (event, eventCallback) {
    if (!Object.values(Events).includes(event)) {
      console.error("Event '" + event + "' not declared.")
      return
    }
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(eventCallback)
  },
  unsubscribe (event, callbackName) {
    if (!this._events[event]) return
    this._events[event].forEach((eventCallback, index) => {
      if (eventCallback.name.indexOf(callbackName) >= 0) {
        this._events[event].splice(index, 1)
      }
    })
    if (this._events[event].length === 0) {
      delete this._events[event]
    }
  },
  reset () {
    this._events = []
  }
}
