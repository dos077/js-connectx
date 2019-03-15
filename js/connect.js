//game methods and variables
const Game = (new_con, new_rows, new_cols, new_board={}, new_turn=1, new_moves=[]) => {
  let board = new_board;
  let rows = new_rows;
  let connect = new_con;
  let cols = new_cols;
  let turn = new_turn;
  let moves = new_moves;
  if(Object.keys(board).length == 0) {
    for(y=0;y<rows;y++) {
      for(x=0;x<cols;x++) {
        board[[x,y]] = 0;
      }
    }
  } 
  const boardKeys = () => {
    keys = [];
    for(y=0;y<rows;y++) {
      for(x=0;x<cols;x++) {
        keys.push([x,y]);
      }
    }
    return keys;
  }
  const movePiece = (x, y) => {
    if(board[[x,y]]==0) {
      moves.push([x,y]);
      board[[x,y]] = playerTurn();
      turn++
      return board[[x,y]];
    } else {
      return false;
    }
  }
  //check for x in a row
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
  //scan the board for winning combo
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
    if(emptyCells().length==0) { return 'draw'; }
    return winner;
  }
  const emptyCells = () => { 
    cells = [];
    keys = boardKeys();
    keys.forEach( function(key) {
      if(board[key]==0) { cells.push(key) }
    });
    return cells;
  }
  const score = (player=1) => { 
    winner = whoWon();
    if(winner=='draw') { return 0; }
    let rawValue = (cols * rows) - turn +1;
    if(winner) { 
      if(player!=winner) { rawValue *= -1; }
      return rawValue;
    }
    return false;
  }
  const movesList = () => { return moves; }
  const playerTurn = () => { return ((turn%2)==1)? 1 : 2; } 
  const clone = () => {
    c = JSON.parse(JSON.stringify([connect,rows,cols,board,turn,moves]));
    return Game(c[0],c[1],c[2],c[3],c[4],c[5]);
  }
  return { movePiece, whoWon, board, score, emptyCells, movesList, clone, playerTurn}
}

//interface adaptor from json to html
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
  //change the square to dsiplay x or o
  const changeSq = (order, styleClass) => {
    let cell = document.getElementById(order);
    cell.classList.remove('empty');
    cell.classList.add(styleClass);
  }
  const displayBoard = () => {
    let board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    board.style.minWidth = `${cols * 30}px`;
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
      board.append(cell);
      let styleClass = 'empty';
      if(game.board[key] == 1 ) {styleClass = 'p1'; }
      else if(game.board[key] == 2 ) { styleClass = 'p2'; }
      changeSq(order, styleClass);
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
      let msg = '';
      if(winner==1) {msg = 'X won!'}
      else if(winner==2) {msg = 'O won!'}
      else {msg= 'Draw.'}
      notice.innerHTML = msg;
      board = document.getElementById('board');
      board.append(notice);
    }
  }
  const move = (cell) => {
    order = parseInt(cell.id);
    let x = order2xy(order)[0]; let y = order2xy(order)[1];
    whoMoved = game.movePiece(x,y);
    if(whoMoved) {
      styleClass = (whoMoved==1)? 'p1' : 'p2';
      changeSq(cell.id, styleClass);
      gameOver();
    }
  }
  return { newGame, move }
}

//highlighting game type after selection
const selectBtn = (btn) => {
  let buttons = document.querySelectorAll('.btn');
  buttons.forEach( function(button) {
    button.classList.remove('select');
  });
  btn.classList.add('select');
}

