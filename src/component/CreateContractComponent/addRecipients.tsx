"use client";

import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
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
  language: string;
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
      "",
    );
    const language = data.get(`language-${id}`)?.toString();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;

    const err: Partial<Recipient> = {};
    if (!name) err.name = t("signerNameRequired") as any;
    if (!email) err.email = t("signerEmailRequired") as any;
    else if (!emailRegex.test(email))
      err.email = t("signerEmailInvalid") as any;

    if (!phone) err.phone = t("phoneRequired") as any;
    else if (!phoneRegex.test(phone)) err.phone = t("phoneInvalidTR") as any;

    if (!language || language === "") {
      // Recipient tipinde 'language' yoksa any ile geçebilirsin veya tipi güncelleyebilirsin
      (err as any).language = t("languageError") as any;
    }

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
          Signer: data
            .get(`email-${id}`)
            ?.toString()
            .trim()
            .toLocaleLowerCase(),
          phoneNumber: `+${data.get(`phone-${id}`)?.toString().trim()}`,
          Language: data.get(`language-${id}`)?.toString() || "tr",
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
        <Box
          padding="30px"
          border={"2px solid #fff"}
          borderRadius={4}
          mb={"20px"}
          key={id}
          sx={{
            backgroundImage:
              "linear-gradient(135deg, #646E9F 0%, #453562 100%)",
            boxShadow:
              "0px 10px 30px rgba(0, 0, 0, 0.3), 0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box
            mb={1}
            display="flex"
            alignItems="start"
            justifyContent="space-between"
          >
            {/* ... Box içi kodları ... */}
            <Box display="flex-row" alignItems="start">
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {t("emailLanguageTitle")}
              </Typography>

              <Select
                name={`language-${id}`}
                defaultValue="tr"
                size="small"
                error={!!(errors as any)[id]?.language}
                sx={{
                  minWidth: 140,
                  color: "#fff",
                  borderRadius: "8px", // Köşeleri yumuşattık
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif transparan arka plan
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)", // Border'ı belirgin ama yumuşak yaptık
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff", // Üzerine gelince parlasın
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff", // Seçildiğinde border netleşsin
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#fff", // Yan taraftaki ok ikonu beyaz olsun
                  },
                  fontSize: "14px",
                  height: "40px",
                }}
                // Açılan menü (dropdown) tasarımı için:
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#2c345a", // Dashboard rengine yakın koyu bir ton
                      color: "#fff",
                      marginTop: "8px",
                      "& .MuiMenuItem-root": {
                        fontSize: "14px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="tr">{t("trLanguage")}</MenuItem>
                <MenuItem value="en">{t("enLanguage")}</MenuItem>
                <MenuItem value="nl">{t("nlLanguage")}</MenuItem>
              </Select>

              {/* Hata Mesajını göstermek istersen altına ekleyebilirsin */}
              {(errors as any)[id]?.language && (
                <Typography color="error" variant="caption" display="block">
                  {t("languageError")}
                </Typography>
              )}
            </Box>

            <IconButton
              onClick={() => handleRemove(id)}
              disabled={fields.length === 1}
              aria-label={t("delete")}
              sx={{
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                // ContractInfo'daki kırmızı badge stili
                backgroundColor: "rgba(211, 47, 47, 0.6)",
                border: "1px solid rgba(211, 47, 47, 0.6)",
                color: "#fff",
                boxShadow: "0 10px 22px rgba(211,47,47,0.18)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.8)",
                  boxShadow: "0 12px 25px rgba(211,47,47,0.30)",
                  transform: "scale(1.05)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(156, 163, 175, 0.3)",
                  border: "1px solid rgba(156, 163, 175, 0.3)",
                  color: "rgba(255, 255, 255, 0.3)",
                  boxShadow: "none",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 25 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              border: "1px solid #fff",
              borderRadius: 4,
              padding: 3,
              mb: 2,
              mt: 2,
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name={`email-${id}`}
                  label={t("signerEmailLabel")}
                  autoCapitalize="none"
                  error={!!errors[id]?.email}
                  helperText={errors[id]?.email}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <PhoneInput
                    country="tr"
                    value={""}
                    placeholder="1 (702) 123-4567" // Placeholder buraya
                    onChange={(value) => {
                      const input = document.querySelector(
                        `input[name="phone-${id}"]`,
                      ) as HTMLInputElement;
                      if (input) input.value = value;
                    }}
                    inputProps={{
                      name: `phone-${id}`,
                      // Bazı durumlarda placeholder buraya da gerekebilir
                      placeholder: "1 (702) 123-4567",
                    }}
                    dropdownStyle={{
                      backgroundColor: "#2c345a",
                      color: "white",
                      textAlign: "left", // Yazıların sola hizalı olduğundan emin olalım
                    }}
                    containerClass="recipient-phone-container"
                    inputClass="recipient-phone-input"
                    buttonClass="recipient-phone-button"
                    dropdownClass="recipient-phone-dropdown"
                  />

                  {errors[id]?.phone && (
                    <Typography
                      sx={{
                        color: "#fd9d9d", // Daha canlı, okunabilir bir kırmızı
                        fontSize: "13px",
                        fontWeight: 500,
                        mt: "4px",
                        ml: "14px",
                      }}
                    >
                      {errors[id]?.phone}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name={`label-${id}`}
                  label={t("labelOptionalLabel")}
                  sx={{
                    // 1. Yazı ve Label Rengi
                    "& .MuiInputBase-input": {
                      color: "#ffffff !important", // Yazı her zaman beyaz
                      fontWeight: 600,
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)", // Normalde hafif transparan beyaz
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#ffffff", // Tıklanınca (focus) tam beyaz
                    },

                    // 2. Border (Kenarlık) Ayarları
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)", // Normal border
                        borderRadius: "12px",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.6)", // Üstüne gelince beyazımsı
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ffffff", // Tıklanınca tam beyaz border
                      },

                      // 3. Autofill (Otomatik Doldurma) Beyazlığını Yok Etme
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow:
                          "0 0 0 1000px transparent inset !important", // Arka planı şeffaf tutar
                        WebkitTextFillColor: "#ffffff !important", // Autofill yazısını beyaz yapar
                        transition: "background-color 5000s ease-in-out 0s",
                      },
                    },

                    // 4. Placeholder Rengi
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
      ))}

      <Box
        mt={2}
        display="flex"
        gap={2}
        justifyContent={"space-between"}
        width={"100%"}
      >
        <Button
          onClick={handleAdd}
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{
            py: 1,
            px: 2,
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
          {t("addRecipient")}
        </Button>

        <Box display={"flex"} gap={3}>
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
      </Box>
    </form>
  );
}
