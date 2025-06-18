const words = [
   "sunstation", "comic", "planet", "grayson", "moon", "venus", "mars",
   "jupiter", "saturn", "neptune", "uranus", "galaxy", "orbit", "eclipse", "rocket"
];

const size = 15;
const grid = Array.from({ length: size }, () => Array(size).fill(""));
const wordLocations = {};
let foundWords = new Set();

function getRandomInt(max) {
   return Math.floor(Math.random() * max);
}

function getRandomDirection() {
   const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1], [-1, -1], [1, -1], [0, -1], [-1, 0]
   ];
   return directions[getRandomInt(directions.length)];
}

function canPlaceWord(word, row, col, dx, dy) {
   for (let i = 0; i < word.length; i++) {
      const r = row + i * dy;
      const c = col + i * dx;
      if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] && grid[r][c] !== word[i])) {
         return false;
      }
   }
   return true;
}

function placeWordRandomly(word) {
   let placed = false;
   for (let attempts = 0; attempts < 100 && !placed; attempts++) {
      const [dx, dy] = getRandomDirection();
      const row = getRandomInt(size);
      const col = getRandomInt(size);
      if (canPlaceWord(word, row, col, dx, dy)) {
         for (let i = 0; i < word.length; i++) {
            const r = row + i * dy;
            const c = col + i * dx;
            grid[r][c] = word[i];
            wordLocations[`${r},${c}`] = word;
         }
         placed = true;
      }
   }
}

words.forEach(placeWordRandomly);

for (let r = 0; r < size; r++) {
   for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
         grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
   }
}

const gridEl = document.getElementById("grid");
let isMouseDown = false;
let selectedCells = [];
let direction = null;

function getDirection(cell1, cell2) {
   const r1 = parseInt(cell1.dataset.row);
   const c1 = parseInt(cell1.dataset.col);
   const r2 = parseInt(cell2.dataset.row);
   const c2 = parseInt(cell2.dataset.col);
   return [Math.sign(c2 - c1), Math.sign(r2 - r1)];
}

function isInDirection(cell1, cell2, dir) {
   const r1 = parseInt(cell1.dataset.row);
   const c1 = parseInt(cell1.dataset.col);
   const r2 = parseInt(cell2.dataset.row);
   const c2 = parseInt(cell2.dataset.col);
   const dx = c2 - c1;
   const dy = r2 - r1;
   return dx * dir[1] === dy * dir[0];
}

function evaluateSelection() {
   const word = selectedCells.map(c => c.textContent).join("").toLowerCase();
   if (words.includes(word) && !foundWords.has(word)) {
      selectedCells.forEach(c => c.classList.add("found"));
      const wordItem = document.getElementById(`word-${word}`);
      if (wordItem) wordItem.classList.add("crossed-off");
      foundWords.add(word);
      if (foundWords.size === words.length) {
         document.getElementById("status").textContent = "You win!";
      }
   }
   selectedCells.forEach(c => c.classList.remove("selected"));
   selectedCells = [];
   direction = null;
}

for (let r = 0; r < size; r++) {
   for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener("mousedown", () => {
         isMouseDown = true;
         toggleSelect(cell);
      });

      cell.addEventListener("mouseover", (e) => {
         if (isMouseDown && e.buttons === 1) {
            toggleSelect(cell);
         }
      });

      cell.addEventListener("mouseup", () => {
         isMouseDown = false;
         evaluateSelection();
      });

      gridEl.appendChild(cell);
   }
}

document.addEventListener("mouseup", () => {
   isMouseDown = false;
});

