// F  H  N E S W
// 32 16 8 4 2 1

logGrid = function() {
  var rows = [];
  for(var x = 0; x < _grid.length; x++) {
    var row = [];
    for(var y = 0; y < _grid[x].length; y++) {
      var cell = _grid[x][y];
      row[y] = "" + (cell < 10 ? " "+cell : cell);
    }
    rows[x] = row.join(" ");
  }
  console.info(rows.join("\n"));
};

var lvl1 = [
  5, 5,
  20,  6, 10, 20, 20,
  10, 10,  6, 20, 10,
   7,  6, 10,  6,  7,
   7, 20, 10, 10, 10,
   6, 42,  7,  6, 20
];

var _grid = [],
    _factory;

var TYPE = {
  FACTORY: 2,
  HOUSE: 1,
  NONE: 0
};

var noContextMenu = function(e) {
  e.stopPropagation();
  e.preventDefault();
};

var renderAll = function() {
  for(var x = 0; x < _grid.length; x++) {
    for(var y = 0; y < _grid[x].length; y++) {
      _grid[x][y].render();
    }
  }
  if(document.querySelectorAll("div[data-power=\"0\"]").length == 0) {
    alert("Solved!");
  }
}

var Tile = function(x, y, data){
  var self = this,
      data = data,
      type,
      x = x,
      y = y,
      links = data & 15,
      domEl,
      power = false;

  var getLayout = function Tile__getLayout() {
    switch(links) {
      case 1: case 2: case 4: case 8:
        return 'O'; break;
      case 3: case 6: case 9: case 12:
        return 'L'; break;
      case 5: case 10:
        return 'I'; break;
      case 7: case 11: case 13: case 14:
        return 'T'; break;
    }
  }

  var getRotation = function Tile__getRotation() {
    switch(links) {
      case 1: case 3: case 5: case 7:
        return 0; break;
      case 2: case 6: case 10: case 14:
        return 90; break;
      case 4: case 12: case 13:
        return 180; break;
      case 8: case 9: case 11:
        return 270; break;
    }
  }

  var getNeighbor = function Tile_getNeighbor(direction) {
    switch(direction) {
      case 1:
        return (links & 1) == 1 && x > 0 ? _grid[x-1][y] : false; break;
      case 2:
        return (links & 2) == 2 && y < _grid[x].length-1 ? _grid[x][y+1] : false; break;
      case 4:
        return (links & 4) == 4 && x < _grid.length-1 ? _grid[x+1][y] : false; break;
      case 8:
        return (links & 8) == 8 && y > 0 ? _grid[x][y-1] : false; break;
      default:
        return false; break;
    }
  }

  var rotateLeft = function Tile__rotateLeft() {
    var turnover = (links & 1) == 1;
    links >>= 1;
    if(turnover) {
      links |= 8;
    }
    renderAll();
  };
  var rotateRight = function Tile__rotateRight() {
    var turnover = (links & 8) == 8;
    links <<= 1;
    links &= 15;
    if(turnover) {
      links |= 1;
    }
    renderAll();
  };

  this.isFactory = function Tile__isFactory() {
    return type == TYPE.FACTORY;
  }
  this.isConnected = function Tile__isConnected(direction) {
    return (links & direction) == direction;
  }

  this.hasPower = function Tile__hasPower(checklist) {

    if(self.isFactory()) {
      return true;
    }

    if(!checklist) {
      var checklist = [];
    }
    checklist.push(self);
    var n = false;
    if(false !== (n = getNeighbor(1)) && n.isConnected(4) && checklist.indexOf(n) < 0 && n.hasPower(checklist)) {
      self.lightUp();
      return true;
    }
    if(false !== (n = getNeighbor(2)) && n.isConnected(8) && checklist.indexOf(n) < 0 && n.hasPower(checklist)) {
      self.lightUp();
      return true;
    }
    if(false !== (n = getNeighbor(4)) && n.isConnected(1) && checklist.indexOf(n) < 0 && n.hasPower(checklist)) {
      self.lightUp();
      return true;
    }
    if(false !== (n = getNeighbor(8)) && n.isConnected(2) && checklist.indexOf(n) < 0 && n.hasPower(checklist)) {
      self.lightUp();
      return true;
    }

    return false;
  }

  this.lightUp = function Tile__lightUp(checklist) {
    if(!checklist) {
      var checklist = [];
    }
    checklist.push(self);
    var n = false;
    if(false !== (n = getNeighbor(1)) && n.isConnected(4) && checklist.indexOf(n) < 0 && !n.hasPower(checklist)) {
      n.lightUp(checklist);
    }
    if(false !== (n = getNeighbor(2)) && n.isConnected(8) && checklist.indexOf(n) < 0 && !n.hasPower(checklist)) {
      n.lightUp(checklist);
    }
    if(false !== (n = getNeighbor(4)) && n.isConnected(1) && checklist.indexOf(n) < 0 && !n.hasPower(checklist)) {
      n.lightUp(checklist);
    }
    if(false !== (n = getNeighbor(8)) && n.isConnected(2) && checklist.indexOf(n) < 0 && !n.hasPower(checklist)) {
      n.lightUp(checklist);
    }
  }
  
  this.render = function Tile__render() {
    domEl.setAttribute("data-rotation", getRotation());
    domEl.setAttribute("data-power", self.hasPower() ? "1" : "0");
  };

  this._x = x;
  this._y = y;

  if((data & 16) == 16) {
    if((data & 32) == 32) { 
      throw new TypeError("Corrupt data. Cell " + x + "|" + y + " has set both house and factory");
    } else {
      type = TYPE.HOUSE;
    }
  } else if((data & 32) == 32) {
    type = TYPE.FACTORY;
  }

  if(links == 0) {
    throw new TypeError("Corrupt data. Cell " + x + "|" + y + " has no lines");
  }

  domEl = document.createElement("div");
  domEl.classList.add("tile");
  if(type == TYPE.HOUSE) {
    domEl.classList.add("house");
  } else if(type == TYPE.FACTORY) {
    domEl.classList.add("factory");
  }
  domEl.setAttribute("data-layout", getLayout());
  domEl.oncontextmenu = noContextMenu;
  domEl.onmouseup = function(e) {
    if(e.which == 3) {
      rotateLeft();
    } else if(e.which == 1) {
      rotateRight();
    }
  }
  document.body.appendChild(domEl);


  this.toString = function Tile__toString() {
    switch(links) {
      case 1:  return "^"; break;
      case 2:  return "´"; break;
      case 3:  return "└"; break;
      case 4:  return ","; break;
      case 5:  return "|"; break;
      case 6:  return "┌"; break;
      case 7:  return "├"; break;
      case 8:  return "`"; break;
      case 9:  return "┘"; break;
      case 10: return "─"; break;
      case 11: return "┴"; break;
      case 12: return "┐"; break;
      case 13: return "┤"; break;
      case 14: return "┬"; break;
    }
  }
};


var loadGame = function __loadGame(data) {
  var sizeX = data[0],
      sizeY = data[1];
  
  if(data.length - 2 != sizeX * sizeY) {
    throw new TypeError("Corrupt data. Grid size specification does not match data size");
  }

  document.body.style.width = (sizeY * 110) + "px";

  for(var x = 0, i = 2; x < sizeX; x++) {
    var row = [];
    for(var y = 0; y < sizeY; y++, i++) {
      row[y] = new Tile(x, y, data[i]);
    }
    _grid[x] = row;
  }
  for(var x = 0; x < sizeX; x++) {
    for(var y = 0; y < sizeY; y++) {
      _grid[x][y].render();
    }
  }
  logGrid();
};

var clearGame = function __clearGame() {
  _grid = [];
  document.body.innerHTML = "";
}

loadGame(lvl1);
