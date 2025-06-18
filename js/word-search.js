const words = [
   "sunstation", "comic", "planet", "moon", "sun", "venus", "mars",
   "jupiter", "saturn", "neptune", "uranus", "galaxy", "orbit", "eclipse", "rocket"
];

const size = 15;
const grid = Array.from({ length: size }, () => Array(size).fill(""));

function placeWord(word) {
   const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [-1, 1],  // diagonal up-right
   ];

   let placed = false;
   let attempts = 0;

   while (!placed && attempts < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      let r = row, c = col;
      let fits = true;

      for (let i = 0; i < word.length; i++) {
         if (
            r < 0 || r >= size || c < 0 || c >= size ||
            (grid[r][c] && grid[r][c] !== word[i])
         ) {
            fits = false;
            break;
         }
         r += dir[0];
         c += dir[1];
      }

      if (fits) {
         r = row;
         c = col;
         for (let i = 0; i < word.length; i++) {
            grid[r][c] = word[i];
            r += dir[0];
            c += dir[1];
         }
         placed = true;
      }

      attempts++;
   }
}

// Place all words
words.forEach(placeWord);

// Fill in remaining spaces with random letters
for (let r = 0; r < size; r++) {
   for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
         grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
   }
}

// Render grid with interaction
let isMouseDown = false;

const gridEl = document.getElementById("grid");
for (let r = 0; r < size; r++) {
   for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];

      cell.addEventListener("mousedown", (e) => {
         isMouseDown = true;
         cell.classList.toggle("selected");
      });

      cell.addEventListener("mouseover", (e) => {
         if (isMouseDown && e.buttons === 1) {
            cell.classList.add("selected");
         }
      });

      cell.addEventListener("mouseup", () => {
         isMouseDown = false;
      });

      gridEl.appendChild(cell);
   }
}

document.addEventListener("mouseup", () => {
   isMouseDown = false;
});

document.getElementById("wordList").textContent = "Find these words: " + words.join(", ");
