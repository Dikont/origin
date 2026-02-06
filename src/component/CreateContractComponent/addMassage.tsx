"use client";

import { Box, Button, Grid, TextField } from "@mui/material";
import { useRef, useState } from "react";
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

  const [docNameError, setDocNameError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef?.current;
    if (!form) return;

    const docName = form.DocumentName?.value?.trim?.() || "";

    if (!docName) {
      const msg = t("documentNameRequired");
      setDocNameError(msg);
      showSnackbar(msg, "error"); // istersen bunu kaldırıp sadece helper da yapabiliriz
      return;
    }

    setDocNameError("");

    const formData = new FormData(form);

    dispatch(
      setDocumentNameAndDesc({
        DocumentName: formData.get("DocumentName")?.toString() || "",
        DocumentDesc: formData.get("DocumentDesc")?.toString() || "",
      }),
    );
    setStepCount((prev) => prev + 1);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Box
        sx={{
          p: "30px",
          border: "2px solid #fff",
          borderRadius: 4,
          mb: "20px",
          backgroundImage: "linear-gradient(135deg, #646E9F 0%, #453562 100%)",
          boxShadow:
            "0px 10px 30px rgba(0, 0, 0, 0.3), 0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box
          sx={{
            border: "1px solid rgba(255,255,255,0.75)",
            borderRadius: 4,
            p: 2,
            mt: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={0}>
            <Grid size={12}>
              <TextField
                fullWidth
                name="DocumentName"
                label={t("documentNameLabel")}
                error={!!docNameError}
                helperText={docNameError || " "}
                onChange={() => {
                  if (docNameError) setDocNameError("");
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#fff !important",
                    fontWeight: 600,
                  },

                  // normal label
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },

                  // focus
                  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },

                  // ✅ error label (burası eksikti)
                  "& .MuiInputLabel-root.Mui-error": {
                    color: "#fd9d9d !important",
                  },

                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                      borderRadius: "12px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.6)",
                    },
                    "&.Mui-focused fieldset": { borderColor: "#fff" },
                    "&.Mui-error fieldset": {
                      borderColor: "#fd9d9d !important",
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow:
                        "0 0 0 1000px transparent inset !important",
                      WebkitTextFillColor: "#fff !important",
                      transition: "background-color 5000s ease-in-out 0s",
                    },
                  },

                  "& .MuiFormHelperText-root.Mui-error": {
                    color: "#fd9d9d !important",
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                name="DocumentDesc"
                label={t("documentDescLabel")}
                multiline
                rows={4}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#ffffff !important",
                    fontWeight: 600,
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#ffffff",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "12px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.6)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#ffffff",
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow:
                        "0 0 0 1000px transparent inset !important",
                      WebkitTextFillColor: "#ffffff !important",
                      transition: "background-color 5000s ease-in-out 0s",
                    },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ALT BUTONLAR (panel stili) */}
      <Box
        mt={2}
        display="flex"
        gap={2}
        justifyContent="space-between"
        width="100%"
      >
        <Button
          variant="contained"
          onClick={() => setStepCount((prev) => prev - 1)}
          sx={{
            py: 1,
            px: 3,
            borderRadius: 2,
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            background: "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
            },
          }}
        >
          {t("back")}
        </Button>

        <Button
          type="submit"
          variant="contained"
          sx={{
            py: 1,
            px: 3,
            borderRadius: 2,
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            background: "linear-gradient(135deg, #025f4d 0%, #01775f 100%)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #01775f 0%, #025f4d 100%)",
            },
          }}
        >
          {t("continue")}
        </Button>
      </Box>
    </form>
  );
}
