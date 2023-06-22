import { IItem, IQuery, Response } from "redux/item/item.api";
import axios from "axios";

export const $api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

export const getItems = async (params: Partial<IQuery>) => {
  const response = await $api.get<Response<IItem[]>>(`item`, { params });
  return response.data;
};
