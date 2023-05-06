(async function () {
  const videoDataKey = "Pouch-YT-Videos";
  const observerConfig = { childList: true, subtree: true };
  let videoDataMap = new Map();
  let debounceTimeout;
  const OPENAI_API_KEY =
    localStorage.getItem("openAIKey") || "your_api_key_here";
  const theme = localStorage.getItem("pouchVideoInterest") || "";

  function loadVideoData() {
    const storedVideoData = localStorage.getItem(videoDataKey);

    if (storedVideoData) {
      const videoDataArray = JSON.parse(storedVideoData);
      videoDataMap = new Map(videoDataArray.map((video) => [video.id, video]));
    }
  }

  async function fetchSuitabilityScore(videoTitle, theme) {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer \${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `This is a video title and you need to tell me does this will be suitable for person who is interested within a specific theme i am giving you in one number if it matches give me 1 if it don't matches give me 0 no other word or number if you do so you die just 1 and 0 here is your ${videoTitle} and the theme is ${theme}\n`,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    const data = await response.json();
    return data.choices[0].text.trim();
  }

  async function handleDynamicContent() {
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

  async function storeVideoData() {
    const videoElements = document.querySelectorAll(
      'a#thumbnail[href^="/watch?v="]'
    );

    for (const videoElement of videoElements) {
      const videoUrl = new URL(videoElement.href);
      const videoId = videoUrl.searchParams.get("v");
      const videoTitleElement = videoElement
        .closest("ytd-rich-item-renderer")
        .querySelector("#video-title");
      const videoTitle = videoTitleElement.textContent.trim();

      // Fetch suitability score
      const suitabilityScore = await fetchSuitabilityScore(videoTitle, theme);

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
          channelLogoUrl: channelLogoUrl,
          suitabilityScore: suitabilityScore,
        };

        videoDataMap.set(videoId, videoData);
        console.log(`Adding video: \${JSON.stringify(videoData)}`);
      }
    }

    const videoDataArray = Array.from(videoDataMap.values());
    localStorage.setItem(videoDataKey, JSON.stringify(videoDataArray));
    console.log(`Stored video data: \${JSON.stringify(videoDataArray)}`);
  }

  loadVideoData();
  await storeVideoData();
  handleDynamicContent();
})();
