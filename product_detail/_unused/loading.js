(() => {
  const loadingScreen = document.querySelector('.loading_screen');

  if (!loadingScreen) {
    return;
  }

  const handlePageShow = () => {
    loadingScreen.setAttribute('aria-busy', 'true');
  };

  window.addEventListener('pageshow', handlePageShow);
})();
