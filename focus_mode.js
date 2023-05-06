function executeScript() {
  const videoArray = JSON.parse(localStorage.getItem("Pouch-YT-Videos")) || [];

  function createThumbnailObserver(element, newThumbnailSrc) {
    const thumbnailObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "src"
        ) {
          const target = mutation.target;
          if (target.src !== newThumbnailSrc) {
            target.src = newThumbnailSrc;
            console.log(`Thumbnail updated again: ${target.src}`);
          }
        }
      });
    });

    const config = { attributes: true, childList: false, subtree: false };
    thumbnailObserver.observe(element, config);

    setTimeout(() => {
      thumbnailObserver.disconnect();
      console.log("Thumbnail observer disconnected");
    }, 5000);
  }

  function editVideoElements() {
    const videoElements = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer"
    );

    videoElements.forEach((element, index) => {
      const videoData = videoArray[index];

      if (videoData) {
        const anchors = element.querySelectorAll('a[href^="/watch?v="]');
        const title = element.querySelector("#video-title");
        const thumbnail = element.querySelector("yt-image img");
        const channelLogo = element.querySelector("yt-img-shadow#avatar img");
        const timestamp = element.querySelector(
          "ytd-thumbnail-overlay-time-status-renderer span#text"
        );
        const channelNameElement = element.querySelector(
          "yt-formatted-string.ytd-channel-name"
        );
        const viewCountElement = element.querySelector(
          "span.style-scope.ytd-video-meta-block"
        );

        if (title) {
          const originalTitle = title.textContent;
          const newTitle = videoData.title || "";
          title.textContent = newTitle;
          title.setAttribute("title", newTitle);
          console.log(`Replaced title: ${originalTitle} with ${newTitle}`);
        }
        if (thumbnail) {
          const originalThumbnailSrc = thumbnail.src;
          const newThumbnailSrc = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`;
          thumbnail.src = newThumbnailSrc;
          thumbnail.alt = videoData.title || "";
          console.log(
            `Replaced thumbnail: ${originalThumbnailSrc} with ${newThumbnailSrc}`
          );
          createThumbnailObserver(thumbnail, newThumbnailSrc);
        }
        if (channelLogo) {
          const originalLogoSrc = channelLogo.src;
          const newLogoSrc = videoData.channelLogoUrl || "";
          channelLogo.src = newLogoSrc;
          console.log(`Replaced logo: ${originalLogoSrc} with ${newLogoSrc}`);
        }
        if (timestamp) timestamp.textContent = videoData.duration || "";
        if (anchors.length > 0) {
          anchors.forEach((anchor) => {
            const originalUrl = anchor.href;
            const newUrl = videoData.url || "";
            anchor.href = newUrl;
            console.log(`Replaced URL: ${originalUrl} with ${newUrl}`);
          });
        }
        if (channelNameElement)
          channelNameElement.textContent = videoData.channelName || "";
        if (viewCountElement)
          viewCountElement.textContent = videoData.viewCount || "";
      }
    });
  }

  if (window.location.pathname === "/") {
    const observer = new MutationObserver((mutations) => {
      const videoElements = document.querySelectorAll(
        "ytd-rich-item-renderer, ytd-video-renderer"
      );

      if (videoElements.length > 0) {
        editVideoElements();
        observer.disconnect;
      }
    });

    observer.observe(document, { childList: true, subtree: true });
  }
}

function checkAndExecuteScript() {
  chrome.storage.sync.get("mode", ({ mode }) => {
    if (mode === "focus") {
      executeScript();
    }
  });
}

checkAndExecuteScript();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.mode === "focus") {
    localStorage.setItem("openAIKey", request.openAIKey);
    localStorage.setItem("pouchVideoInterest", request.pouchVideoInterest);
    executeScript();
  } else if (request.mode === "chill") {
    localStorage.setItem("openAIKey", request.openAIKey);
    localStorage.setItem("pouchVideoInterest", request.pouchVideoInterest);
    location.reload();
  }
});
