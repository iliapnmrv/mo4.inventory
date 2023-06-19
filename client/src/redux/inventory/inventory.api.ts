import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "redux/fetchBaseQuery";
import { IAnalysis, IItem } from "redux/item/item.api";

export type IInventory = {
  id: number;
  vedpos: number;
  name: string;
  place: string;
  kolvo: number;
  place_priority: number;
};

type IAnalysisAll = IAnalysis & {
  name: string;
};

type ILatestInventory = {
  name: string;
  upload_date: Date;
};

export type ReportItem = IInventory & {
  items: { item: IItem }[];
  _count: number;
  not_found: number;
  remainder: number;
};

export const inventoryApi = createApi({
  reducerPath: "api/inventory",
  tagTypes: ["Inventory", "AnalysisAll", "Latest", "Report"],
  baseQuery,
  endpoints: (builder) => ({
    getInventory: builder.query<IInventory[], void>({
      query: () => ({
        url: `inventory`,
        method: "GET",
      }),
      providesTags: ["Inventory"],
    }),
    getAnalysisAll: builder.query<IAnalysisAll[], void>({
      query: () => ({
        url: `inventory/analysis`,
        method: "GET",
      }),
      providesTags: ["AnalysisAll"],
    }),
    getLatestInventory: builder.query<ILatestInventory, void>({
      query: () => ({
        url: `inventory/latest`,
        method: "GET",
      }),
      providesTags: ["Latest"],
    }),
    getInventoryReport: builder.query<ReportItem[], void>({
      query: () => ({
        url: `inventory/report`,
        method: "GET",
      }),
      providesTags: ["Report"],
    }),
    uploadInventory: builder.mutation<number, FormData>({
      query: (body) => ({
        url: `inventory`,
        method: "POST",
        headers: {
          "Content-Type": undefined,
          Accept: "application/json",
          "Accept-Charset": "windows-1251",
        },
        body,
      }),
      invalidatesTags: ["AnalysisAll", "Inventory", "Latest"],
    }),
  }),
});

export const {
  useGetAnalysisAllQuery,
  useGetInventoryQuery,
  useUploadInventoryMutation,
  useGetLatestInventoryQuery,
  useGetInventoryReportQuery,
} = inventoryApi;
