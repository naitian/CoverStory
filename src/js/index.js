import '../css/index.scss';

import CoverStory from './coverstory';
import JankEventBus from './eventBus';
import 'intersection-observer';
import * as d3 from 'd3';
import scrollama from 'scrollama';
// import Vue from 'vue';
//
window.jankEventBus = new JankEventBus();

const container = d3.select('.scroll');
const graphic = container.select('.scroll__stage');
const text = container.select('.scroll__runway');
const step = text.selectAll('.step');

const scroller = scrollama();

const graphics = {
  'matisse': {
    bookIds: ['178628', '18827', '32953', '170510', '171037', '127749'],
    constituents: ['NP', 'VP', 'PP', 'CC', 'NP', 'VP'],
    sentence: 'Henri Matisse works well with others in the courtyard of the Kabbalist, and in the morning, Leonardo’s shadow got to give the people what they want.',
    showCovers: true,
    showSentence: true
  },
  'np-vp': {
    bookIds: ['171944', '168813'],
    constituents: ['NP', 'VP'],
    sentence: 'Hover to see example covers',
    showCovers: true,
    showSentence: true,
    invert: true
  },
  'np': {
    bookIds: [null, '9485', '8597', '8720'],
    constituents: ['[DET]', '[ADJP]', 'N', '[PP]'],
    sentence: 'Some of these (like determiners) don\'t show up in the data, because people don\'t like to title their books just "The"',
    showCovers: true,
    showSentence: true,
    invert: true
  },
  'new-np-vp': {
    bookIds: ['9485', '8597', '8720', '168813'],
    constituents: ['ADJP', 'N', 'PP', 'VP'],
    sentence: 'We can take the NP we formed before and put it into our NP VP structure for a sentence',
    showCovers: true,
    showSentence: true,
    invert: true
  },
  'mismatch': {
    bookIds: ['8601', '168813'],
    constituents: ['NP', 'VP'],
    sentence: 'This NP and VP do not match each other (plural noun, singular verb).',
    showCovers: true,
    showSentence: true,
    invert: false
  },
  'interactive': {
    bookIds: [],
    constituents: [],
    showCovers: true,
    showSentence: true,
  }
}

async function fetchData() {
  let response = await Promise.all([
    fetch('/data/constituents.json').then(res => res.json()),
    fetch('/data/titles.json').then(res => res.json()),
    fetch('/data/listings.json').then(res => res.json())
  ])
  return response;
}

// resize function to set dimensions on load and on page resize
function handleResize() {
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  // Draw graphic
  graphic
    .selectAll('div.graphic__step')
    .classed('active', (_, i) => {
      return i == response.index;
    })
}

async function init() {
  [window.constituents, window.titles, window.listings] = await fetchData();

  // 1. call a resize on load to update width/height/position of elements
  handleResize();

  // 2. setup the scrollama instance
  scroller
    .setup({
      container: '.scroll',
      graphic: '.scroll__stage',
      text: '.scroll__runway',
      step: '.scroll__runway .step',
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter)

  console.log(scroller)

  // setup resize event
  window.addEventListener('resize', handleResize);

  document.querySelectorAll('.interactive').forEach(x => {
    let data = graphics[x.dataset.sentence];
    let books = [];
    for (let i = 0; i < data.constituents.length; ++i) {
      books.push({ id: parseInt(data.bookIds[i]), tag: data.constituents[i] });
    }
    let coverStory = new CoverStory(x, books, data.showSentence, data.invert, data.sentence)
    coverStory.render();
    // x.appendChild(renderGraphic(graphics[x.dataset.sentence]));
    // x.dataset.object = JSON.stringify(graphics[x.dataset.sentence]);
  })

  const interactiveCover = new CoverStory(document.querySelector('.playground .interactive'), [], []);

  document.querySelector('select.constituents').addEventListener('change', e => {
    if (e.target.value == 'default') return;
    interactiveCover.addBook(e.target.value);
    e.target.value = 'default';
  });

  window.jankEventBus.register('change-book', e => {
    for (let i = 0; i < interactiveCover.books.length; ++i) {
      const book = interactiveCover.books[i];
      if (book.id == e.old_id) book.id = e.new_id;
    }
    interactiveCover.render();
  })

  window.jankEventBus.register('delete-book', e => {
    for (let i = 0; i < interactiveCover.books.length; ++i) {
      const book = interactiveCover.books[i];
      if (book.id == e.id) {
        interactiveCover.books.splice(i, 1);
        interactiveCover.render();
        return;
      }
    }
  })
}

init()
