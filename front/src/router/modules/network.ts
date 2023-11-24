export default {
  path: "/network",
  meta: {
    icon: "document",
    title: "Network管理",
    rank: 3
  },
  children: [
    {
      path: "/network/index",
      name: "Network",
      component: () => import("@/views/network/index.vue"),
      meta: {
        title: "Network管理"
      }
    }
  ]
};
