import { createApi } from "@reduxjs/toolkit/query/react";
import { ICatalog } from "redux/catalog/catalog.api";
import { baseQuery } from "redux/fetchBaseQuery";
import { IFile } from "redux/item/file.api";
import { Stock } from "redux/stock/stock.api";

export type IItem = {
  id: number;
  qr: number;
  name: string;
  month: number;
  year: number;
  serial_number: string;
  model: string;
  description: string | null;
  additional_information: string | null;
  instruction_id: number | null;
  status?: ICatalog;
  user?: ICatalog;
  person?: ICatalog;
  place?: ICatalog;
  device?: ICatalog;
  type?: ICatalog;
  status_id?: number;
  user_id?: number;
  person_id?: number;
  place_id?: number;
  device_id?: number;
  type_id?: number;
  updatedAt?: Date;
  createdAt?: Date;
  logs?: ILog[];
  files?: IFile[];
  instruction?: IFile;
  stock_items?: Stock[];
};

export type Response<T> = {
  data: T;
  meta: { total: number };
};

export type IQuery = {
  q?: string;
  user_id?: number[];
  device_id?: number[];
  type_id?: number[];
  person_id?: number[];
  status_id?: number[];
  place_id?: number[];
  include?: boolean;
  includeLogs?: boolean;
  sortBy?: ISortByKeys;
  direction?: "asc" | "desc";
  showArchive?: boolean;
  showZeroCartridges?: boolean;
  stock_item?: number;
} & PaginationParams;

export type PaginationParams = { offset?: number; limit?: number };

export type ISortByKeys = "updatedAt" | "createdAt" | "qr" | "name" | "year";

type INames = {
  name: string;
};

export type ILog = {
  id: number;
  description: string;
  item_id: number;
  created_at: Date;
  author: string;
};

export type IAnalysis = {
  listed: number;
  in_stock: number;
};

export const itemApi = createApi({
  reducerPath: "api/item",
  tagTypes: [
    "Item",
    "SerialNumber",
    "Names",
    "LastQR",
    "Analysis",
    "AnalysisAll",
    "File",
    "Instruction",
    "Export",
    "Stock",
  ],
  baseQuery,
  endpoints: (builder) => ({
    getItems: builder.query<IItem[], IQuery>({
      query: (params) => ({
        url: `item`,
        method: "GET",
        params,
      }),
      providesTags: ["Item"],
    }),
    exportData: builder.mutation<{ file: string }, Partial<IQuery>>({
      query: (params) => ({
        url: `item/export`,
        method: "GET",
        params,
      }),
      invalidatesTags: ["Export"],
    }),
    getItem: builder.query<IItem & { analysis: IAnalysis }, number>({
      query: (itemId) => ({
        url: `item/${itemId}`,
        method: "GET",
      }),
      providesTags: ["Item"],
    }),
    updateItem: builder.mutation<IItem, Partial<Omit<IItem, "id">>>({
      query: ({ qr, ...body }) => ({
        url: `item/${qr}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Item"],
    }),
    archiveItem: builder.mutation<IItem, number>({
      query: (qr) => ({
        url: `item/archive/${qr}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Item"],
    }),
    updateMany: builder.mutation<IItem, Partial<IItem> & { qrs: number[] }>({
      query: ({ qrs, ...body }) => ({
        url: `item/qrs`,
        method: "PATCH",
        params: { qrs },
        body,
      }),
      invalidatesTags: ["Item"],
    }),
    createItem: builder.mutation<IItem, Omit<IItem, "id">>({
      query: (body) => ({
        url: `item`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Item", "LastQR"],
    }),
    deleteItem: builder.mutation<any, number>({
      query: (qr) => ({
        url: `item/${qr}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Item"],
    }),
    findSerialNumberAvailable: builder.mutation<{ exists: false }, string>({
      query: (serial_number) => ({
        url: `item/serial_number`,
        method: "GET",
        params: { serial_number },
      }),
      invalidatesTags: ["SerialNumber"],
    }),
    findUniqueNames: builder.query<INames[], void>({
      query: () => ({
        url: `item/names`,
        method: "GET",
      }),
      providesTags: ["Names"],
    }),
    findLastQR: builder.query<number, void>({
      query: () => ({
        url: `item/last_qr`,
        method: "GET",
      }),
      providesTags: ["LastQR"],
    }),
    addStockToItem: builder.mutation<any[], { model: string; stockId: number }>(
      {
        query: ({ model, stockId }) => ({
          url: `item/${encodeURIComponent(model)}/stock/${encodeURIComponent(
            stockId
          )}`,
          method: "POST",
        }),
        invalidatesTags: ["Item", "Stock"],
      }
    ),
    deleteStockFromItem: builder.mutation<
      any[],
      { model: string; stockId: number }
    >({
      query: ({ model, stockId }) => ({
        url: `item/${encodeURIComponent(model)}/stock/${encodeURIComponent(
          stockId
        )}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Item", "Stock"],
    }),
  }),
});

export const {
  useCreateItemMutation,
  useDeleteItemMutation,
  useGetItemQuery,
  useGetItemsQuery,
  useUpdateItemMutation,
  useLazyGetItemsQuery,
  useLazyGetItemQuery,
  useFindSerialNumberAvailableMutation,
  useFindUniqueNamesQuery,
  useFindLastQRQuery,
  useUpdateManyMutation,
  useExportDataMutation,
  useArchiveItemMutation,
  useAddStockToItemMutation,
  useDeleteStockFromItemMutation,
  usePrefetch,
} = itemApi;
