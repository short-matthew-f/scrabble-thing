// Fetch related things
const DEFINITION_URL = `https://dictionaryapi.com/api/v3/references/sd3/json`
const DEFINITION_QS = `key=689b7ccf-441b-4d52-8782-39fc2aba053e`;

function fetchDefinition(word) {
  return fetch(`${ DEFINITION_URL }/${ word }?${ DEFINITION_QS}`)
          .then(res => res.json())
          .catch(console.error);
}

const THESAURUS_URL = `https://dictionaryapi.com/api/v3/references/ithesaurus/json`
const THESAURUS_QS = `key=e7c110b5-41c6-43f8-81e4-e381a3c781b5`;  

function fetchSynonyms(word) {
  return fetch(`${ THESAURUS_URL }/${ word }?${ THESAURUS_QS }`)
  .then(res => res.json())
  .catch(console.error);
}

function shuffle(array) {
  for (let currentIdx = 0; currentIdx < array.length; currentIdx++) {
    let targetIdx = Math.floor(Math.random() * (array.length - currentIdx)) + currentIdx;
    [array[currentIdx], array[targetIdx]] = [array[targetIdx], array[currentIdx]];
  }
}

const TRAY_SIZE = 12;
const HAND_SIZE = 10;

function buildTray () {
  let specialIndices = [
    Math.floor(4 * Math.random()),
    Math.floor(2 * Math.random()) + 4,
    Math.round(Math.random() + .25) ? Math.floor(4 * Math.random()) + 6 : null
  ];

  const tray = [];
  for (let i = 0; i < TRAY_SIZE; i++) {
    tray[i] = {
      tile: null,
      letterMultiplier: specialIndices.indexOf(i) > -1 ? 2 + Math.round(Math.random()) : 1,
    }
  }

  return tray;
}
  
function buildTileBag() {
  const LETTERS = {
    "a": { "points":  1, "tiles":  9 },
    "b": { "points":  3, "tiles":  2 },
    "c": { "points":  3, "tiles":  2 },
    "d": { "points":  2, "tiles":  4 },
    "e": { "points":  1, "tiles": 12 },
    "f": { "points":  4, "tiles":  2 },
    "g": { "points":  2, "tiles":  3 },
    "h": { "points":  4, "tiles":  2 },
    "i": { "points":  1, "tiles":  9 },
    "j": { "points":  8, "tiles":  1 },
    "k": { "points":  5, "tiles":  1 },
    "l": { "points":  1, "tiles":  4 },
    "m": { "points":  3, "tiles":  2 },
    "n": { "points":  1, "tiles":  6 },
    "o": { "points":  1, "tiles":  8 },
    "p": { "points":  3, "tiles":  2 },
    "q": { "points": 10, "tiles":  1 },
    "r": { "points":  1, "tiles":  6 },
    "s": { "points":  1, "tiles":  4 },
    "t": { "points":  1, "tiles":  6 },
    "u": { "points":  1, "tiles":  4 },
    "v": { "points":  4, "tiles":  2 },
    "w": { "points":  4, "tiles":  2 },
    "x": { "points":  8, "tiles":  1 },
    "y": { "points":  4, "tiles":  2 },
    "z": { "points": 10, "tiles":  1 }
  }

  const tileBag = [];
  
  Object.entries(LETTERS).forEach(([character, data]) => {
    for (let i = 0; i < data.tiles; i++) {
      tileBag.push({ character, points: data.points });
    }
  });

  return tileBag;
}

const tileGame = {
  tray: buildTray(),
  tileBag: buildTileBag(),
  handTiles: [],
  trayTiles: [],
  points: 0,
  fillHand: function () {
    while (this.handTiles.length < HAND_SIZE) {
      this.handTiles.push(this.tileBag.pop());
    }
  },
  shuffleTileBag: function () {
    shuffle(this.tileBag);
  },
};

const tileGameInterface = {
  root: $('#tile-game'),
  renderTray: function () {
    const trayElement = this.root.find('#play-area .tile-grid');
    trayElement.empty();

    tileGame.tray.forEach(trayCell => {
      trayElement.append($(`<div class="tile-target ${ 
        trayCell.letterMultiplier === 2
        ? 'two-times-letter'
        : trayCell.letterMultiplier === 3
        ? 'three-times-letter'
        : '' }"></div>`).data('trayCell', trayCell));
    });
  },
  renderTrayTiles: function () {
    const trayElement = this.root.find('#play-area .tile-grid');

    tileGame.trayTiles.forEach((tile, index) => {
      const tileTargetElement = trayElement.find(
        $(`.tile-target:nth-child(${ index + 1})`)
      )

      tileTargetElement.html($(`<div class="tile">
          <span class="character">${ tile.character }</span>
          <span class="points">${ tile.points }</span>
        </div>`).data('tile', tile));
    });
  },
  renderHandTiles: function () {
    const handGridElement = this.root.find('#hand-area .tile-grid');
    handGridElement.empty();

    tileGame.handTiles.forEach(tile => {
      handGridElement.append($(`<div class="tile">
        <span class="character">${ tile.character }</span>
        <span class="points">${ tile.points }</span>
      </div>`).data('tile', tile));
    });
  },
  listenForTileClicks: function() {
    this.root.on('click', '#hand-area .tile', function () {
      const tile = $(this).data('tile');

      tileGame.handTiles.splice(tileGame.handTiles.indexOf(tile), 1)
      tileGame.trayTiles.push(tile);

      tileGameInterface.renderTray();
      tileGameInterface.renderTrayTiles();
      tileGameInterface.renderHandTiles();
    });

    this.root.on('click', '#play-area .tile', function () {
      const tile = $(this).data('tile');

      tileGame.trayTiles.splice(tileGame.trayTiles.indexOf(tile), 1)
      tileGame.handTiles.push(tile);

      tileGameInterface.renderTray();
      tileGameInterface.renderTrayTiles();
      tileGameInterface.renderHandTiles();
    });
  }
}

tileGame.shuffleTileBag();
tileGame.fillHand();

tileGameInterface.renderHandTiles();
tileGameInterface.renderTray();
tileGameInterface.listenForTileClicks();