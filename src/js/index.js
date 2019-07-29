import '../css/index.scss';

// import listings from '../data/listings.json';
// import titles from '../data/titles.json';
// import contituents from '../data/constituents.json';


import * as d3 from 'd3';
import 'intersection-observer';
import scrollama from 'scrollama';
import { Sortable } from '@shopify/draggable';

const container = d3.select('.scroll');
const graphic = container.select('.scroll__stage');
const text = container.select('.scroll__runway');
const step = text.selectAll('.step');

const scroller = scrollama();
let constituents = null;
let titles = null;
let listings = null;

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
  console.log('Hi', response);

  // Draw graphic
  graphic
    .selectAll('div.graphic__step')
    .classed('active', (_, i) => {
      return i == response.index;
    })
}

// https://codepen.io/rothkj1022/pen/eNONZz
function sentenceCase(theString) {
  var newString =
    theString
    .toLowerCase()
    .replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function(c) {
      return c.toUpperCase()
    });
  return newString;
}

function renderGraphic(graphic) {
  const container = document.createElement('div');
  const books = getSentence(graphic.bookIds, graphic.constituents);
  const sentence = graphic.sentence || sentenceCase(graphic.bookIds.map(x => titles[x.toString()]).join(' '));
  const sentence_p = document.createElement('p');
  sentence_p.innerText = sentence;
  sentence_p.classList.add('sentence-text');
  if (graphic.invert) books.classList.add('invert');
  if (graphic.showCovers) container.appendChild(books);
  if (graphic.showSentence) container.appendChild(sentence_p);
  return container;
}

function getCoverImage(bookId, constituent, invert = false) {
  const image = new Image();
  const container = document.createElement('div');
  container.classList.add('book');
  if (invert) container.classList.add('invert');
  const pos = document.createElement('span');
  pos.innerText = constituent;
  pos.addEventListener('dblclick', e => {
    let ind = e.target.parentElement.dataset.index;
    let tag = e.target.parentElement.dataset.tag;

    const div = document.querySelector('.interactive[data-sentence="interactive"]')
    const storyObject = JSON.parse(div.dataset.object);
    const bookId = getRandomBook(tag);
    storyObject.bookIds[ind] = bookId;
    div.innerHTML = '';
    div.appendChild(renderGraphic(storyObject));
    div.dataset.object = JSON.stringify(storyObject);
    const sortable = new Sortable(document.querySelectorAll('.cover-story'), {
      draggable: '.book'
    });
    sortable.on('sortable:stop', update);
  });
  container.appendChild(pos);
  if (bookId) {
    image.src = listings[bookId].image_url;
    container.appendChild(image);
  }
  return container;
}

function shuffleBook(bookContainer, constituent) {

}

function getSentence(bookIdList = null, constituents = null) {
  const container = document.createElement('div');
  container.classList.add("cover-story");
  const len = bookIdList ? bookIdList.length : constituents.length;
  for (let i = 0; i < len; ++i) {
    let item = getCoverImage(bookIdList[i], constituents[i])
    item.dataset.index = i;
    item.dataset.tag = constituents[i];
    container.appendChild(item);
  }
  return container;
}

function getRandomBook(tag) {
  const arr = constituents[tag];
  return arr[Math.random() * arr.length | 0];
}

function move(arr, oldInd, newInd) {
  const [ old ] = arr.splice(oldInd, 1);
  arr.splice(newInd, 0, old);
}

function update(e) {
  const div = document.querySelector('.interactive[data-sentence="interactive"]')
  const storyObject = JSON.parse(div.dataset.object);
  move(storyObject.constituents, e.data.oldIndex, e.data.newIndex);
  move(storyObject.bookIds, e.data.oldIndex, e.data.newIndex);
  div.innerHTML = '';
  div.appendChild(renderGraphic(storyObject));
  div.dataset.object = JSON.stringify(storyObject);
  const sortable = new Sortable(document.querySelectorAll('.cover-story'), {
    draggable: '.book'
  });
  sortable.on('sortable:stop', update);
  // const item = getCoverImage(bookId, e.target.value, false);
  // document.querySelector('.interactive[data-sentence="interactive"] .cover-story').appendChild(item);
}

async function init() {
  [constituents, titles, listings] = await fetchData();

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

  // setup resize event
  window.addEventListener('resize', handleResize);

  document.querySelectorAll('.interactive').forEach(x => {
    x.appendChild(renderGraphic(graphics[x.dataset.sentence]));
    x.dataset.object = JSON.stringify(graphics[x.dataset.sentence]);
  })

  const sortable = new Sortable(document.querySelectorAll('.cover-story'), {
    draggable: '.book'
  });

  document.querySelector('select.constituents').addEventListener('change', e => {
    const div = document.querySelector('.interactive[data-sentence="interactive"]')
    const storyObject = JSON.parse(div.dataset.object);
    const bookId = getRandomBook(e.target.value);
    storyObject.constituents.push(e.target.value);
    storyObject.bookIds.push(bookId);
    div.innerHTML = '';
    div.appendChild(renderGraphic(storyObject));
    div.dataset.object = JSON.stringify(storyObject);
    const sortable = new Sortable(document.querySelectorAll('.cover-story'), {
      draggable: '.book'
    });
    sortable.on('sortable:stop', update);
  })
}

init()
