import { isBuildProd } from "@/utils/common";
import { registerMicroApps, start } from "qiankun";

registerMicroApps([
    {
        name: "Spacer", // app name registered
        entry: isBuildProd ? "https://spacer-label.basemind.com" : "https://neo-test-spacer-label.stepfun-inc.net",
        // entry: "//localhost:3000",
        container: "#spacer",
        activeRule: [
            "/spacer",
            "/data-workbench/history/spacer",
            "/data-workbench/project-management/spacer",
            "/data-workbench/statistic/spacer",
            "/data-workbench/label-work/spacer"
        ]
    }
]);

setTimeout(() => {
    // 加一个setTimeout是为了防止vue router还没解析完渲染完router就已经启动子项目了
    start({
        prefetch: false, // 开启预加载
        sandbox: {
            // 开启后CSS错乱，先关了
            // experimentalStyleIsolation: true //   开启沙箱模式,实验性方案
        }
    });
}, 800);
