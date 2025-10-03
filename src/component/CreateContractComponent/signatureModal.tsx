"use client";
import { Dialog, DialogTitle, DialogActions, Button, Box } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function SignatureModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (base64: string) => void;
}) {
  const t = useTranslations("createContract");
  const sigRef = useRef<SignatureCanvas>(null);

  const handleSave = () => {
    if (sigRef.current) {
      const base64 = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      onSave(base64);
      onClose();
    }
  };

  const handleClear = () => {
    sigRef.current?.clear();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>{t("signatureTitle")}</DialogTitle>
      <Box bgcolor="#ddd" p="20px" mx="20px" width="250px" height="150px">
        <Box
          border="1px solid #ddd"
          bgcolor="white"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <SignatureCanvas
            penColor="black"
            canvasProps={{ width: 200, height: 100, className: "sigCanvas" }}
            ref={sigRef}
          />
        </Box>
      </Box>
      <DialogActions>
        <Button onClick={handleClear}>{t("signatureClear")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("signatureSave")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
