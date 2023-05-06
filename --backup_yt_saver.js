(function () {
  const videoDataKey = "Pouch-YT-Videos";
  const observerConfig = { childList: true, subtree: true };
  let videoDataMap = new Map();
  let debounceTimeout;

  function loadVideoData() {
    const storedVideoData = localStorage.getItem(videoDataKey);

    if (storedVideoData) {
      const videoDataArray = JSON.parse(storedVideoData);
      videoDataMap = new Map(videoDataArray.map((video) => [video.id, video]));
    }
  }

  function handleDynamicContent() {
    const targetNode = document.querySelector("ytd-browse, ytd-watch-flexy");

    if (targetNode) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            debounceStoreVideoData();
          }
        });
      });

      observer.observe(targetNode, observerConfig);
    }
  }

  function debounceStoreVideoData() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      storeVideoData();
    }, 1000);
  }

  function storeVideoData() {
    const videoElements = document.querySelectorAll(
      'a#thumbnail[href^="/watch?v="]'
    );

    videoElements.forEach((videoElement) => {
      const videoUrl = new URL(videoElement.href);
      const videoId = videoUrl.searchParams.get("v");
      const videoTitleElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("#video-title");
      const videoTitle = videoTitleElement.textContent.trim();

      const thumbnailElement = videoElement.querySelector("img");

      if (!thumbnailElement) return;

      const thumbnailUrl = `https://img.youtube.com/vi/\${videoId}/hqdefault.jpg`;

      const durationElement = videoElement.querySelector(
        "ytd-thumbnail-overlay-time-status-renderer span#text"
      );

      if (!durationElement) return;

      const duration = durationElement.textContent.trim();

      const channelNameElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("yt-formatted-string.ytd-channel-name");

      const metadataLineElements = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelectorAll("#metadata-line span#text");

      const channelName = channelNameElement
        ? channelNameElement.textContent.trim()
        : "";

      const viewCountElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("span.style-scope.ytd-video-meta-block");

      const viewCount = viewCountElement
        ? viewCountElement.textContent.trim()
        : "";

      const uploadTimeElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("#metadata-line span:nth-child(2)");

      const uploadTimeAgo = uploadTimeElement
        ? uploadTimeElement.textContent.trim()
        : "";

      // Updated selector for the channel logo element
      const channelLogoElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("a#avatar-link yt-img-shadow#avatar img");

      // Extract the src attribute of the channel logo image
      const channelLogoUrl = channelLogoElement ? channelLogoElement.src : "";

      if (!videoDataMap.has(videoId)) {
        const videoData = {
          id: videoId,
          title: videoTitle,
          url: videoElement.href,
          thumbnailUrl: thumbnailUrl,
          duration: duration,
          channelName: channelName,
          viewCount: viewCount,
          uploadTime: uploadTimeAgo,
          channelLogoUrl: channelLogoUrl, // Add the channel logo URL
        };

        videoDataMap.set(videoId, videoData);
        console.log(`Adding video: \${JSON.stringify(videoData)}`);
      }
    });

    const videoDataArray = Array.from(videoDataMap.values());
    localStorage.setItem(videoDataKey, JSON.stringify(videoDataArray));
    console.log(`Stored video data: \${JSON.stringify(videoDataArray)}`);
  }

  loadVideoData();
  storeVideoData();
  handleDynamicContent();
})();

//I will fix upload time //
