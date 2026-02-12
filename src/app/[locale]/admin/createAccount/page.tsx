"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Company = {
  id: number;
  compName: string;
  compDescription: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};
const USER_ROLES = ["CompanyUser", "CompanySuperUser"] as const;
type Role = (typeof USER_ROLES)[number];

export default function CreateAccount() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    email: "",
    password: "",
    compName: "",
    FirstName: "",
    LastName: "",
    userRole: "CompanyUser" as Role,
    PhoneNumber: "",
    superUser: "",
    superPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const emailQuery = searchParams.get("email");
  useEffect(() => {
    if (!emailQuery) return;

    let decoded = emailQuery;
    try {
      decoded = decodeURIComponent(emailQuery);
    } catch {}
    setForm((p) => ({ ...p, email: decoded }));
  }, [emailQuery]);
  const onChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const raw = String(form.PhoneNumber || "").trim();
      const PhoneNumber = raw ? (raw.startsWith("+") ? raw : `+${raw}`) : "";
      if (!PhoneNumber) {
        showSnackbar("Telefon numarası zorunlu.", "error");
        return;
      }
      const payload = { ...form, PhoneNumber };
      const res1 = await fetch("/api/admin/createAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data1 = await res1.json().catch(() => ({}));

      // ❗createAccount başarısızsa: upstream errors/message göster
      if (!res1.ok) {
        const msg =
          Array.isArray(data1?.errors) && data1.errors.length > 0
            ? data1.errors.map((e: any) => e.description).join(" • ")
            : data1?.error || data1?.message || "Hata";
        showSnackbar(msg, "error");
        return;
      }

      // ✅ createAccount başarılı: loginResult bekleme
      showSnackbar(data1?.message || "Kullanıcı oluşturuldu.", "success");

      // complete adımı
      try {
        const res2 = await fetch("/api/admin/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId }),
        });

        const data2 = await res2.json().catch(() => ({}));

        if (!res2.ok) {
          showSnackbar(
            data2?.error || data2?.message || "İstek onaylanamadı",
            "error",
          );
          return;
        }

        if (data2.message == "Kullanıcı kaydı tamamlandı.") {
          showSnackbar("Kayıt tamamlandı.", "success");
          router.push("/admin");
        } else {
          showSnackbar("İstek onaylanamadı veya hata oluştu", "error");
        }
      } catch (e) {
        console.error(e);
        // createAccount başarılı ama complete patladıysa:
        showSnackbar(
          "Kullanıcı oluşturuldu ama onay adımı başarısız.",
          "error",
        );
      }
    } catch (err: any) {
      showSnackbar("Kullanıcı oluşturulamadı.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/getAllCompanies", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await res.json();
      const items: Company[] = Array.isArray(data) ? data : [];
      setCompanies(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 760, mx: "auto", p: { xs: 2, md: 3 } }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Create Account
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="email"
          value={form.email}
          disabled
          autoComplete="off"
        />
        <TextField
          fullWidth
          size="small"
          type="password"
          label="password"
          value={form.password}
          onChange={onChange("password")}
          autoComplete="new-password"
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          select
          label="compName"
          value={form.compName}
          onChange={(e) => setForm((p) => ({ ...p, compName: e.target.value }))}
        >
          {companies.map((item, key) => (
            <MenuItem key={key} value={item.compName}>
              {item.compName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          size="small"
          select
          label="userRole"
          value={form.userRole}
          onChange={(e) =>
            setForm((p) => ({ ...p, userRole: e.target.value as Role }))
          }
        >
          {USER_ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="FirstName"
          value={form.FirstName}
          onChange={onChange("FirstName")}
        />
        <TextField
          fullWidth
          size="small"
          label="LastName"
          value={form.LastName}
          onChange={onChange("LastName")}
        />
      </Stack>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
          Phone Number
        </Typography>

        <PhoneInput
          country="tr"
          value={(form.PhoneNumber || "").replace(/^\+/, "")}
          onChange={(value) => setForm((p) => ({ ...p, PhoneNumber: value }))}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="superUser"
          value={form.superUser}
          onChange={onChange("superUser")}
          autoComplete="off"
        />
        <TextField
          fullWidth
          size="small"
          type="password"
          label="superPassword"
          value={form.superPassword}
          onChange={onChange("superPassword")}
          autoComplete="new-password"
        />
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => history.back()}
        >
          Geri
        </Button>
        <Button variant="contained" type="submit" disabled={submitting}>
          {submitting ? "Gönderiliyor..." : "Hesap Oluştur"}
        </Button>
      </Stack>
    </Box>
  );
}
