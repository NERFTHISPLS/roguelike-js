class Model {
  state = {
    map: {
      width: 40,
      height: 24,
      // tiles will be represented as an array of objects:
      // { type: String, x: Number, y: Number }
      tiles: [],
      rooms: {
        roomsNumber: 0,
        minRoomsNumber: 5,
        maxRoomsNumber: 10,
        minRoomSize: 3,
        maxRoomSize: 8,
        // roomsCoords will be represented as an array of arrays of coordinate of a
        // separate room:
        // [leftCornerX, leftCornerY, rightCornerX, rightCornerY]
        roomsCoords: [],
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

  addRoomsOnMapTiles() {
    const { tiles } = this.state.map;
    const { roomsCoords } = this.state.map.rooms;

    this._initRooms();

    for (const [leftX, leftY, rightX, rightY] of roomsCoords) {
      for (let j = leftY; j <= rightY; j++) {
        for (let i = leftX; i <= rightX; i++) {
          const tile = tiles.find(tile => tile.x === i && tile.y === j);
          tile.type = 'tile';
        }
      }
    }
  }

  _initRooms() {
    this._initRoomsNumber();

    const { roomsNumber, roomsCoords } = this.state.map.rooms;
    for (let i = 0; i < roomsNumber; i++) {
      const roomCoords = this._calcRoomCoords();

      roomsCoords.push(roomCoords);
    }
  }

  _initRoomsNumber() {
    const { rooms } = this.state.map;

    rooms.roomsNumber = this._getRandomInt(
      rooms.minRoomsNumber,
      rooms.maxRoomsNumber
    );
  }

  _calcRoomCoords() {
    const { width, height } = this.state.map;
    const { minRoomSize, maxRoomSize } = this.state.map.rooms;

    const roomWidth = this._getRandomInt(minRoomSize, maxRoomSize);
    const roomHeight = this._getRandomInt(minRoomSize, maxRoomSize);

    const leftCoordX = this._getRandomInt(0, width - 1);
    const leftCoordY = this._getRandomInt(0, height - 1);

    const rightCoordX = this._adjustRoomRightCornerCoord(
      leftCoordX + roomWidth,
      width
    );
    const rightCoordY = this._adjustRoomRightCornerCoord(
      leftCoordY + roomHeight,
      height
    );

    return [leftCoordX, leftCoordY, rightCoordX, rightCoordY];
  }

  _adjustRoomRightCornerCoord(rightCornerCoord, mapSize) {
    return rightCornerCoord >= mapSize ? mapSize - 1 : rightCornerCoord;
  }

  _getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
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
    this._model.addRoomsOnMapTiles();
    this._mapView.addHandlerRender(this._controlMap.bind(this));
  }

  _controlMap() {
    this._mapView.render(this._state.map);
  }
}

const game = new Controller();
