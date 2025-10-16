(function (win, doc) {
  if (!win.addEventListener) return;
  var html = document.documentElement;

  function setFont() {
    var html = document.documentElement;

    var k = 750;
    var caclfz = (Math.min(html.clientWidth, 600) / k) * 100;
    html.style.fontSize = caclfz + "px";
  }
  setFont();
  setTimeout(function () {
    setFont();
  }, 300);
  // DOMContentLoaded设置字体
  doc.addEventListener("DOMContentLoaded", setFont, false);
  win.addEventListener("resize", setFont, false);
  win.addEventListener("load", setFont, false);
})(window, document);
