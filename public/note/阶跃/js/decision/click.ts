export function isTouchDevice() {
  if (
    !/iphone|ios|android|mini|mobile|mobi|Nokia|Symbian|iPod|iPad|Windows\s+Phone|MQQBrowser|wp7|wp8|UCBrowser7|UCWEB|360\s+Aphone\s+Browser|blackberry/i.test(
      window.navigator.userAgent
    )
  ) {
    return false;
  }
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function click(target, cb) {
  if (isTouchDevice()) {
    target.addEventListener("touchend", cb);
  } else {
    target.addEventListener("click", cb);
  }
}

export function removeClick(target, cb) {
  if (isTouchDevice()) {
    target.removeEventListener("touchend", cb);
  } else {
    target.removeEventListener("click", cb);
  }
}
