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

export type InventoryScan = {
  id: number;
  inventoryNum: number;
  name: string;
  // 1 - в учете
  // 2 - Не в учете
  // 3 - Сверх учета
  // 4 - Дубликат
  status: number;
  model: string;
  serialNum: string;
  position: number;
  place: string;
  trace: string;
  createdAt: Date;
};

export const inventoryApi = createApi({
  reducerPath: "api/inventory",
  tagTypes: ["Inventory", "AnalysisAll", "Latest", "Report", "Scanned"],
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
    getInventoryScanned: builder.query<InventoryScan[], void>({
      query: () => ({
        url: `inventory/scanned`,
        method: "GET",
      }),
      providesTags: ["Scanned"],
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
  useGetInventoryScannedQuery,
} = inventoryApi;
