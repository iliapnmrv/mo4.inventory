import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "redux/fetchBaseQuery";
import { itemApi } from "redux/item/item.api";

export type IFile = {
  created_at: Date;
  id: number;
  item_id: number;
  name: string;
  path: string;
};

export const fileApi = itemApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    uploadInstruction: builder.mutation<
      IFile,
      { model: string; body: FormData }
    >({
      query: ({ model, body }) => ({
        url: `file/instruction/${encodeURIComponent(model)}`,
        method: "POST",
        headers: {
          "Content-Type": undefined,
          Accept: "application/json",
        },
        body,
      }),
      invalidatesTags: ["File", "Item"],
    }),
    uploadFiles: builder.mutation<IFile[], { qr: number; body: FormData }>({
      query: ({ qr, body }) => ({
        url: `file/${qr}`,
        method: "POST",
        headers: {
          "Content-Type": undefined,
          Accept: "application/json",
          "Accept-Charset": "windows-1251",
        },
        body,
      }),
      invalidatesTags: ["File", "Item"],
    }),
    deleteFile: builder.mutation<any, number>({
      query: (id) => ({
        url: `file/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["File", "Item"],
    }),
    deleteInstruction: builder.mutation<any, number>({
      query: (id) => ({
        url: `file/instruction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Instruction", "Item"],
    }),
  }),
});

export const {
  useUploadFilesMutation,
  useUploadInstructionMutation,
  useDeleteFileMutation,
  useDeleteInstructionMutation,
} = fileApi;
