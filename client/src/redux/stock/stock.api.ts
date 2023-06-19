import { ICatalog } from "redux/catalog/catalog.api";
import { PaginationParams, itemApi } from "redux/item/item.api";

export type Stock = {
  id: number;
  name: string | null;
  quantity: number;
  description: string | null;
  device_id: number | null;
  device: ICatalog;
  logs: StockLog[];
  taken: number;
  given: number;
  last_sub: Date;
  last_add: Date;
};

export enum StockAction {
  sub = "-",
  add = "+",
}

export type StockLog = {
  id: number;
  description: string | null;
  created_at: Date;
  author: string;
  amount: number;
  type: "add" | "sub";
};

export type StocksQuery = {
  q: string;
  item_qr: number;
  device_id: number;
} & PaginationParams;

export const stockApi = itemApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockItems: builder.query<Stock[], Partial<StocksQuery>>({
      query: (params) => ({
        url: `stock`,
        method: "GET",
        params,
      }),
      providesTags: ["Stock"],
    }),
    getStockItem: builder.query<Stock, number>({
      query: (id) => ({
        url: `stock/${id}`,
        method: "GET",
      }),
      providesTags: ["Stock"],
    }),
    createStock: builder.mutation<Stock, Partial<Stock>>({
      query: (body) => ({
        url: `stock`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),
    updateStock: builder.mutation<Stock, Partial<Stock> & Pick<Stock, "id">>({
      query: ({ id, ...body }) => ({
        url: `stock/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),
    logStock: builder.mutation<
      Stock,
      Partial<Omit<StockLog, "id">> & Pick<StockLog, "id" | "type">
    >({
      query: ({ id, ...body }) => ({
        url: `stock/${id}/log`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),
    deleteStock: builder.mutation<Stock, number>({
      query: (id) => ({
        url: `stock/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stock"],
    }),
    deleteLog: builder.mutation<Stock, number>({
      query: (id) => ({
        url: `stock/log/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stock"],
    }),
  }),
});

export const {
  useGetStockItemsQuery,
  useGetStockItemQuery,
  useLogStockMutation,
  useCreateStockMutation,
  useDeleteStockMutation,
  useUpdateStockMutation,
  useLazyGetStockItemQuery,
  useDeleteLogMutation,
} = stockApi;
