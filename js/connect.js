const game = () => {
  var board = {};
  var p1 = new Array();
  var p2 = new Array();
  var rows; var cols; var connect;
  const convert = (x, y) => {
    return `${x}-${y}`;
  }
  const newGame = (connect, rows, cols) => {
    rows = rows;
    connect = connect;
    cols = cols;
    for(y=1;y<=rows;y++) {
      for(x=1;x<=cols;x++) {
        let cor = convert(x, y);
        board[cor] = 0;
      }
    }
    return board;
  }
  const movePiece = (x, y, player) => {
    var cor = convert(x, y);
    if(board[cor]==0) {
      board[cor] = player;
      return true;
    } else {
      return false;
    }
  }
  const whoWon = () => {

  }
  return { newGame, movePiece, whoWon }
}