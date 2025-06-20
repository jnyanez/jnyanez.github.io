document.addEventListener("DOMContentLoaded", function () {
   const words = JSON.parse(document.getElementById("wordData").textContent);

   const wordList = document.getElementById("wordList");
   wordList.innerHTML = "";

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
   let temporarilyOverriddenFound = new Set();

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
         if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] && grid[r][c] !== word[i].toUpperCase())) {
            return false;
         }
      }
      return true;
   }

   function placeWordRandomly(word) {
      const upper = word.toUpperCase();
      for (let attempts = 0; attempts < 100; attempts++) {
         const [dx, dy] = getRandomDirection();
         const row = getRandomInt(size);
         const col = getRandomInt(size);
         if (canPlaceWord(upper, row, col, dx, dy)) {
            for (let i = 0; i < upper.length; i++) {
               const r = row + i * dy;
               const c = col + i * dx;
               grid[r][c] = upper[i];
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

   function toggleSelect(cell) {
      const lastCell = selectedCells[selectedCells.length - 1];
      if (cell === lastCell) return;

      const secondLastCell = selectedCells[selectedCells.length - 2];

      if (cell.classList.contains("selected")) {
         if (cell === lastCell && selectedCells.length > 1) {
            cell.classList.remove("selected");
            selectedCells.pop();
            if (temporarilyOverriddenFound.has(cell)) {
               cell.classList.add("found");
               temporarilyOverriddenFound.delete(cell);
            }
         } else if (cell === secondLastCell) {
            lastCell.classList.remove("selected");
            selectedCells.pop();
            if (temporarilyOverriddenFound.has(lastCell)) {
               lastCell.classList.add("found");
               temporarilyOverriddenFound.delete(lastCell);
            }
         }
         return;
      }

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
         if (parseInt(cell.dataset.row) !== expectedRow || parseInt(cell.dataset.col) !== expectedCol) {
            return;
         }
      }

      if (cell.classList.contains("found")) {
         cell.classList.remove("found");
         temporarilyOverriddenFound.add(cell);
      }

      cell.classList.add("selected");
      selectedCells.push(cell);
   }

   function finishSelection() {
      const word = selectedCells.map(c => c.textContent).join("").toLowerCase();
      const reversed = word.split("").reverse().join("");
      const matchedWord = words.find(w => w.toLowerCase() === word || w.toLowerCase() === reversed);

      if (matchedWord && !foundWords.has(matchedWord)) {
         selectedCells.forEach(c => c.classList.add("found"));
         const wordItem = document.getElementById(`word-${matchedWord}`);
         if (wordItem) wordItem.classList.add("crossed-off");
         foundWords.add(matchedWord);
         if (foundWords.size === words.length) {
            showPopup();
         }
      } else {
         temporarilyOverriddenFound.forEach(cell => {
            cell.classList.remove("selected");
            cell.classList.add("found");
         });
      }

      selectedCells.forEach(c => c.classList.remove("selected"));
      selectedCells = [];
      temporarilyOverriddenFound.clear();
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
         if (event !== "touchend" && e.target.classList.contains("cell")) {
            e.preventDefault();
         }

         const touch = e.touches ? e.touches[0] : null;
         const el = event === "touchend"
            ? null
            : document.elementFromPoint(touch.clientX, touch.clientY);
         if (event === "touchstart" && e.target.classList.contains("cell")) {
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

   // Add hint click behavior directly when creating <li>
   words.forEach(word => {
      const li = document.createElement("li");
      li.id = `word-${word}`;
      li.textContent = word.toUpperCase();
      li.addEventListener("click", () => {
         const upperWord = word.toUpperCase();
         const cells = Array.from(document.querySelectorAll(".cell"));
         let matchedCells = [];

         for (const cell of cells) {
            const startRow = parseInt(cell.dataset.row);
            const startCol = parseInt(cell.dataset.col);

            for (const [dx, dy] of directions) {
               const temp = [];
               let match = true;

               for (let j = 0; j < upperWord.length; j++) {
                  const row = startRow + dy * j;
                  const col = startCol + dx * j;
                  const target = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
                  if (!target || target.textContent !== upperWord[j]) {
                     match = false;
                     break;
                  }
                  temp.push(target);
               }

               if (match) {
                  matchedCells = temp;
                  break;
               }

               // Reverse check
               match = true;
               temp.length = 0;
               for (let j = 0; j < upperWord.length; j++) {
                  const row = startRow - dy * j;
                  const col = startCol - dx * j;
                  const target = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
                  if (!target || target.textContent !== upperWord[j]) {
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

      wordList.appendChild(li);
   });

   function showPopup() {
      const popup = document.getElementById("popup");
      popup.style.display = "flex";
   }

   window.closePopup = function () {
      const popup = document.getElementById("popup");
      popup.style.display = "none";
   }
});
