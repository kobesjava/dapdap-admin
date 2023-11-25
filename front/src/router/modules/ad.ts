export default {
  path: "/ad",
  meta: {
    icon: "document",
    title: "广告管理",
    rank: 5
  },
  children: [
    {
      path: "/ad/index",
      name: "Ad",
      component: () => import("@/views/ad/index.vue"),
      meta: {
        title: "广告管理"
      }
    }
  ]
};
