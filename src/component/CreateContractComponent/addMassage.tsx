"use client";

import { Box, Button, Grid, TextField } from "@mui/material";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { setDocumentNameAndDesc } from "@/store/slices/formSlice";
import { useSnackbar } from "../SnackbarProvider";
import { useTranslations } from "next-intl";

export default function AddMassage({
  setStepCount,
}: {
  setStepCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const t = useTranslations("createContract");
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const { showSnackbar } = useSnackbar();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef?.current;
    if (!form) return;

    if (!form.DocumentName?.value) {
      showSnackbar(t("documentNameRequired"), "error");
      return;
    }

    const formData = new FormData(form);

    dispatch(
      setDocumentNameAndDesc({
        DocumentName: formData.get("DocumentName")?.toString() || "",
        DocumentDesc: formData.get("DocumentDesc")?.toString() || "",
      })
    );
    setStepCount((prev) => prev + 1);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Box padding="30px" border={"1px solid #ddd"} mb={"20px"}>
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            padding: 2,
            mb: 2,
            backgroundColor: "#fafafa",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                name="DocumentName"
                label={t("documentNameLabel")}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                name="DocumentDesc"
                label={t("documentDescLabel")}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        mt={2}
        display="flex"
        gap={2}
        justifyContent="space-between"
        width="100%"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setStepCount((prev) => prev - 1)}
        >
          {t("back")}
        </Button>
        <Button type="submit" variant="contained" color="success">
          {t("continue")}
        </Button>
      </Box>
    </form>
  );
}
