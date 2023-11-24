export default {
  path: "/dapp",
  meta: {
    icon: "document",
    title: "Dapp管理",
    rank: 4
  },
  children: [
    {
      path: "/dapp/index",
      name: "Dapp",
      component: () => import("@/views/dapp/index.vue"),
      meta: {
        title: "Dapp管理"
      }
    },
    {
      path: "/dapp/category",
      name: "DappCategory",
      component: () => import("@/views/dapp/category.vue"),
      meta: {
        title: "类别管理"
      }
    }
  ]
};
