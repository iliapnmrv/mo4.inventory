import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { enqueueSnackbar } from "notistack";

/**
 * Log a warning and show a toast!
 */
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!

    if (isRejectedWithValue(action) && action.payload.status === 401) {
      console.log("We got a rejected action!", action.error);

      window.location.replace("http://mo4-web");

      enqueueSnackbar(123, {
        variant: "error",
      });
      //   toast.warn({ title: 'Async error!', message: action.error.data.message })
    }

    return next(action);
  };
