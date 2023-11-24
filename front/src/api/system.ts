import axios from "@/utils/http";
const { VITE_ADMIN_HOST } = import.meta.env;

export type Perm = {
  id: number;
  createdAt: string;
  enabled: number;
  method: string;
  path: string;
};

export type PermSyncReq = {
  data: Perm[];
};
export const sendPermission = (data?: PermSyncReq) => {
  return axios.post<any>(
    VITE_ADMIN_HOST + "/operations/System/Perm/CreateMany",
    {
      data
    }
  );
};

export const getSubmenu = (data: number) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Menu/GetChildrenMenus?pid=${data}`
  );
};

export const getPerm = (data: number) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Menu/GetMenuPerms?menuId=${data}`
  );
};

export const getPagePerm = (data: number) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Perm/GetMany?menuId=${data}`
  );
};

export const getMenuRoles = (data: string) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Role/GetMenuRoles?title=${data}`
  );
};

/**
 *  根据角色查询用户信息
 */
export const getRoleUsers = code => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/User/GetRoleUsers?code=${code}`
  );
};

export const getMenuPerms = (data: string) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Perm/GetMany?name=${data}`
  );
};

export const getBindAPI = () => {
  return axios.get<any>(
    VITE_ADMIN_HOST + "/operations/System/Perm/GetBindPerms"
  );
};

// 根据角色获取权限列表
export const getRolePerms = (data: string[]) => {
  return axios.post<string[]>(VITE_ADMIN_HOST + `operations/proxy/perm`, {
    data
  });
};

export const deleteRoles = (ids: number[] | number) => {
  return axios.post(VITE_ADMIN_HOST + "/operations/System/Role/DeleteMany", {
    data: { ids }
  });
};

export const roleMenuTreeselect = (id: number) => {
  return axios.post<any>(VITE_ADMIN_HOST + "operations/proxy/menuTree", {
    data: id
  });
};

export const updateRolePermAdd = (
  rolecode: string,
  roleId: number,
  menuIds: number[]
) => {
  return axios.post<any>(VITE_ADMIN_HOST + "operations/proxy/bindmenu", {
    data: {
      rolecode,
      roleId,
      menuIds
    }
  });
};

export const updateRolePermRemove = (
  rolecode: string,
  roleId: number,
  menuIds: number[]
) => {
  return axios.post<any>(VITE_ADMIN_HOST + "/proxy/unBindMenu", {
    data: {
      rolecode,
      roleId,
      menuIds
    }
  });
};

//  GET /operations/System/Menu/GetApiList
export const GetApiList = () => {
  return axios.get<any>(VITE_ADMIN_HOST + "/operations/System/Menu/GetApiList");
};

// GET /operations/System/Log/GetLog
export const GetLog = (skip: number, take: number, sort?: object) => {
  return axios.get<any>(
    VITE_ADMIN_HOST + `/operations/System/Log/GetLog?skip=${skip}&take=${take}`
  );
};

// GET /operations/System/Log/GetIsOpen
export const GetIsOpen = () => {
  return axios.get<any>(VITE_ADMIN_HOST + `/operations/System/Log/GetIsOpen`);
};

// POST /operations/System/Log/ChangeOpen
export const ChangeOpen = (data: object) => {
  return axios.post<any>(
    VITE_ADMIN_HOST + `/operations/System/Log/ChangeOpen`,
    {
      data
    }
  );
};

/**
 * 获取所有日志数目
 * GET /operations/System/Log/GetAllLog
 */
export const getAllLogNumber = () => {
  return axios.get<any>(VITE_ADMIN_HOST + "/operations/System/Log/GetAllLog");
};

/**
 * 根据日志id删除日志
 */
export const deleteLog = equals => {
  return axios.post(VITE_ADMIN_HOST + "/operations/System/Log/DeleteLog", {
    data: {
      equals
    }
  });
};

/**
 * 日志的模糊查询
 */
export const getLikeLog = (data: object) => {
  return axios.get<any>(VITE_ADMIN_HOST + "/operations/System/Log/GetLikeLog", {
    params: data
  });
};
/**
 * 根据日志id删除单条日志
 */
export const deleteOneLog = (id: number) => {
  return axios.post(VITE_ADMIN_HOST + "/operations/System/Log/DeleteOne", {
    data: {
      id
    }
  });
};
