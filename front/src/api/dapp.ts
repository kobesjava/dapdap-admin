import axios from "@/utils/http";
const { VITE_ADMIN_HOST } = import.meta.env;

// 新增dapp
export const createOne = (
  name: string,
  description?: string,
  native_token?: string,
  recommend?: string,
  recommend_icon?: string
) => {
  return axios.post<any>(VITE_ADMIN_HOST + `/operations/Dapp/CreateOne`, {
    data: {
      name: name,
      description: description,
      native_token: native_token,
      recommend: recommend == "1" ? true : false,
      recommend_icon: recommend_icon
    }
  });
};

// 新增category
export const createOneCategory = (name: string) => {
  return axios.post<any>(VITE_ADMIN_HOST + `/operations/Dapp/CreateCategory`, {
    data: {
      name: name
    }
  });
};

// 新增dapp_category
export const createDappCategory = (dapp_id: number, categoryIds: number[]) => {
  const params: {
    dapp_id: number;
    category_id: number;
  }[] = [];
  for (const categoryId of categoryIds) {
    params.push({
      dapp_id: dapp_id,
      category_id: categoryId
    });
  }
  return axios.post<any>(
    VITE_ADMIN_HOST + `/operations/Dapp/CreateManyDappCategory`,
    {
      data: {
        param: params
      }
    }
  );
};

// 新增dapp_network
export const createDappNetwork = (dapp_id: number, networkIds: number[]) => {
  const params: {
    dapp_id: number;
    network_id: number;
  }[] = [];
  for (const networkId of networkIds) {
    params.push({
      dapp_id: dapp_id,
      network_id: networkId
    });
  }
  return axios.post<any>(
    VITE_ADMIN_HOST + `/operations/Dapp/CreateManyDappNetwork`,
    {
      data: {
        param: params
      }
    }
  );
};

// 新增dapp_relate
export const createDappRelate = (dapp_id: number, relateIds: number[]) => {
  const params: {
    dapp_id: number;
    dapp_id_relate: number;
  }[] = [];
  for (const relateId of relateIds) {
    params.push({
      dapp_id: dapp_id,
      dapp_id_relate: relateId
    });
  }
  return axios.post<any>(
    VITE_ADMIN_HOST + `/operations/Dapp/CreateManyDappRelate`,
    {
      data: {
        param: params
      }
    }
  );
};

// 更新dapp
export const updateDapp = (
  id: number,
  name: string,
  oldNetworks: { id: number; networkId: number }[],
  oldCategorys: { id: number; categoryId: number }[],
  oldRelates: { id: number; relateId: number }[],
  networkIds: number[],
  categoryIds: number[],
  relateIds: number[],
  description?: string,
  native_token?: string,
  recommend?: number,
  recommend_icon?: string
) => {
  console.log("timeout: " + axios.defaults.timeout);

  const networkParams: {
    dapp_id: number;
    network_id: number;
  }[] = [];
  for (const networkId of networkIds) {
    let exist = false;
    for (const oldNetwork of oldNetworks) {
      if (oldNetwork.networkId == networkId) {
        exist = true;
      }
    }
    if (!exist) {
      networkParams.push({
        dapp_id: id,
        network_id: networkId
      });
    }
  }
  const deleteNetworkParams: number[] = [];
  for (const oldNetwork of oldNetworks) {
    if (!networkIds.includes(oldNetwork.networkId)) {
      deleteNetworkParams.push(oldNetwork.id);
    }
  }

  const categoryParams: {
    dapp_id: number;
    category_id: number;
  }[] = [];
  for (const categoryId of categoryIds) {
    let exist = false;
    for (const oldCategory of oldCategorys) {
      if (oldCategory.categoryId == categoryId) {
        exist = true;
      }
    }
    if (!exist) {
      categoryParams.push({
        dapp_id: id,
        category_id: categoryId
      });
    }
  }
  const deleteCategoryParams: number[] = [];
  for (const oldCategory of oldCategorys) {
    if (!categoryIds.includes(oldCategory.categoryId)) {
      deleteCategoryParams.push(oldCategory.id);
    }
  }

  const relateParams: {
    dapp_id: number;
    dapp_id_relate: number;
  }[] = [];
  for (const relateId of relateIds) {
    let exist = false;
    for (const oldRelate of oldRelates) {
      if (oldRelate.relateId == relateId) {
        exist = true;
      }
    }
    if (!exist) {
      relateParams.push({
        dapp_id: id,
        dapp_id_relate: relateId
      });
    }
  }
  const deleteRelateParams: number[] = [];
  for (const oldRelate of oldRelates) {
    if (!relateIds.includes(oldRelate.relateId)) {
      deleteRelateParams.push(oldRelate.id);
    }
  }

  return axios.post<any>(
    VITE_ADMIN_HOST + `/operations/Dapp/UpdateOne`,
    {
      data: {
        id: id,
        name: name,
        deleteNetworks: deleteNetworkParams,
        deleteCategorys: deleteCategoryParams,
        deleteRelates: deleteRelateParams,
        networks: networkParams,
        categorys: categoryParams,
        relates: relateParams,
        description: description ? description : "",
        native_token: native_token ? native_token : "",
        recommend: recommend == 1 ? true : false,
        recommend_icon: recommend_icon
      }
    },
    {
      timeout: 30000
    }
  );
};

/**
 * 模糊查询
 */
export const getDappLike = (data: object) => {
  return axios.get<any>(VITE_ADMIN_HOST + "/operations/Dapp/GetLikeList", {
    params: data
  });
};

export const getDappByCategory = (categoryId: number) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + "/operations/Dapp/GetListByCategory",
    {
      params: {
        cate_id: categoryId
      }
    }
  );
};

export const getDappByNetwork = (networkId: number) => {
  return axios.get<any>(VITE_ADMIN_HOST + "/operations/Dapp/GetListByNetwork", {
    params: {
      net_id: networkId
    }
  });
};
