class Book {

  constructor (el, id, tag, invert = false) {
    this.el = el;
    this.id = id;
    this.tag = tag;
    this.invert = invert;

    this.shuffle = this.shuffle.bind(this);
    this.remove = this.remove.bind(this);
    this._getSrc = this._getSrc.bind(this);
    this.render = this.render.bind(this);
  }

  shuffle() {
    console.log('shuffle');
    const arr = window.constituents[this.tag];
    let old_id = this.id;
    this.id = arr[Math.random() * arr.length | 0];
    window.jankEventBus.emit('change-book', {old_id: old_id, new_id: this.id});
    this.render();
  }

  remove(e) {
    console.log('remove');
    e.preventDefault();
    window.jankEventBus.emit('delete-book', {id: this.id});
  }

  _getSrc() {
    return this.id ? window.listings[this.id].image_url : '';
  }

  render (invert = null) {
    invert = (typeof(this.invert) == null) ? invert : this.invert;
    this.el.innerHTML = '';

    this.el.innerHTML += `
      <img src="${this._getSrc()}" />
      <span>${this.tag}</span>
    `

    // this.el.addEventListener('contextmenu', console.log);
    this.el.addEventListener('dblclick', this.shuffle);
    this.el.addEventListener('contextmenu', this.remove);
  }
}

export default Book;
