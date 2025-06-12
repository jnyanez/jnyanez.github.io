document.addEventListener("DOMContentLoaded", function() {
   console.log("Welcome to Grayson's Site!");
});

fetch("header.html")
   .then(response => response.text())
   .then(data => {
      document.getElementById("site-header").innerHTML = data;
   });

fetch("footer.html")
   .then(response => response.text())
   .then(data => {
      document.getElementById("site-footer").innerHTML = data;
   });
