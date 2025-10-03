import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SelectedTemplate = {
  groupId?: number | string | null;
  documentS3Path: string;
  name?: string | null;
  desc?: string | null;
};

type State = { selected: SelectedTemplate | null };
const initialState: State = { selected: null };

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<SelectedTemplate>) => {
      state.selected = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selected = null;
    },
  },
});

export const { setSelectedTemplate, clearSelectedTemplate } =
  templateSlice.actions;
export default templateSlice.reducer;
