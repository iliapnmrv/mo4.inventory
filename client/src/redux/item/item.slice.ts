import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Filters } from "components/Filters/Filters";

export type SelectedItem = {
  model: string;
  qr: number;
};

type ItemState = {
  selectedItems: SelectedItem[];
  filters?: Partial<Filters>;
};

const initialState: ItemState = {
  selectedItems: [],
};

export const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    toggleSelectedItem: (
      state: ItemState,
      { payload: { model, qr } }: PayloadAction<SelectedItem>
    ) => {
      state.selectedItems = state.selectedItems.find((item) => item.qr === qr)
        ? state.selectedItems.filter((item) => item.qr !== qr)
        : [...state.selectedItems, { model, qr }];
    },
    setFilters: (state: ItemState, action: PayloadAction<Partial<Filters>>) => {
      state.filters = action.payload;
    },
    resetSelected: (state: ItemState, action: PayloadAction<void>) => {
      state.selectedItems = [];
    },
  },
});

export const itemActions = itemSlice.actions;
export const itemReducer = itemSlice.reducer;
