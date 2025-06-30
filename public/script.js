const buildMenu = (data, parentNode) => {
  const el = document.createElement("div");
  const text = document.createElement("div");
  text.classList.add("menu-text");

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

    el.addEventListener("click", async () => {
      document
        .querySelectorAll(".note")
        .forEach((item) => item.setAttribute("data-state", "inactive"));

      window.location.hash = "/" + data.path;
      el.dataset.state = "active";
    });

    el.classList.add("note");
  }
  parentNode.appendChild(el);
};

const init = async () => {
  const res = await fetch("/files");
  const fileData = await res.json();

  const menuContainer = document.getElementById("menu");
  console.log(fileData.files, menuContainer);

  buildMenu(fileData.files, menuContainer);

  window.addEventListener("hashchange", async () => {
    const route = location.hash.slice(1); // 去掉 #
    // 根据 route 渲染页面
    const res = await fetch(route);
    const fileData = await res.text();

    document.getElementById("content").innerHTML = marked.parse(fileData);
  });
};

setTimeout(() => {
  init();
});
