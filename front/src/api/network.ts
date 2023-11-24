import axios from "@/utils/http";
import { number } from "echarts";
const { VITE_ADMIN_HOST } = import.meta.env;

// 新增network
export const createOne = (
  chain_id: number,
  name: string,
  technology?: string,
  description?: string,
  native_token?: string,
  milestones?: string
) => {
  return axios.post<any>(VITE_ADMIN_HOST + `/operations/Network/CreateOne`, {
    data: {
      chain_id: Number(chain_id),
      name: name,
      technology: technology,
      description: description,
      native_token: native_token,
      milestones: milestones
    }
  });
};

// 更新network
export const updateNetwork = (
  id: number,
  chain_id: number,
  name: string,
  technology?: string,
  description?: string,
  native_token?: string,
  milestones?: string
) => {
  return axios.post<any>(VITE_ADMIN_HOST + `/operations/Network/UpdateOne`, {
    data: {
      id: Number(id),
      chain_id: Number(chain_id),
      name: name,
      technology: technology,
      description: description,
      native_token: native_token,
      milestones: milestones
    }
  });
};
