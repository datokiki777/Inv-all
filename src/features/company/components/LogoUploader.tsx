import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fileToCompressedDataUrl } from "@/utils/image";
import { useToast } from "@/components/ui/toast";

interface LogoUploaderProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}

/**
 * See companyService/CompanyPage docs for why logos are stored as a
 * compressed base64 data URL rather than a Blob. This component owns the
 * one conversion step (File -> compressed data URL) so nothing else in the
 * app needs to think about image encoding.
 */
export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast.error(t("company.logoUploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-surface-sunken">
        {value ? (
          <img src={value} alt={t("company.logoAlt")} className="h-full w-full object-contain" />
        ) : (
          <ImagePlus size={22} className="text-ink-faint" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? t("company.logoUploading") : t("company.uploadLogo")}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <X size={14} /> {t("company.removeLogo")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
