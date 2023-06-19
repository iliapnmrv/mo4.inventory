"use client";

import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "../redux/store";
import moment from "moment";
import "moment/locale/ru";
import { QueryClient, QueryClientProvider } from "react-query";
moment.locale("ru");

export const queryClient = new QueryClient();

export function Providers({ children }) {
  const persistor = persistStore(store);

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