function toggleSelect(cell) {
   const lastCell = selectedCells[selectedCells.length - 1];
   const secondLastCell = selectedCells[selectedCells.length - 2];

   // Prevent unhighlighting the very first selected cell unless mouse is released
   if (cell.classList.contains("selected")) {
      if (cell === lastCell && selectedCells.length > 1) {
         cell.classList.remove("selected");
         selectedCells.pop();
         if (cell.dataset.wasFound) {
            cell.style.backgroundColor = "lightgreen";
            delete cell.dataset.wasFound;
         } else if (cell.dataset.tempColor) {
            cell.style.backgroundColor = cell.dataset.tempColor;
            delete cell.dataset.tempColor;
         }
         if (selectedCells.length <= 1) direction = null;
      } else if (cell === secondLastCell) {
         lastCell.classList.remove("selected");
         if (lastCell.dataset.wasFound) {
            lastCell.style.backgroundColor = "lightgreen";
            delete lastCell.dataset.wasFound;
         } else if (lastCell.dataset.tempColor) {
            lastCell.style.backgroundColor = lastCell.dataset.tempColor;
            delete lastCell.dataset.tempColor;
         }
         selectedCells.pop();
         return;
      }
      return;
   }

   const r = parseInt(cell.dataset.row);
   const c = parseInt(cell.dataset.col);

   if (selectedCells.length === 0) {
      direction = null;
   } else if (selectedCells.length === 1) {
      direction = getDirection(selectedCells[0], cell);
   } else {
      const [dx, dy] = direction;
      const lastRow = parseInt(lastCell.dataset.row);
      const lastCol = parseInt(lastCell.dataset.col);
      const expectedRow = lastRow + dy;
      const expectedCol = lastCol + dx;

      const deltaX = c - lastCol;
      const deltaY = r - lastRow;
      const moveDirection = [Math.sign(deltaX), Math.sign(deltaY)];

      if (moveDirection[0] !== dx || moveDirection[1] !== dy) {
         return;
      }

      if (r !== expectedRow || c !== expectedCol) {
         const nextCell = document.querySelector(`.cell[data-row='${expectedRow}'][data-col='${expectedCol}']`);
         if (nextCell && !nextCell.classList.contains("selected")) {
            toggleSelect(nextCell);
         }
         return;
      }
   }

   if (cell.classList.contains("found")) {
      cell.dataset.wasFound = "true";
      cell.style.backgroundColor = "yellow";
   }

   cell.classList.add("selected");
   selectedCells.push(cell);
}

// Prevent scrolling during touch on mobile
document.addEventListener("touchstart", function (e) {
   if (e.target.classList.contains("cell")) {
      e.preventDefault();
   }
}, { passive: false });

document.addEventListener("touchmove", function (e) {
   if (e.target.classList.contains("cell")) {
      e.preventDefault();
   }
}, { passive: false });

document.addEventListener("mouseup", () => {
   document.querySelectorAll(".cell").forEach(cell => {
      if (cell.dataset.wasFound) {
         cell.style.backgroundColor = "lightgreen";
         delete cell.dataset.wasFound;
      }
   });

   const selectedWord = selectedCells.map(cell => cell.textContent).join("").toUpperCase();
   const reversedWord = selectedWord.split("").reverse().join("");
   const words = Array.from(document.querySelectorAll("#wordList li"));

   words.forEach(item => {
      const word = item.textContent.toUpperCase();
      if (selectedWord === word || reversedWord === word) {
         selectedCells.forEach(cell => {
            cell.classList.add("found");
            cell.style.backgroundColor = "lightgreen";
         });
         item.style.textDecoration = "line-through";
      }
   });

   selectedCells = [];
   direction = null;
});

document.querySelectorAll("#wordList li").forEach(item => {
   item.addEventListener("click", () => {
      const word = item.textContent.toUpperCase();
      const cells = Array.from(document.querySelectorAll(".cell"));
      let matchedCells = [];

      const directions = [
         [0, 1], [1, 0], [1, 1], [-1, 1], [-1, -1], [1, -1], [0, -1], [-1, 0]
      ];

      for (let i = 0; i < cells.length; i++) {
         const startCell = cells[i];
         const startRow = parseInt(startCell.dataset.row);
         const startCol = parseInt(startCell.dataset.col);

         for (const [dx, dy] of directions) {
            const tempCells = [];
            let match = true;
            for (let j = 0; j < word.length; j++) {
               const row = startRow + dy * j;
               const col = startCol + dx * j;
               const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
               if (!cell || cell.textContent.toUpperCase() !== word[j]) {
                  match = false;
                  break;
               }
               tempCells.push(cell);
            }
            if (match) {
               matchedCells = tempCells;
               break;
            }
         }

         // Reversed direction
         if (matchedCells.length === 0) {
            for (const [dx, dy] of directions) {
               const tempCells = [];
               let match = true;
               for (let j = 0; j < word.length; j++) {
                  const row = startRow - dy * j;
                  const col = startCol - dx * j;
                  const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
                  if (!cell || cell.textContent.toUpperCase() !== word[j]) {
                     match = false;
                     break;
                  }
                  tempCells.push(cell);
               }
               if (match) {
                  matchedCells = tempCells;
                  break;
               }
            }
         }

         if (matchedCells.length > 0) break;
      }

      matchedCells.forEach(cell => {
         cell.dataset.originalColor = cell.style.color;
         cell.style.color = "deeppink";
      });

      setTimeout(() => {
         matchedCells.forEach(cell => {
            cell.style.color = cell.dataset.originalColor || "black";
            delete cell.dataset.originalColor;
         });
      }, 2000);
   });
});

