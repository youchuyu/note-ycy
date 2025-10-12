import { message } from "ant-design-vue";
import _ from "lodash";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    redirect: "/my-all",
    component: () => import("@/views/Home/index.vue"),
    children: [
      {
        path: "/test/history/:pathMatch(.*)*",
        name: "test:workbench:history",
        meta: {
          title: "历史记录",
          only: true,
          hideBreadcrumb: true,
        },
        component: () => import("@/views/DataWorkbench/history/index.vue"),
      },
      {
        path: "/data-workbench",
        name: "data:workbench",
        meta: {
          title: "数据产线管理",
        },
        component: () => import("@/views/DataWorkbench/index.vue"),
        children: [
          {
            path: "/data-workbench/project-management",
            name: "data:workbench:project-management",
            meta: {
              title: "标注项目管理",
            },
            component: () =>
              import("@/views/DataWorkbench/projectManagement/index.vue"),
            children: [
              {
                path: "/data-workbench/project-management/spacer/:pathMatch(.*)*",
                name: "data:workbench:project-management:spacer",
                meta: {
                  title: "标注项目",
                },
                component: () =>
                  import("@/views/DataWorkbench/projectManagement/spacer.vue"),
              },
            ],
          },
          {
            path: "/data-workbench/history",
            name: "data:workbench:history",
            meta: {
              title: "历史记录",
              hideBreadcrumb: true,
            },
            component: () => import("@/views/DataWorkbench/history/index.vue"),
            children: [
              {
                path: "/data-workbench/history/sado",
                name: "data:workbench:history:sado",
                meta: {
                  title: "回流数据标注项目",
                  hideBreadcrumb: true,
                },
                component: () =>
                  import("@/views/DataWorkbench/history/list.vue"),
              },
              {
                path: "/data-workbench/history/spacer/:pathMatch(.*)*",
                name: "data:workbench:history:spacer",
                meta: {
                  title: "标注项目",
                  hideBreadcrumb: true,
                },
                component: () =>
                  import("@/views/DataWorkbench/history/spacer.vue"),
              },
            ],
          },

          {
            path: "/data-workbench/statistic",
            name: "data:workbench:statistic",
            meta: {
              title: "数据统计",
              hideBreadcrumb: true,
            },
            component: () =>
              import("@/views/DataWorkbench/Statistic/index.vue"),
            children: [
              {
                path: "/data-workbench/statistic/sado",
                name: "data:workbench:statistic:sado",
                meta: {
                  title: "回流数据标注项目",
                  hideBreadcrumb: true,
                },
                component: () =>
                  import("@/views/DataWorkbench/Statistic/list.vue"),
              },
              {
                path: "/data-workbench/statistic/spacer/:pathMatch(.*)*",
                name: "data:workbench:statistic:spacer",
                meta: {
                  title: "标注项目",
                  hideBreadcrumb: true,
                },
                component: () =>
                  import("@/views/DataWorkbench/Statistic/spacer.vue"),
              },
            ],
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as any,
});

//微前端qiankun 里面，vue3 和 vue2 不一致，导致router问题
router.beforeEach((to, from, next) => {
  if (_.isEmpty(history.state.current)) {
    _.assign(history.state, { current: from.fullPath });
  }
  // 路由切换的时候清除所有的message
  message.destroy();
  next();
});

export default router;
