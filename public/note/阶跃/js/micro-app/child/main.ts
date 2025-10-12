let instance: any = null;

// 支持多个挂载路径
const possibleBases = [
  "/data-workbench/history/spacer",
  "/data-workbench/project-management/spacer",
  "/data-workbench/statistic/spacer",
];

const initRouter = () => {
  const pathname = window.location.pathname;
  const base =
    possibleBases.find((prefix) => pathname.startsWith(prefix)) || "/spacer";
  console.log("base===>", base);

  const history = createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__ ? base : "/"
  );
  router = createRouter({
    history: history,
    routes,
  });
  router.beforeEach(async (to) => {
    const userStore = useUserStore();
    if (to.name === "agreement") {
      return true;
    }
    if (["login", "ssoLoginStepfun"].includes(to.name as string)) return true;
    if (userStore.userInfo) return true;

    try {
      await userStore.fetchUserInfo();
      return true;
    } catch (error) {
      return { name: "login" };
    }
  });
};

function initApp() {
  initRouter();
  const pinia = createPinia();
  const app: any = createApp(App);
  app.config.globalProperties.__VUE_OPTIONS_API__ = true; // 启用 Options API

  // 全局配置中文
  app.use(ElementPlus, {
    locale: zhCn,
  });

  app.use(router);
  app.use(pinia);
  // 配置代码高亮
  VMdPreview.use(vuepressTheme, {
    Prism,
    codeHighlightExtensionMap: {
      vue: "html",
      ts: "js",
    },
  });
  app.use(VMdPreview);
  app.directive("uniqueInput", InputCheckerDirective);
  app.directive("prism", {
    mounted(el) {
      Prism.highlightElement(el);
    },
    updated(el) {
      Prism.highlightElement(el);
    },
  });

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  return app;
}

function render(props: any = {}) {
  const { container } = props;
  instance = initApp();
  instance.mount(container ? container.querySelector("#app") : "#app");
}

// 独立运行时
if (!isMicroApp) {
  render();
  console.log("render alone");
} else {
  renderWithQiankun({
    mount(props) {
      console.log("mount", props);
      render(props);
      const el = document.getElementById("app");
      el?.classList.add("_micro-spacer-container");
      console.log(el);
    },
    bootstrap() {
      console.log("bootstrap");
    },
    unmount(props) {
      console.log("unmount", props);
      instance?.unmount();
      instance = null;
    },
    update(props) {
      console.log("update", props);
    },
  });
}
