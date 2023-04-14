// Видео человека Conor Bailey https://www.youtube.com/watch?v=nHjqkLV_Tp0&t=721s
let maze = document.querySelector(".maze");
let ctx = maze.getContext('2d');
const COLORS = ["#E5FCFF", "#FFD700", "#228B22", "#B22222", '#383e70'];
let current;
let inputSize = document.querySelector("#maze_size");

class Maze {
  constructor(n) {
    this.size = Math.floor(500/n)*n;
    this.columns = n;
    this.rows = n;
    this.grid = [];
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
          let cell = new Cell(r, c);
          cell.color = COLORS[0];
          cell.colorNum = 0;
          row.push(cell);
      }
      this.grid.push(row);
    }
  }

  draw() {
    maze.width = this.size;
    maze.height = this.size;
    for (let r = 0; r < this.rows + 0; r++) {
      for (let c = 0; c < this.columns + 0; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
  }
}

class Cell {
  constructor(rowNum, colNum, color, colorNum) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.color = color;
    this.colorNum = colorNum;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
  }

  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;
    ctx.strokeStyle = "#050505";
    ctx.lineWidth = 0;
    if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
    if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
    if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
    if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    ctx.rect(x, y, size / columns, size / rows);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
let newMaze = new Maze();
let mazeSize;
inputSize.addEventListener("input", ()=>{
  mazeSize = parseInt(inputSize.value)
  newMaze = new Maze(mazeSize)
  newMaze.setup();
  newMaze.draw();
});
newMaze.setup();
newMaze.draw();
function getCursorPosition(maze, event) {
  const rect = maze.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {x: x, y: y};
}
maze.addEventListener('click', function(e) {
  let { x, y } = getCursorPosition(maze, e);
  x = Math.floor(x / (newMaze.size / mazeSize));
  y = Math.floor(y / (newMaze.size / mazeSize))
  newMaze.grid[y][x].colorNum = (newMaze.grid[y][x].colorNum + 1) % 4;
  newMaze.grid[y][x].color = COLORS[newMaze.grid[y][x].colorNum % 4];
  newMaze.grid[y][x].show(newMaze.size, newMaze.rows, newMaze.columns)
})
let startR = 0;
let startC = 0;
let finishR = 0
let finishC = 0;
for (let r = 0; r < mazeSize + 0; r++) {
  for (let c = 0; c < mazeSize + 0; c++) {
    if (newMaze.grid[r][c].colorNum == 2){
      startR = r;
      startC = c
    }
    if (newMaze.grid[r][c].colorNum == 3){
      finishR = r;
      finishC = c;
    }
  }
}
console.log(startR, startC, finishR, finishC)
document.getElementById("clickMe").onclick = function() { SolveTheMaze(startR, startC, finishR, finishC) };

function SolveTheMaze(startR, startC, finishR, finishC){
  function checkPath(startR, startC, finishR, finishC) {
    newMaze.grid[startR][startC].colorNum = 4;
    let siblings = getValidSib();
    if (siblings.length > 0) {
      for (let i = 0; i < siblings.length; i++) {
        let currentR = siblings[i][0];
        let currentC = siblings[i][1];
        let isSolved = currentR === finishR && current.C === finishC;
        let notVisited = newMaze[currentR][currentC].colorNum !== 4;
  
        if (isSolved || (notVisited && checkPath(currentR, currentC, finishR, finishC))) {
          return true;
        }
      }
    }
    return false;
  }
  
  function getValidSib(R, C) {
    let x = R
    let y = C
    let cords = [];
    if (newMaze.grid[y - 1][x] !== undefined) {
      cords.push({ x: x, y: y - 1, val: newMaze.grid[y - 1][x].colornum});
    }
    if (newMaze.grid[y + 1][x] !== undefined) {
      cords.push({ x: x, y: y + 1, val: newMaze.grid[y + 1][x].colornum});
    }
    if (newMaze.grid[y][x - 1] !== undefined) {
      cords.push({ x: x - 1, y: y, val: newMaze.grid[y][x - 1].colornum});
    }
    if (newMaze.grid[y][x + 1] !== undefined) {
      cords.push({ x: x + 1, y: y, val: newMaze.grid[y][x + 1].colornum});
    }
  
    return cords.filter((crd) => crd.val === 0);
  }
  if (checkPath(startR, startC, finishR, finishC)){
    for (let r = 0; r < mazeSize + 0; r++) {
      for (let c = 0; c < mazeSize + 0; c++) {
        newMaze.grid[r][c].show(newMaze.size, newMaze.rows, newMaze.columns)
      }
    }

  }
  else
    alarm("не повезло не фартануло")
}