//ai module
const AI = () => {
  
  const negaMax = (game, a, b) => {
    let alpha = a, beta = b;
    if(game.score() < b) { beta = game.score(); }
    if(b <= a) { return false; }
    console.log(`Game: ${game.movesList()} Alpha: ${alpha} Beta: ${beta}`);
    if( game.whoWon() ) { return game; }
    moves = Object.entries(game.board).filter(keyValue => keyValue[1] == 0).map(keyValue => keyValue[0].split(','));
    var bestGame;
    console.log(`checking ${moves.length} moves`);
    moves.forEach( function(move){
      mockGame = game.clone();
      mockGame.movePiece(move[0],move[1]);
      console.log(`move: ${move}`);
      moveResult = negaMax(mockGame, -(beta-1), -(alpha-1));
      if(moveResult) {
        branchScore = moveResult.score();
        if(branchScore>alpha) { 
          console.log(`found new solution with score: ${branchScore}`);
          bestGame = moveResult;
          alpha = branchScore; 
        }
      }
    });
    return bestGame;
  }

  const alphaBeta = (testcase, a, b, maxPlayer) => {
    let alpha = a, beta = b; let game = testcase;
    let myTurn = (maxPlayer == game.playerTurn());
    if( game.whoWon() ) { return game; }
    let moves = game.emptyCells();
    let bestGame;
    if(myTurn) {
      let bestScore = alpha;
      moves.forEach(function(move){
        if(alpha>=beta) { return; }
        mockGame = game.clone();
        mockGame.movePiece(move[0],move[1]);
        let result = alphaBeta(mockGame, alpha, beta, maxPlayer);
        let branchScore;
        if(result) {
          branchScore = result.score(maxPlayer);
          console.log(`terminal node score ${branchScore} found, comparing against a: ${alpha}`);
          if(branchScore>bestScore) {
            console.log(`max score found ${branchScore} with: ${game.movesList()}`);
            bestScore = branchScore;
            bestGame = result;
          }
          alpha = Math.max(bestScore, alpha);
        }
      });
    } else {
      bestScore = beta;
      moves.forEach(function(move){
        if(alpha>=beta) { return; }
        mockGame = game.clone();
        mockGame.movePiece(move[0],move[1]);
        let result = alphaBeta(mockGame, alpha, beta, maxPlayer);
        let branchScore;
        if(result) { 
          branchScore = result.score(maxPlayer);
          console.log(`terminal node score ${branchScore} found, comparing against b: ${beta}`);
          if(branchScore<bestScore) {
            console.log(`min score found ${branchScore} with: ${game.movesList()}`);
            bestScore = branchScore;
            bestGame = result;
          } 
          beta = Math.min(bestScore, beta);
        }
      });
    }
    return bestGame;
  }

  const node = (moves) => {
    let score, children = [];
    const insert = (child) => { children.push(child); }
    const calculate = (max) => {
      scores = children.map(child => child.score);a
      if(max) { score = Math.max(...scores); }
      else { score = Math.min(...scores); }
      return score;
    }
    return {score, moves, children, insert, calculate}
  }

  const mapTree = (game, player) => {
    let myTurn = (player==game.playerTurn());
    if(game.whoWon()) {
      let score = game.score(player) ;
      let root = node(game.movesList());
      root.score = score;
      return root;
    }
    let root = node(game.movesList());
    let moves = game.emptyCells();
    moves.forEach( function(move){
      childGame = game.clone();
      childGame.movePiece(move[0],move[1]);
      root.insert(mapTree(childGame, player));
    } );
    root.score = root.calculate(myTurn);
    return root;
  }
  /*
  const optimalNode = (route) => {
    let score; let nodeName; let children = [];
    const insert = (child) => { children.push(child); }
    const setName = (newName) => {
      console.log(nodeName);
      nodeName = newName;
      return nodeName; 
    }
    const setScore = (value) => {
      score = value;
    }
    const calculate = (max) => {
      score |= (max)? -999 : 999; 
      children.forEach( function(child) {
        if( max ) { 
          if (score<child.score){
            score = child.score;
            route = child.route;
          } 
        } else if( score> child.score ) {
          score = child.score;
          route = child.route;
        }
      })
      return [score, route];
    }
    return {score, nodeName, route, children, insert, calculate, setName, setScore}
  } */

  const optimalNode = (route) => ({
    route,
    score: null,
    nodeName: null,
    children: [],
    insert(child) { this.children.push(child); },
    setName (newName) {
      console.log(nodeName);
      this.nodeName = newName;
      return this.nodeName; 
    },
    setScore(value){
      this.score = value;
    },
    calculate(max) {
      this.score |= (max)? -999 : 999;
      this.nodeName = (max)? "max" : "min";
      this.children.forEach( (child) => {
        if( max ) {
          if (this.score<child.score){
            this.score = child.score;
            this.route = child.route;
          } 
        } else if( this.score> child.score ) {
          this.score = child.score;
          this.route = child.route;
        }
      })
      return [this.score, this.route];
    }
  });

  const optimalTree = (game, player) => {
    let max = (player==game.playerTurn());
    let root = optimalNode(game.movesList());
    if(game.whoWon()) {
      root.score = game.score(player);
      return root;
    }
    let moves = game.emptyCells();
    moves.forEach( function(move){
      childGame = game.clone();
      childGame.movePiece(move[0],move[1]);
      root.insert(optimalTree(childGame, player));
    } );
    let optimals = root.calculate(max)
    root.score = optimals[0]; root.route = optimals[1];
    return root;
  }

  return { negaMax, alphaBeta, mapTree, optimalTree, optimalNode }
}

let ttt = Game(3,3,3);
//ttt.movePiece(1,1);
//ttt.movePiece(0,1);

tree = AI().optimalTree(ttt,ttt.playerTurn());

//bestGame = AI().alphaBeta(ttt, -(ttt.emptyCells().length), ttt.emptyCells().length, ttt.playerTurn());