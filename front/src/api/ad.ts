import axios from "@/utils/http";
const { VITE_ADMIN_HOST } = import.meta.env;

// 新增ad
export const createOne = (
  category: number,
  category_id: number,
  ad_link?: string,
  ad_images?: string
) => {
  const categoryParam = category == 1 ? "network" : "dapp";
  return axios.post<any>(VITE_ADMIN_HOST + `/operations/Ad/CreateOne`, {
    data: {
      category: categoryParam,
      category_id: Number(category_id),
      ad_link: ad_link,
      ad_images: ad_images
    }
  });
};
