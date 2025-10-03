import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import formReducer from "./slices/formSlice";
import signerReducer from "./slices/signerSlice";
import templateReducer from "./slices/templateSlice";
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    form: formReducer,
    signer: signerReducer,
    template: templateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
