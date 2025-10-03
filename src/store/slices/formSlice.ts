import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Recipient = {
  label: string;
  SignerName: string;
  Signer: string;
  phoneNumber: string;
  color: string;
};

type DocumentNameAndDesc = {
  DocumentName: string;
  DocumentDesc: string;
};

type FormState = {
  recipients: Recipient[];
  documentNameAndDesc: DocumentNameAndDesc;
  signerTabs: any;
  docs: any;
};
const initialState: FormState = {
  recipients: [],
  documentNameAndDesc: {
    DocumentName: "",
    DocumentDesc: "",
  },
  signerTabs: [],
  docs: [],
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setRecipients: (state, action: PayloadAction<Recipient[]>) => {
      state.recipients = action.payload;
    },
    setDocumentNameAndDesc: (
      state,
      action: PayloadAction<DocumentNameAndDesc>
    ) => {
      state.documentNameAndDesc = action.payload;
    },
    setSignerTabs: (state, action: PayloadAction<any[]>) => {
      state.signerTabs = action.payload;
    },
    setDocs: (state, action: PayloadAction<any[]>) => {
      state.docs = action.payload;
    },
    clearSignerTabs: (state) => {
      state.signerTabs = [];
    },
    resetFormData: () => initialState,
  },
});

export const {
  setRecipients,
  setDocumentNameAndDesc,
  resetFormData,
  setSignerTabs,
  clearSignerTabs,
  setDocs,
} = formSlice.actions;
export default formSlice.reducer;
