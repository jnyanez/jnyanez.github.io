const words = [
   "sunstation", "comic", "planet", "grayson", "moon", "venus", "mars",
   "jupiter", "saturn", "neptune", "uranus", "galaxy", "orbit", "eclipse", "rocket"
];

const size = 15;
const grid = Array.from({ length: size }, () => Array(size).fill(""));
const wordLocations = {};
const foundWords = new Set();

const directions = [
   [0, 1], [1, 0], [1, 1], [-1, 1], [-1, -1], [1, -1], [0, -1], [-1, 0]
];

const gridEl = document.getElementById("grid");
let isSelecting = false;
let selectedCells = [];
let direction = null;

function getRandomInt(max) {
   return Math.floor(Math.random() * max);
}

function getRandomDirection() {
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
   for (let attempts = 0; attempts < 100; attempts++) {
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
         break;
      }
   }
}

words.forEach(placeWordRandomly);

for (let r = 0; r < size; r++) {
   for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
         grid[r][c] = String.fromCharCode(65 + getRandomInt(26));
      }
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
   }
}

function getDirection(cell1, cell2) {
   const r1 = parseInt(cell1.dataset.row);
   const c1 = parseInt(cell1.dataset.col);
   const r2 = parseInt(cell2.dataset.row);
   const c2 = parseInt(cell2.dataset.col);
   return [Math.sign(c2 - c1), Math.sign(r2 - r1)];
}

function getCell(row, col) {
   return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}

function toggleSelect(cell) {
   if (!cell || cell.classList.contains("found")) return;

   const row = parseInt(cell.dataset.row);
   const col = parseInt(cell.dataset.col);

   if (selectedCells.length === 0) {
      direction = null;
      cell.classList.add("selected");
      selectedCells.push(cell);
      return;
   }

   const firstCell = selectedCells[0];
   const firstRow = parseInt(firstCell.dataset.row);
   const firstCol = parseInt(firstCell.dataset.col);

   if (selectedCells.length === 1) {
      direction = getDirection(firstCell, cell);
      if (direction[0] === 0 && direction[1] === 0) return;
   }

   if (direction) {
      const [dx, dy] = direction;
      let targetLength = selectedCells.length;
      let expectedRow = firstRow + dy * targetLength;
      let expectedCol = firstCol + dx * targetLength;

      const tolerance = 1;
      const distance = Math.abs(expectedRow - row) + Math.abs(expectedCol - col);

      if (distance <= tolerance) {
         const cellOnPath = getCell(expectedRow, expectedCol);
         if (cellOnPath && !cellOnPath.classList.contains("selected")) {
            cellOnPath.classList.add("selected");
            selectedCells.push(cellOnPath);
         }
      } else {
         const lastCell = selectedCells[selectedCells.length - 1];
         const lastRow = parseInt(lastCell.dataset.row);
         const lastCol = parseInt(lastCell.dataset.col);
         if (
            row === lastRow - dy &&
            col === lastCol - dx &&
            selectedCells.length > 1
         ) {
            lastCell.classList.remove("selected");
            selectedCells.pop();
         }
      }
   }
}

function finishSelection() {
   const word = selectedCells.map(c => c.textContent).join("").toLowerCase();
   const reversed = word.split("").reverse().join("");
   const matchedWord = words.find(w => w === word || w === reversed);

   if (matchedWord && !foundWords.has(matchedWord)) {
      selectedCells.forEach(c => c.classList.add("found"));
      const wordItem = document.getElementById(`word-${matchedWord}`);
      if (wordItem) wordItem.classList.add("crossed-off");
      foundWords.add(matchedWord);
      if (foundWords.size === words.length) {
         document.getElementById("status").textContent = "You win! Bonus Tip: Refresh the page for a new puzzle!";
      }
   }

   selectedCells.forEach(c => c.classList.remove("selected"));
   selectedCells = [];
   direction = null;
}

["mousedown", "mousemove", "mouseup"].forEach(event => {
   document.addEventListener(event, e => {
      if (!e.target.classList.contains("cell")) return;
      if (event === "mousedown") {
         isSelecting = true;
         toggleSelect(e.target);
      } else if (event === "mousemove" && isSelecting && e.buttons === 1) {
         toggleSelect(e.target);
      } else if (event === "mouseup") {
         isSelecting = false;
         finishSelection();
      }
   });
});

["touchstart", "touchmove", "touchend"].forEach(event => {
   document.addEventListener(event, e => {
      const gridElement = document.getElementById("grid");
      if (!gridElement) return;

      const isCell = e.target.classList.contains("cell");

      if ((event === "touchstart" || event === "touchmove") && isCell) {
         e.preventDefault();
      }

      const touch = e.touches ? e.touches[0] : null;
      const el = event === "touchend"
         ? null
         : document.elementFromPoint(touch.clientX, touch.clientY);

      if (event === "touchstart" && isCell) {
         isSelecting = true;
         toggleSelect(e.target);
      } else if (event === "touchmove" && isSelecting && el && el.classList.contains("cell")) {
         toggleSelect(el);
      } else if (event === "touchend") {
         isSelecting = false;
         finishSelection();
      }
   }, { passive: false });
});

const wordListItems = document.querySelectorAll("#wordList li");
wordListItems.forEach(item => {
   item.addEventListener("click", () => {
      const word = item.textContent.toUpperCase();
      const cells = Array.from(document.querySelectorAll(".cell"));
      let matchedCells = [];

      for (const cell of cells) {
         const startRow = parseInt(cell.dataset.row);
         const startCol = parseInt(cell.dataset.col);

         for (const [dx, dy] of directions) {
            const temp = [];
            let match = true;

            for (let j = 0; j < word.length; j++) {
               const row = startRow + dy * j;
               const col = startCol + dx * j;
               const target = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
               if (!target || target.textContent.toUpperCase() !== word[j]) {
                  match = false;
                  break;
               }
               temp.push(target);
            }

            if (match) {
               matchedCells = temp;
               break;
            }

            match = true;
            temp.length = 0;
            for (let j = 0; j < word.length; j++) {
               const row = startRow - dy * j;
               const col = startCol - dx * j;
               const target = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
               if (!target || target.textContent.toUpperCase() !== word[j]) {
                  match = false;
                  break;
               }
               temp.push(target);
            }

            if (match) {
               matchedCells = temp;
               break;
            }
         }

         if (matchedCells.length > 0) break;
      }

      matchedCells.forEach(c => {
         c.dataset.originalColor = c.style.color;
         c.style.color = "deeppink";
      });

      setTimeout(() => {
         matchedCells.forEach(c => {
            c.style.color = c.dataset.originalColor || "black";
            delete c.dataset.originalColor;
         });
      }, 2000);
   });
});
