const TILE_TYPE_ENEMY = 'tile-e';
const TILE_TYPE_HP = 'tile-hp';
const TILE_TYPE_PLAYER = 'tile-p';
const TILE_TYPE_SWORD = 'tile-sw';
const TILE_TYPE_WALL = 'tile-w';
const TILE_TYPE_GROUND = 'tile';

const PLAYER_MAX_HP = 100;
const ENEMIES_MAX_HP = 100;

const PLAYER_INITIAL_ATTACK_POWER = 30;
const ENEMIES_INITIAL_ATTACK_POWER = 10;

class Model {
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
        // all sizes are 0 based
        // (if minSize === 0 then it means that their size is actually 1)
        minSize: 2,
        maxSize: 7,
        coords: [],
        passagesSize: 0,
      },
      items: {
        swords: {
          number: 2,
        },
        healingPotions: {
          number: 10,
        },
      },
      units: {
        player: {
          hp: PLAYER_MAX_HP,
          attackPower: PLAYER_INITIAL_ATTACK_POWER,
          x: 0,
          y: 0,
        },
        enemies: {
          number: 10,
          // will be represented as an array of objects:
          // {
          //  hp: ENEMIES_MAX_HP,
          //  attackPower: ENEMIES_INITIAL_ATTACK_POWER,
          //  x: Number,
          //  y: Number
          // }
          enemiesParameters: [],
        },
      },
    },
  };

  initMapTiles() {
    const { map } = this.state;

    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i++) {
        map.tiles.push({ type: TILE_TYPE_WALL, x: i, y: j });
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

  addPassages() {
    const { coords: roomsCoords } = this.state.map.rooms;

    for (const roomCoords of roomsCoords) {
      this._addPassageX(roomCoords);
      this._addPassageY(roomCoords);
    }
  }

  addItems() {
    const groundTiles = this._getGroundTiles();

    this._addSwords(groundTiles);
    this._addHealingPotions(groundTiles);
  }

  addUnits() {
    const groundTiles = this._getGroundTiles();
    const randomGroundTile = this._getRandomTile(groundTiles);

    this._addPlayer(randomGroundTile);
    this._addEnemies(groundTiles);
  }

  movePlayer(direction) {
    const { player } = this.state.map.units;

    this._moveUnit(player, direction);
  }

  _moveUnit(unit, direction) {
    const { x, y } = unit;

    switch (direction) {
      case 'w':
        this._moveUnitTo(unit, x, y - 1);
        break;
      case 'a':
        this._moveUnitTo(unit, x - 1, y);
        break;
      case 's':
        this._moveUnitTo(unit, x, y + 1);
        break;
      case 'd':
        this._moveUnitTo(unit, x + 1, y);
        break;
      default:
        break;
    }
  }

  _moveUnitTo(unit, x, y) {
    if (!this._unitCanMoveTo(x, y)) return;

    const { units } = this.state.map;

    this._replaceTiles(TILE_TYPE_GROUND, [unit.x, unit.y, unit.x, unit.y]);

    unit.x = x;
    unit.y = y;

    const unitType = unit === units.player ? TILE_TYPE_PLAYER : TILE_TYPE_ENEMY;

    this._replaceTiles(unitType, [unit.x, unit.y, unit.x, unit.y]);
  }

  _unitCanMoveTo(x, y) {
    const { width, height, tiles } = this.state.map;

    if (x < 0 || x >= width || y < 0 || y >= height) return false;

    const tileToStep = tiles.find(tile => tile.x === x && tile.y === y);

    if (
      tileToStep.type !== TILE_TYPE_GROUND &&
      tileToStep.type !== TILE_TYPE_HP &&
      tileToStep.type !== TILE_TYPE_SWORD
    )
      return false;

    return true;
  }

  _addPlayer(groundTile) {
    const { player } = this.state.map.units;
    const { x, y } = groundTile;

    this._replaceTiles(TILE_TYPE_PLAYER, [x, y, x, y]);

    player.x = x;
    player.y = y;
  }

  _addEnemies(groundTiles) {
    const { enemies } = this.state.map.units;

    for (let i = 0; i < enemies.number; i++) {
      const randomGroundTile = this._getRandomTile(groundTiles);
      this._addEnemy(randomGroundTile);
    }
  }

  _addEnemy(groundTile) {
    const { enemiesParameters } = this.state.map.units.enemies;
    const { x, y } = groundTile;

    this._replaceTiles(TILE_TYPE_ENEMY, [x, y, x, y]);

    const enemy = {
      hp: ENEMIES_MAX_HP,
      attackPower: ENEMIES_INITIAL_ATTACK_POWER,
      x,
      y,
    };

    enemiesParameters.push(enemy);
  }

  _addSwords(groundTiles) {
    const { swords } = this.state.map.items;

    this._addItem(TILE_TYPE_SWORD, swords.number, groundTiles);
  }

  _addHealingPotions(groundTiles) {
    const { healingPotions } = this.state.map.items;

    this._addItem(TILE_TYPE_HP, healingPotions.number, groundTiles);
  }

  _addItem(type, itemNumber, groundTiles) {
    for (let i = 0; i < itemNumber; i++) {
      const randomGroundTile = this._getRandomTile(groundTiles);

      this._replaceTiles(type, [
        randomGroundTile.x,
        randomGroundTile.y,
        randomGroundTile.x,
        randomGroundTile.y,
      ]);
    }
  }

  _addPassageX(roomCoords) {
    const { width } = this.state.map;
    const [, roomLeftCoordY, , roomRightCoordY] = roomCoords;

    const leftX = 0;
    const y = this._getRandomInt(roomLeftCoordY, roomRightCoordY);

    const passageCoords = [leftX, y, width - 1, y];

    this._replaceTiles(TILE_TYPE_GROUND, passageCoords);
  }

  _addPassageY(roomCoords) {
    const { height } = this.state.map;
    const [roomLeftCoordX, , roomRightCoordX] = roomCoords;

    const leftY = 0;
    const x = this._getRandomInt(roomLeftCoordX, roomRightCoordX);

    const passageCoords = [x, leftY, x, height - 1];

    this._replaceTiles(TILE_TYPE_GROUND, passageCoords);
  }

  _addRoom() {
    const { coords: roomsCoords } = this.state.map.rooms;

    const roomCoords = this._calcRoomCoords();

    roomsCoords.push(roomCoords);

    this._replaceTiles(TILE_TYPE_GROUND, roomCoords);
  }

  _calcRoomCoords() {
    const { minSize, maxSize } = this.state.map.rooms;
    const { width, height } = this.state.map;

    const roomWidth = this._getRandomInt(minSize, maxSize);
    const roomHeight = this._getRandomInt(minSize, maxSize);

    const leftCornerX = this._getRandomInt(0, width - 1 - roomWidth);
    const leftCornerY = this._getRandomInt(0, height - 1 - roomHeight);

    const roomCoords = [
      leftCornerX,
      leftCornerY,
      leftCornerX + roomWidth,
      leftCornerY + roomHeight,
    ];

    return roomCoords;
  }

  _getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  _getRandomTile(tiles) {
    const randomTile = tiles[this._getRandomInt(0, tiles.length - 1)];

    return randomTile;
  }

  _getGroundTiles() {
    const { tiles } = this.state.map;

    const groundTiles = tiles.filter(tile => tile.type === TILE_TYPE_GROUND);

    return groundTiles;
  }

  _replaceTiles(type, coords) {
    const { tiles } = this.state.map;
    const [leftX, leftY, rightX, rightY] = coords;

    for (let j = leftY; j <= rightY; j++) {
      for (let i = leftX; i <= rightX; i++) {
        const tile = tiles.find(tile => tile.x === i && tile.y === j);
        tile.type = type;
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

  update(data) {
    this._data = data;

    const { tiles } = this._data;

    tiles.forEach(tile => {
      const element = document.querySelector(
        `[data-x="${tile.x}"][data-y="${tile.y}"]`
      );

      element.className = tile.type;
      element.innerHTML = this._generateHealthBarMarkup(tile);
    });
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

  addHandlerMovePlayer(handler) {
    document.addEventListener('keydown', event => handler(event));
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
          <div class=${tile.type} data-x="${tile.x}" data-y="${tile.y}">
            ${this._generateHealthBarMarkup(tile)}
          </div>
        `
      )
      .join('\n');

    return markup;
  }

  _generateHealthBarMarkup(tile) {
    if (tile.type !== TILE_TYPE_PLAYER && tile.type !== TILE_TYPE_ENEMY)
      return '';

    const unit = this._getUnitStateFromTile(tile);

    const unitMaxHp =
      tile.type === TILE_TYPE_PLAYER ? PLAYER_MAX_HP : ENEMIES_MAX_HP;

    const healthPercentage = (unit.hp / unitMaxHp) * 100;

    return /* html */ `
      <div class="health" style="width: ${healthPercentage}%"></div>
    `;
  }

  _getUnitStateFromTile(tile) {
    const { units } = this._data;

    if (tile.type === TILE_TYPE_PLAYER) {
      return units.player;
    } else if (tile.type === TILE_TYPE_ENEMY) {
      const enemy = units.enemies.enemiesParameters.find(
        enemyParameters =>
          enemyParameters.x === tile.x && enemyParameters.y === tile.y
      );

      return enemy;
    }

    return null;
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
    this._model.addPassages();
    this._model.addItems();
    this._model.addUnits();
    this._mapView.addHandlerRender(this._controlMap.bind(this));
    this._mapView.addHandlerMovePlayer(this._controlMovePlayer.bind(this));
  }

  _controlMap() {
    this._mapView.render(this._state.map);
  }

  _controlMovePlayer(event) {
    this._model.movePlayer(event.key);
    this._mapView.update(this._state.map);
  }
}

const game = new Controller();
