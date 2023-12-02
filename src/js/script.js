class Model {
  _TILE_TYPE_ENEMY = 'tile-e';
  _TILE_TYPE_HP = 'tile-hp';
  _TILE_TYPE_PLAYER = 'tile-p';
  _TILE_TYPE_SWORD = 'tile-sw';
  _TILE_TYPE_WALL = 'tile-w';
  _TILE_TYPE_GROUND = 'tile';

  state = {
    map: {
      width: 40,
      height: 24,
      // tiles will be represented as an array of objects:
      // { type: String, x: Number, y: Number }
      tiles: [],
      rooms: {
        minNumber: 5,
        maxNumber: 10,
        minSize: 3,
        maxSize: 8,
      },
    },
  };

  initMapTiles() {
    const { map } = this.state;

    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i++) {
        map.tiles.push({ type: this._TILE_TYPE_WALL, x: i, y: j });
      }
    }
  }

  addRooms() {
    const { minNumber, maxNumber } = this.state.map.rooms;
    const roomsNumber = this._getRandomInt(minNumber, maxNumber);

    for (let i = 0; i < roomsNumber; i++) {
      this._addRoom();
    }
  }

  _addRoom() {
    const { width, height } = this.state.map;
    const { minSize, maxSize } = this.state.map.rooms;

    const roomWidth = this._getRandomInt(minSize, maxSize);
    const roomHeight = this._getRandomInt(minSize, maxSize);

    const leftCornerX = this._getRandomInt(0, width - 1 - roomWidth);
    const leftCornerY = this._getRandomInt(0, height - 1 - roomHeight);

    const roomCoords = [
      [
        leftCornerX,
        leftCornerY,
        leftCornerX + roomWidth,
        leftCornerY + roomHeight,
      ],
    ];

    this._replaceTiles(this._TILE_TYPE_GROUND, roomCoords);
  }

  _getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  _replaceTiles(type, coords) {
    const { tiles } = this.state.map;

    for (const [leftX, leftY, rightX, rightY] of coords) {
      for (let j = leftY; j <= rightY; j++) {
        for (let i = leftX; i <= rightX; i++) {
          const tile = tiles.find(tile => tile.x === i && tile.y === j);
          tile.type = type;
        }
      }
    }
  }
}

class View {
  _data;

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();

    this._insert(markup);
  }

  _insert(markup) {
    this._clear();
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }
}

class MapView extends View {
  _parentElement = document.querySelector('.field');

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    const { width, height, tiles } = this._data;

    const style = {
      gridTemplateColumns: `repeat(${width}, 1fr)`,
      gridTemplateRows: `repeat(${height}, 1fr)`,
    };

    this._addStyleToParent(style);

    const markup = tiles
      .map(
        tile => /* html */ `
          <div class=${tile.type} data-x="${tile.x}" data-y="${tile.y}"></div>
        `
      )
      .join('\n');

    return markup;
  }

  _addStyleToParent({ gridTemplateColumns, gridTemplateRows }) {
    this._parentElement.style.gridTemplateColumns = gridTemplateColumns;
    this._parentElement.style.gridTemplateRows = gridTemplateRows;
  }
}

class Controller {
  _model = new Model();
  _mapView = new MapView();

  _state = this._model.state;

  constructor() {
    this._init();
  }

  _init() {
    this._model.initMapTiles();
    this._model.addRooms();
    this._mapView.addHandlerRender(this._controlMap.bind(this));
  }

  _controlMap() {
    this._mapView.render(this._state.map);
  }
}

const game = new Controller();
