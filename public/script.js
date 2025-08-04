const handleMenuClick = async (data, el) => {
  document
    .querySelectorAll(".note")
    .forEach((item) => item.setAttribute("data-state", "inactive"));

  const res = await fetch(`/${data.path}`);
  const fileData = await res.text();

  document.getElementById("content").innerHTML = marked.parse(fileData);

  let p = data.path.replace("public", "");
  p = p.replace(".md", "");

  history.pushState({}, "", `${p}`);

  console.log("el===>", el);
  el.dataset.state = "active";

  const aEl = document.querySelectorAll("#content a");

  aEl.forEach((el) => (el.target = "_blank"));
};

const buildMenu = (data, parentNode) => {
  const el = document.createElement("div");
  const text = document.createElement("div");
  text.classList.add("menu-text");

  el.dataset.path = data.path;

  text.innerHTML = data.name;
  el.appendChild(text);
  if (data.isDir && data.children) {
    el.classList.add("dir");

    const sorted = [...data?.children]
      .filter((v) => v.name.endsWith(".md") || v.isDir)
      .sort((a, b) => {
        if (!a.isDir && b.isDir) {
          return -1;
        } else {
          return 0;
        }
      });

    sorted?.forEach((element) => {
      buildMenu(element, el);
    });
  } else {
    el.dataset.state = "inactive";

    el.addEventListener("click", () => handleMenuClick(data, el));

    el.classList.add("note");
  }
  parentNode.appendChild(el);
};

const init = async () => {
  const res = await fetch("/files");
  const fileData = await res.json();

  const menuContainer = document.getElementById("menu");
  console.log(fileData.files, menuContainer);

  console.log("href==>", window.location.href, window.location.pathname);

  buildMenu(fileData.files, menuContainer);

  // window.addEventListener("hashchange", async () => {
  //   const route = location.hash.slice(1); // 去掉 #
  //   // 根据 route 渲染页面
  //   const res = await fetch(route);
  //   const fileData = await res.text();

  //   document.getElementById("content").innerHTML = marked.parse(fileData);
  // });

  const renderer = {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");

      return `
            <h${depth} id="${tokens[0].text}">             
              ${text}
            </h${depth}>`;
    },
  };

  marked.use({ renderer });

  if (window.location.pathname.indexOf("/note") === 0) {
    const requirePath = decodeURIComponent(
      `public${window.location.pathname}.md`
    );
    const menuEl = document.querySelector(`[data-path="${requirePath}"]`);

    console.log("requirePath===>", requirePath);

    handleMenuClick({ path: requirePath }, menuEl);
  }

  function handleRouteChange() {
    const path = location.pathname;
    console.log("当前路由：", path);
    // 根据 path 来更新视图
  }

  // window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("load", handleRouteChange);
};

// 路由
(function () {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  function handleRouteChange(type) {
    const event = new Event("routechange");
    event.detail = { type, path: location.pathname };
    window.dispatchEvent(event);
  }

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleRouteChange("pushState");
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleRouteChange("replaceState");
  };

  window.addEventListener("routechange", (e) => {
    console.log("手动 push/replaceState 触发的路由变化：", location.pathname);
  });
})();

setTimeout(() => {
  init();
});
