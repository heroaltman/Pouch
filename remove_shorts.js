function removeShortsSection() {
  const shortsSection = document.querySelector(
    'ytd-rich-section-renderer.ytd-rich-grid-renderer:has(ytd-rich-shelf-renderer[is-shorts=""])'
  );
  if (shortsSection) {
    shortsSection.remove();
  }
}

removeShortsSection();

// Remove shorts when the page content is updated
const observer = new MutationObserver(removeShortsSection);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
