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
      const res = await fetch("/api/admin/createAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.error || data?.message || "Hata");

      if (data.loginResult.succeeded) {
        try {
          const res = await fetch("/api/admin/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: requestId,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || JSON.stringify(data));
          if (data.message == "Kullanıcı kaydı tamamlandı.") {
            showSnackbar("Kullanıcı oluşturuldu.", "success");
            router.push("/admin");
          } else {
            showSnackbar("İstek onaylanamadı veya hata oluştu", "error");
          }
        } catch (e: any) {
          console.error(e);
        }
        showSnackbar("Kullanıcı oluşturuldu.", "success");
      } else {
        showSnackbar("Kullanıcı oluşturulamadı.", "error");
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
