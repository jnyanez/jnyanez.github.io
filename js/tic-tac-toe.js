const board = document.getElementById('board');
const status = document.getElementById('status');
let currentPlayer = 'X';
let cells = Array(9).fill(null);
let gameActive = true;

function checkWinner() {
   const winPatterns = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // columns
      [0,4,8], [2,4,6]           // diagonals
   ];

   for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
         return cells[a];
      }
   }

   return cells.every(cell => cell) ? 'draw' : null;
}

function handleClick(index) {
   if (!gameActive || cells[index]) return;

   cells[index] = currentPlayer;
   renderBoard();

   const winner = checkWinner();
   if (winner) {
      gameActive = false;
      status.textContent = winner === 'draw' ? "It's a draw!" : `Player ${winner} wins!`;
   } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      status.textContent = `Player ${currentPlayer}'s turn`;
   }
}

function renderBoard() {
   board.innerHTML = '';
   cells.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = value || '';
      cell.addEventListener('click', () => handleClick(index));
      board.appendChild(cell);
   });
}

function resetGame() {
   cells = Array(9).fill(null);
   currentPlayer = 'X';
   gameActive = true;
   status.textContent = "Player X's turn";
   renderBoard();
}

renderBoard();
