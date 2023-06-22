import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from "redux-persist";
import { catalogApi } from "./catalog/catalog.api";
import { rtkQueryErrorLogger } from "./error-middleware";
import { inventoryApi } from "./inventory/inventory.api";
import { itemApi } from "./item/item.api";
import { itemReducer } from "./item/item.slice";
import { storage } from "./storage";

const reducers = combineReducers({
  [itemApi.reducerPath]: itemApi.reducer,
  [catalogApi.reducerPath]: catalogApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  item: itemReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: [
    itemApi.reducerPath,
    catalogApi.reducerPath,
    inventoryApi.reducerPath,
    "item",
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([
      rtkQueryErrorLogger,
      itemApi.middleware,
      catalogApi.middleware,
      inventoryApi.middleware,
    ]),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
