import { CustomAxiosRequestConfig } from "./axiosInstanceTypes";

export const isProtected: CustomAxiosRequestConfig = {
  requireAuth: true,
};
