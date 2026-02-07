"use client";

import { Button, Tooltip } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useTranslations } from "next-intl";

export default function CopySigningLinkButton({
  url,
  label,
  disabledLabel,
}: {
  url?: string | null;
  label?: string;
  disabledLabel?: string;
}) {
  const t = useTranslations("followContracts");
  const { showSnackbar } = useSnackbar();

  const canCopy = Boolean(url && String(url).trim().length > 0);

  const copy = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(String(url));
      showSnackbar(t("copyLink.success"), "success", 2000);
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = String(url);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showSnackbar(t("copyLink.success"), "success", 2000);
      } catch {
        showSnackbar(t("copyLink.error"), "error", 2000);
      }
    }
  };

  const btnLabel = label ?? t("copyLink.button");
  const tipLabel = label ?? t("copyLink.tooltip");
  const tipDisabled = disabledLabel ?? t("copyLink.disabled");

  return (
    <Tooltip title={canCopy ? tipLabel : tipDisabled}>
      <span>
        <Button
          onClick={copy}
          startIcon={<ContentCopyRoundedIcon />}
          variant="contained"
          disabled={!canCopy}
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
          {btnLabel}
        </Button>
      </span>
    </Tooltip>
  );
}
