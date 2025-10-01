// Ensure all swatches display their color from data-color
document.querySelectorAll('.swatch').forEach(btn => {
  const c = btn.dataset.color;
  if (c) btn.style.background = c;
});

(function () {
   // Wait until DOM is ready (safe even if script is at the bottom)
   if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
   } else {
      setup();
   }

   function setup() {
      // ---- Elements ----
      const canvas = document.getElementById("pad");
      if (!canvas) {
         console.error("Canvas #pad not found.");
         return;
      }
      const ctx = canvas.getContext("2d");

      const swatches = Array.from(document.querySelectorAll(".swatch"));
      const customInput = document.getElementById("customColor");
      const addCustomBtn = document.getElementById("addCustom");
      const brushSize = document.getElementById("brushSize");
      const eraserBtn = document.getElementById("eraser");
      const clearBtn = document.getElementById("clear");

      // ---- State ----
      let drawing = false;
      let strokeColor = "#ff0000";
      let strokeWidth = brushSize ? parseInt(brushSize.value, 10) || 12 : 12;
      let erasing = false;

      // ---- Canvas sizing / HiDPI ----
      function fitCanvasToCSS() {
         const rect = canvas.getBoundingClientRect();
         const dpr = window.devicePixelRatio || 1;
         // Reset any transform first to avoid compounding scale
         ctx.setTransform(1, 0, 0, 1, 0, 0);
         canvas.width = Math.max(1, Math.round(rect.width * dpr));
         canvas.height = Math.max(1, Math.round(rect.height * dpr));
         ctx.scale(dpr, dpr);

         // Paint white background
         ctx.save();
         ctx.globalCompositeOperation = "source-over";
         ctx.fillStyle = "#ffffff";
         ctx.fillRect(0, 0, rect.width, rect.height);
         ctx.restore();
      }

      function initOrResize() {
         fitCanvasToCSS();
      }

      window.addEventListener("resize", initOrResize);
      initOrResize();

      // ---- Helpers ----
      function posFromEvent(e) {
         const rect = canvas.getBoundingClientRect();
         const touch =
            (e.touches && e.touches[0]) ||
            (e.changedTouches && e.changedTouches[0]);
         const clientX = touch ? touch.clientX : e.clientX;
         const clientY = touch ? touch.clientY : e.clientY;
         return { x: clientX - rect.left, y: clientY - rect.top };
      }

      function beginStroke(x, y) {
         drawing = true;
         ctx.beginPath();
         ctx.moveTo(x, y);
      }

      function drawTo(x, y) {
         if (!drawing) return;
         ctx.lineCap = "round";
         ctx.lineJoin = "round";
         ctx.lineWidth = strokeWidth;
         if (erasing) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)"; // color ignored under destination-out
         } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = strokeColor;
         }
         ctx.lineTo(x, y);
         ctx.stroke();
      }

      function endStroke() {
         drawing = false;
         ctx.closePath();
      }

      // ---- Mouse ----
      canvas.addEventListener("mousedown", (e) => {
         const p = posFromEvent(e);
         beginStroke(p.x, p.y);
      });
      canvas.addEventListener("mousemove", (e) => {
         const p = posFromEvent(e);
         drawTo(p.x, p.y);
      });
      window.addEventListener("mouseup", endStroke);

      // ---- Touch ----
      canvas.addEventListener(
         "touchstart",
         (e) => {
            const p = posFromEvent(e);
            beginStroke(p.x, p.y);
            e.preventDefault();
         },
         { passive: false }
      );
      canvas.addEventListener(
         "touchmove",
         (e) => {
            const p = posFromEvent(e);
            drawTo(p.x, p.y);
            e.preventDefault();
         },
         { passive: false }
      );
      window.addEventListener("touchend", endStroke);

      // ---- UI wiring ----
      function selectSwatch(btn) {
         swatches.forEach((s) => s.setAttribute("aria-selected", "false"));
         btn.setAttribute("aria-selected", "true");
         strokeColor = btn.dataset.color;
         erasing = false;
         if (eraserBtn) eraserBtn.setAttribute("aria-pressed", "false");
      }

      swatches.forEach((btn) => {
         btn.addEventListener("click", () => selectSwatch(btn));
      });

      if (addCustomBtn && customInput) {
         addCustomBtn.addEventListener("click", () => {
            const val = customInput.value || "#000000";
            // Find the Colors group container to insert into
            const colorsGroup = addCustomBtn.closest('.group[aria-label="Colors"]') || addCustomBtn.parentElement;
            const divider = colorsGroup.querySelector(".divider");

            // Reuse existing custom, or create one
            let custom = colorsGroup.querySelector('.swatch[data-role="custom"]');
            if (!custom) {
               custom = document.createElement("button");
               custom.className = "swatch";
               custom.setAttribute("aria-label", "Custom");
               custom.dataset.role = "custom";
               // Insert just before the divider so it sits with the built-ins
               if (divider) {
                  colorsGroup.insertBefore(custom, divider);
               } else {
                  colorsGroup.appendChild(custom);
               }
               // Track it in our swatches array for click handling
               swatches.push(custom);
               custom.addEventListener("click", () => selectSwatch(custom));
            }

            custom.dataset.color = val;
            custom.style.background = val;
            selectSwatch(custom);
         });
      }

      if (brushSize) {
         brushSize.addEventListener("input", () => {
            strokeWidth = parseInt(brushSize.value, 10) || 1;
         });
      }

      if (eraserBtn) {
         eraserBtn.addEventListener("click", () => {
            erasing = !erasing;
            eraserBtn.setAttribute("aria-pressed", String(erasing));
         });
      }

      if (clearBtn) {
         clearBtn.addEventListener("click", () => {
            const ok = confirm(
               "Are you sure? All contents within the drawing will be cleared."
            );
            if (!ok) return;
            const rect = canvas.getBoundingClientRect();
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to clear reliably
            const dpr = window.devicePixelRatio || 1;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // restore DPR scaling for continued drawing
            ctx.scale(dpr, dpr);
            ctx.restore();
         });
      }

      // ---- Keyboard helpers ----
      window.addEventListener("keydown", (e) => {
         if (e.key === "e" || (e.ctrlKey && e.key.toLowerCase() === "e")) {
            eraserBtn && eraserBtn.click();
         }
         if (brushSize) {
            if (e.key === "[") {
               brushSize.value = Math.max(
                  1,
                  (parseInt(brushSize.value, 10) || 1) - 1
               );
               brushSize.dispatchEvent(new Event("input"));
            }
            if (e.key === "]") {
               brushSize.value = Math.min(
                  60,
                  (parseInt(brushSize.value, 10) || 1) + 1
               );
               brushSize.dispatchEvent(new Event("input"));
            }
         }
      });
   }
})();
