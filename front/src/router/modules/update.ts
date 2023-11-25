export default {
  path: "/update",
  redirect: "/welocome",
  meta: {
    title: "编辑",
    showLink: false,
    rank: 9
  },
  children: [
    {
      path: "/user/updateUser",
      name: "UserUpdateManage",
      component: () => import("@/views/system/user/updateUser/index.vue"),
      meta: {
        title: "用户编辑",
        roles: ["admin"]
      }
    },
    {
      path: "/post/updatePost",
      name: "PostUpdate",
      component: () => import("@/views/post/updatePost/index.vue"),
      meta: {
        title: "文章编辑"
      }
    },
    {
      path: "/dapp/updateDapp",
      name: "DappUpdate",
      component: () => import("@/views/dapp/updateDapp/index.vue"),
      meta: {
        title: "Dapp编辑"
      }
    },
    {
      path: "/network/updateNetwork",
      name: "NetworkUpdate",
      component: () => import("@/views/network/updateNetwork/index.vue"),
      meta: {
        title: "Network编辑"
      }
    },
    {
      path: "/ad/updateAd",
      name: "AdUpdate",
      component: () => import("@/views/ad/updateAd/index.vue"),
      meta: {
        title: "广告编辑"
      }
    }
  ]
} as RouteConfigsTable;
