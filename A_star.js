// Видео человека Conor Bailey https://www.youtube.com/watch?v=nHjqkLV_Tp0&t=721s
let maze = document.querySelector(".maze");
let ctx = maze.getContext('2d');
const COLORS = ["#E5FCFF", "#FFD700", "#228B22", "#B22222"];
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
var newMaze = new Maze();
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
  console.log(x, y)
  newMaze.grid[y][x].color = COLORS[(newMaze.grid[y][x].colorNum + 1) % 4];
  newMaze.grid[y][x].colorNum += 1;
  newMaze.grid[y][x].show(newMaze.size, newMaze.rows, newMaze.columns)
})