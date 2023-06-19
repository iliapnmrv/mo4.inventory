import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "redux/fetchBaseQuery";
import { IItem } from "redux/item/item.api";

export type ICatalogs =
  | "person"
  | "status"
  | "user"
  | "place"
  | "device"
  | "type"
  | "stock_device";

export type ICatalog = {
  name: string;
  id: number;
};

export const catalogApi = createApi({
  reducerPath: "api/catalog",
  tagTypes: ["Catalog", "AllCatalogs", "Available"],
  baseQuery,
  endpoints: (builder) => ({
    getCatalogs: builder.query<Record<ICatalogs, ICatalog[]>, void>({
      query: () => `catalog`,
      providesTags: ["AllCatalogs"],
    }),
    getCatalog: builder.query<ICatalog[], ICatalogs>({
      query: (catalog) => `catalog/${encodeURIComponent(catalog)}`,
      providesTags: ["Catalog"],
    }),
    getAvailable: builder.mutation<
      { available: boolean; data?: IItem[] },
      { catalog: ICatalogs; id: number }
    >({
      query: ({ id, catalog }) => ({
        url: `catalog/available-to-delete/${encodeURIComponent(catalog)}/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Available"],
    }),
    updateCatalog: builder.mutation<
      ICatalog,
      ICatalog & { catalog: ICatalogs }
    >({
      query: ({ id, catalog, ...body }) => ({
        url: `catalog/${encodeURIComponent(catalog)}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Catalog", "AllCatalogs"],
    }),
    createCatalog: builder.mutation<
      ICatalog,
      { catalog: ICatalogs; name: string }
    >({
      query: ({ catalog, ...body }) => ({
        url: `catalog/${encodeURIComponent(catalog)}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Catalog", "AllCatalogs"],
    }),
    deleteCatalog: builder.mutation<any, { catalog: ICatalogs; id: number }>({
      query: ({ id, catalog }) => ({
        url: `catalog/${encodeURIComponent(catalog)}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Catalog", "AllCatalogs"],
    }),
  }),
});

export const {
  useCreateCatalogMutation,
  useDeleteCatalogMutation,
  useGetCatalogsQuery,
  useGetCatalogQuery,
  useUpdateCatalogMutation,
  useGetAvailableMutation,
} = catalogApi;
