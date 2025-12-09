"use client";

import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/PersonAdd";
import { useDispatch } from "react-redux";
import { setRecipients } from "@/store/slices/formSlice";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Recipient = {
  label: string;
  name: string;
  email: string;
  phone: string;
};

export default function RecipientForm({
  setStepCount,
}: {
  setStepCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const t = useTranslations("createContract");
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, Partial<Recipient>>>({});
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setFields([uuid()]);
  }, []);

  const handleAdd = () => setFields((prev) => [...prev, uuid()]);
  const handleRemove = (id: string) =>
    setFields((prev) => prev.filter((f) => f !== id));

  const validate = (id: string, data: FormData): Partial<Recipient> => {
    const name = data.get(`name-${id}`)?.toString().trim() || "";
    const email = data.get(`email-${id}`)?.toString().trim() || "";
    const phone = (data.get(`phone-${id}`)?.toString().trim() || "").replace(
      /\s+/g,
      ""
    );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;

    const err: Partial<Recipient> = {};
    if (!name) err.name = t("signerNameRequired") as any;
    if (!email) err.email = t("signerEmailRequired") as any;
    else if (!emailRegex.test(email))
      err.email = t("signerEmailInvalid") as any;

    if (!phone) err.phone = t("phoneRequired") as any;
    else if (!phoneRegex.test(phone)) err.phone = t("phoneInvalidTR") as any;

    return err;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const recipients: any[] = [];
    const newErrors: typeof errors = {};
    const colorList = ["#4F6D7A", "#00897B", "#CE93D8", "#E64A19", "#0288D1"];

    fields.forEach((id) => {
      const validation = validate(id, data);
      if (Object.keys(validation).length > 0) {
        newErrors[id] = validation;
      } else {
        recipients.push({
          label: data.get(`label-${id}`),
          SignerName: data.get(`name-${id}`)?.toString().trim(),
          Signer: data.get(`email-${id}`)?.toString().trim(),
          phoneNumber: `+${data.get(`phone-${id}`)?.toString().trim()}`,
          color: colorList[recipients.length % colorList.length],
        });
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Duplicate kontrolü
    const names = recipients.map((r) => r.SignerName?.toLowerCase());
    const emails = recipients.map((r) => r.Signer?.toLowerCase());
    const phones = recipients.map((r) => r.phoneNumber);

    const hasDuplicate =
      new Set(names).size !== names.length ||
      new Set(emails).size !== emails.length ||
      new Set(phones).size !== phones.length;

    if (hasDuplicate) {
      showSnackbar(t("duplicateRecipient"), "error");
      return;
    }

    dispatch(setRecipients(recipients));
    setStepCount((prev) => prev + 1);
  };

  if (fields.length === 0) return null;

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {fields.map((id, key) => (
        <Box padding="30px" border={"1px solid #ddd"} mb={"20px"} key={id}>
          <Box textAlign={"right"}>
            <IconButton
              onClick={() => handleRemove(id)}
              disabled={fields.length === 1}
              aria-label={t("delete")}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name={`name-${id}`}
                  label={t("signerNameLabel")}
                  error={!!errors[id]?.name}
                  helperText={errors[id]?.name}
                  id={id}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name={`email-${id}`}
                  label={t("signerEmailLabel")}
                  autoCapitalize="none"
                  error={!!errors[id]?.email}
                  helperText={errors[id]?.email}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <PhoneInput
                    country="tr"
                    value={""}
                    onChange={(value) => {
                      const input = document.querySelector(
                        `input[name="phone-${id}"]`
                      ) as HTMLInputElement;
                      if (input) input.value = value;
                    }}
                    inputProps={{ name: `phone-${id}` }}
                    containerClass="recipient-phone-container"
                    inputClass="recipient-phone-input"
                    buttonClass="recipient-phone-button"
                    dropdownClass="recipient-phone-dropdown"
                  />

                  {errors[id]?.phone && (
                    <p
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors[id]?.phone}
                    </p>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name={`label-${id}`}
                  label={t("labelOptionalLabel")}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      ))}

      <Box
        mt={2}
        display="flex"
        gap={2}
        justifyContent={"space-between"}
        width={"100%"}
      >
        <Button onClick={handleAdd} variant="outlined" startIcon={<AddIcon />}>
          {t("addRecipient")}
        </Button>

        <Box display={"flex"} gap={3}>
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
      </Box>
    </form>
  );
}
