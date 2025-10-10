export const loadVideo = (src: string): Promise<Event> => {
  if (!src) return Promise.reject("No video source provided");

  const video = document.createElement("video");
  video.src = src;

  return new Promise((resolve, reject) => {
    // 等待视频加载完成
    video.oncanplaythrough = (event) => {
      resolve(event); // 视频已经加载并准备好播放
    };

    // 如果加载失败，触发 reject
    video.onerror = (error) => {
      reject(error);
    };

    // 开始加载视频
    video.load();
  });
};
