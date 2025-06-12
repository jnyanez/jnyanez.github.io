function showPopup(imageSrc) {
  document.getElementById('popup-img').src = imageSrc;
  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('popup-img').src = '';
}
