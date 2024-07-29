/** Causal view event manager */
export class EventManager {
    constructor() {
      this.eventListeners = {};
    }
  
    addEventListener(eventName, listener) {
      if (!this.eventListeners[eventName]) {
        this.eventListeners[eventName] = [];
      }
      this.eventListeners[eventName].push(listener);
    }
  
    dispatchEvent(event) {
      const listeners = this.eventListeners[event.type];
      if (listeners) {
        listeners.forEach((listener) => listener(event));
      }
    }
  
    removeEventListener(eventName, listenerToRemove) {
      const listeners = this.eventListeners[eventName];
      if (listeners) {
        this.eventListeners[eventName] = listeners.filter(
          (listener) => listener !== listenerToRemove
        );
      }
    }
}
  