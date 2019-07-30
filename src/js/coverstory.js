import Book from './book';
import { Sortable } from '@shopify/draggable';

class CoverStory {
  constructor (el, books, showSentence = false, invert = false, sentence = null) {
    this.el = el;
    this.books = books;
    this.showSentence = showSentence;
    this.invert = invert;
    this.sentence = sentence;
    this.bookObjs = [];
    this.container = document.createElement('div');
    this.container.classList.add('cover-story');
    this.sentence_p = document.createElement('p');
    this.sentence_p.classList.add('sentence-text');

    this.el.appendChild(this.container);
    this.el.appendChild(this.sentence_p);

    this._sentenceCase = this._sentenceCase.bind(this);
    this._getBooks = this._getBooks.bind(this);
    this._getSentence = this._getSentence.bind(this);
    this._reorder = this._reorder.bind(this);
    this.render = this.render.bind(this);

    this.sortable = new Sortable(this.container, {
      draggable: '.book',
      delay: 200
    });
    this.sortable.on('sortable:stop', this._reorder);
  }

  // https://codepen.io/rothkj1022/pen/eNONZz
  _sentenceCase(theString) {
    let newString =
      theString
        .toLowerCase()
        .replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (c) {
          return c.toUpperCase()
        });
    return newString;
  }

  _getBooks() {
    this.container.innerHTML = '';
    if (this.invert) this.container.classList.add('invert');
    this.books.map(book => {
      let div = document.createElement('div');
      div.classList.add('book');
      this.container.appendChild(div);
      let bookObj = new Book(div, book.id, book.tag)
      bookObj.render()
      this.bookObjs.push(bookObj);
    });
    return this.container;
  }

  _getSentence() {
    const sent = this.sentence || this._sentenceCase(this.books.map(x => window.titles[x.id]).join(' '));
    this.sentence_p.innerText = sent;
    return this.sentence_p;
  }

  _reorder(e) {
    const [old] = this.books.splice(e.data.oldIndex, 1);
    this.books.splice(e.data.newIndex, 0, old);
    this._getSentence();
    // this.render();
  }

  addBook(tag) {
    const arr = window.constituents[tag];
    const id = arr[Math.random() * arr.length | 0];
    this.books.push({id: id, tag: tag});
    this.render();
  }

  render() {
    this._getBooks()
    if (this.showSentence) {
      this._getSentence();
    }
  }
}

export default CoverStory;
