// src/store/slices/signerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SignerState = {
  docs: any[];
  vw_SignerTabs: any[];
};

const initialState: SignerState = {
  docs: [],
  vw_SignerTabs: [],
};

const signerSlice = createSlice({
  name: "signer",
  initialState,
  reducers: {
    setSignerData: (
      state,
      action: PayloadAction<{ docs: any[]; vw_SignerTabs: any[] }>
    ) => {
      state.docs = action.payload.docs;
      state.vw_SignerTabs = action.payload.vw_SignerTabs;
    },
    clearSignerData: (state) => {
      state.docs = [];
      state.vw_SignerTabs = [];
    },
  },
});

export const { setSignerData, clearSignerData } = signerSlice.actions;
export default signerSlice.reducer;
