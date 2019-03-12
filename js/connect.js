//game methods and variables
const Game = (new_con, new_rows, new_cols) => {
  var board = {};
  var rows = new_rows;
  var connect = new_con;
  var cols = new_cols;
  var turn = 1;
  for(y=0;y<rows;y++) {
    for(x=0;x<cols;x++) {
      board[[x,y]] = 0;
    }
  }
  const movePiece = (x, y) => {
    if(board[[x,y]]==0) {
      board[[x,y]] = turn;
      (turn==1)? turn++ : turn = 1;
      return true;
    } else {
      return false;
    }
  }
  const connectX = (x, y, dx, dy) => {
    var origin = board[[x,y]];
    if(origin==0) {return false;}
    for( k = 1; k < (connect); k++ ) {
      var target = board[ [x+(k*dx), y+(k*dy)] ];
      if(origin != target){ return false; }
      if((k+1)==connect){ 
        return origin; 
      }
    }
  }
  const whoWon = () => {
    var winner = false;
    keys = Object.keys(board);
    for(i=0;i<keys.length;i++) {
      if(board[keys[i]]==0) {continue;}
      let key = keys[i].split(',');
      let x=parseInt(key[0]); let y=parseInt(key[1]);
      var directions = [];
      if(x<=(cols-connect)){
        directions.push([1,0]);
        if(y<=(rows-connect)){ directions.push([1,1]); }
      }
      if(y<=(rows-connect)){
        directions.push([0,1]);
        if(x>=(connect-1)){ directions.push([-1, 1]); }
      }
      if(directions.length==0) {continue;}
      for(j=0;j<directions.length;j++) {
        let direction = directions[j];
        winner = connectX(x, y, direction[0], direction[1]);
        if(winner) { break; }
      }
      if(winner) { break; }
    }
    return winner;
  }
  return { movePiece, whoWon, board }
}

const GameController = () => {
  let rows = 3;
  let cols = 3;
  let connect = 3;
  let game = Game(connect, rows, cols);
  const xy2order = (x, y) => {
    //convert xy cordinates to linear order
    return (y*cols + x);
  }
  const order2xy = (order) => {
    //revert linear order to xy cordinates
    return [order % cols, Math.floor(order/cols)];
  }
  const displayBoard = () => {
    let board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    board.style.minWidth = `${cols * 50}px`;
    board.style.maxWidth = `${cols * 250}px`;
    let keys = Object.keys(game.board);
    keys.forEach( function(key) {
      keyXy = key.split(',');
      let x=parseInt(keyXy[0]); let y=parseInt(keyXy[1]);
      order = xy2order(x, y);
      cell = document.createElement('div');
      cell.id = order;
      cell.style.order = order;
      cell.classList.add('square');
      if(game.board[key] == 1 ) { cell.classList.add('p1'); }
      else if(game.board[key] == 2 ) { cell.classList.add('p2'); }
      else { cell.classList.add('empty'); }
      board.append(cell);
    });
  }
  const addCellClick = () => {
    let cells = document.querySelectorAll('.empty');
    cells.forEach(function(cell){
      cell.addEventListener('click', function() {round.move(this)}, false );
    });
  }
  const newGame = (new_con=connect, new_rows=rows, new_cols=cols) => {
    connect=new_con; rows=new_rows; cols=new_cols;
    game = Game(connect, rows, cols);
    displayBoard();
    addCellClick();
  }
  const gameOver = () => {
    winner = game.whoWon();
    if(winner){
      cells = document.querySelectorAll('.empty');
      cells.forEach(function(cell){
        cell.classList.remove('empty');
      });
      notice = document.createElement('div');
      notice.id = 'notice';
      notice.innerHTML = `<div>Player ${winner} won!</div>`;
      board = document.getElementById('board');
      board.append(notice);
    }
  }
  const move = (cell) => {
    order = parseInt(cell.id);
    let x = order2xy(order)[0]; let y = order2xy(order)[1];
    if(game.movePiece(x, y)) {
      displayBoard();
      gameOver();
      addCellClick();
    }
  }
  return { newGame, move }
}

const selectBtn = (btn) => {
  let buttons = document.querySelectorAll('.btn');
  buttons.forEach( function(button) {
    button.classList.remove('select');
  });
  btn.classList.add('select');
}