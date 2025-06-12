function createImageNavigator(config) {
   const { imageId, imageList } = config;
   const imageEl = document.getElementById(imageId);
   const prevBtn = document.getElementById('prevBtn');
   const nextBtn = document.getElementById('nextBtn');
   const currentPageDisplay = document.getElementById('currentPage');
   const totalPagesDisplay = document.getElementById('totalPages');

   let currentIndex = 0;

   function updateImage() {
      imageEl.src = imageList[currentIndex];
      updateControls();
   }

   function updateControls() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === imageList.length - 1;
      currentPageDisplay.textContent = currentIndex;
      totalPagesDisplay.textContent = imageList.length - 1;
   }

   function goTo(index) {
      if (index < 0) index = 0;
      if (index >= imageList.length) index = imageList.length - 1;
      currentIndex = index;
      updateImage();
   }

   function next() {
      if (currentIndex < imageList.length - 1) {
         currentIndex++;
         updateImage();
         window.scrollTo({
            top: 0,
            behavior: 'smooth'
         });
      }
   }

   function prev() {
      if (currentIndex > 0) {
         currentIndex--;
         updateImage();
         window.scrollTo({
            top: 0,
            behavior: 'smooth'
         });
      }
   }

   // Initial render
   updateControls();

   return { next, prev, goTo };
}
