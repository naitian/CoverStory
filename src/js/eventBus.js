class JankEventBus {
  constructor () {
    this.events = {}
  }

  emit(name, e) {
    this.events[name](e);
  }

  register(name, fun) {
    this.events[name] = fun;
  }
}

export default JankEventBus;
