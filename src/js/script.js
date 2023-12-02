class Model {
  state = {
    map: {
      width: 40,
      height: 24,
      // tiles will be represented as an array of objects:
      // { type: String, x: Number, y: Number }
      tiles: [],
      rooms: {
        number: 0,
        minNumber: 5,
        maxNumber: 10,
        minSize: 3,
        maxSize: 8,
        // roomsCoords will be represented as an array of arrays of coordinate of a
        // separate room:
        // [leftCornerX, leftCornerY, rightCornerX, rightCornerY]
        coords: [],
      },
      // passages can be represented as slightly differrent rooms
      passages: {
        number: 0,
        minMumber: 3,
        maxNumber: 5,
        minSize: 1,
        maxSize: 1,
        coords: [],
      },
    },
  };

  initMapTiles() {
    const { map } = this.state;

    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i++) {
        map.tiles.push({ type: 'tile-w', x: i, y: j });
      }
    }
  }

  addGroundTiles(mapPieceOfState) {
    this._initGroundTilesNumber(mapPieceOfState);

    this._initGroundTiles(mapPieceOfState);
    this._replaceTiles('tile', mapPieceOfState.coords);
  }

  // coords will be mutaded
  _initGroundTiles({ number, minSize, maxSize, coords }) {
    for (let i = 0; i < number; i++) {
      const groundCoords = this._calcGroundCoords(minSize, maxSize);

      coords.push(groundCoords);
    }
  }

  _initGroundTilesNumber(mapPieceOfState) {
    mapPieceOfState.number = this._getRandomInt(
      mapPieceOfState.minNumber,
      mapPieceOfState.maxNumber
    );
  }

  _initPassagesNumber() {
    const { passages } = this.state.map;

    passages.passagesNumber = this._getRandomInt();
  }

  _calcGroundCoords(minSize, maxSize) {
    const { width, height } = this.state.map;

    const roomWidth = this._getRandomInt(minSize, maxSize);
    const roomHeight = this._getRandomInt(minSize, maxSize);

    const leftCoordX = this._getRandomInt(0, width - 1);
    const leftCoordY = this._getRandomInt(0, height - 1);

    const rightCoordX = this._adjustGroundRightCornerCoord(
      leftCoordX + roomWidth,
      width
    );
    const rightCoordY = this._adjustGroundRightCornerCoord(
      leftCoordY + roomHeight,
      height
    );

    return [leftCoordX, leftCoordY, rightCoordX, rightCoordY];
  }

  _adjustGroundRightCornerCoord(rightCornerCoord, mapSize) {
    return rightCornerCoord >= mapSize ? mapSize - 1 : rightCornerCoord;
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
    this._model.addGroundTiles(this._state.map.rooms);
    this._mapView.addHandlerRender(this._controlMap.bind(this));
  }

  _controlMap() {
    this._mapView.render(this._state.map);
  }
}

const game = new Controller();
