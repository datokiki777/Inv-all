/**
 * Sample invoice + renderer used ONLY by tools/generate-template-thumbnails.mjs
 * (bundled by esbuild, run in Node). Builds one neutral, fully-populated
 * invoice and renders it with each REAL template component, so the
 * thumbnails are always produced by the actual template code — never a
 * hand-drawn mock-up.
 */
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { buildInvoiceFromForm, blankInvoiceFormItem } from "@/utils/invoiceFormMapping";
import { defaultPdfVisibility } from "@/utils/invoicePdfVisibility";
import { getTemplate, listTemplates } from "@/pdf/templateRegistry";
import { getPdfLabels } from "@/pdf/labels";

// ---- tiny PNG encoder (RGBA) so the sample logo needs no image dependency ----
function crc32(buf: Buffer): number {
  let c: number, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
/** A neutral emblem: teal disc with a lighter inner ring — shows where each template places a logo. */
function sampleLogoDataUrl(): string {
  const size = 120, raw: number[] = [];
  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - size / 2, y - size / 2);
      let px = [0, 0, 0, 0];
      if (d < 56) px = [31, 111, 139, 255];
      if (d < 38 && d > 28) px = [186, 225, 238, 255];
      if (d < 16) px = [255, 255, 255, 255];
      raw.push(...px);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.from(raw))), chunk("IEND", Buffer.alloc(0))
  ]);
  return "data:image/png;base64," + png.toString("base64");
}

function sampleInvoice(templateId: string) {
  const company: any = {
    id: "sample-company", name: "Example Studio GmbH", addressLine1: "Musterstraße 12", postalCode: "10115",
    city: "Berlin", country: "Germany", email: "hello@example-studio.com", phone: "+49 30 1234 5678",
    website: "example-studio.com", vatId: "DE123456789", taxNumber: "12/345/67890", logoDataUrl: sampleLogoDataUrl(),
    bankDetails: { bankName: "Example Bank", accountHolder: "Example Studio GmbH", iban: "DE89 3704 0044 0532 0130 00", bic: "COBADEFFXXX" },
    defaultInvoiceLanguage: "en", defaultInvoiceTemplateId: templateId, defaultCurrency: "EUR",
    invoiceNumberFormat: "INV-{YYYY}-{seq:4}", nextInvoiceSequence: 2, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z"
  };
  const client: any = {
    id: "sample-client", type: "company", companyName: "Sample Client Ltd.", addressLine1: "Beispielweg 7",
    postalCode: "80331", city: "Munich", country: "Germany", email: "accounts@sample-client.com", vatId: "DE987654321"
  };
  const item = (name: string, description: string, quantity: number, unit: string, unitPrice: number) => ({
    ...blankInvoiceFormItem(19, unit as any), name, description, quantity, unitPrice
  });
  const values: any = {
    invoiceNumber: "INV-2026-0001", createdDate: "2026-01-15", serviceDate: "2026-01-10", dueDate: "2026-01-29",
    companyId: company.id, clientId: client.id,
    items: [
      item("Website design", "Landing page and brand styling", 1, "flatRate", 1800),
      item("Consulting", "Strategy workshop", 6, "hour", 95),
      item("Hosting & maintenance", "12 months", 1, "piece", 240)
    ],
    taxMode: "standard", taxRatePercent: 19, taxExplanationText: "", discountType: "none", discountValue: undefined,
    currency: "EUR", paidAmount: 0, note: "Thank you for your business!", paymentMethod: "bankTransfer",
    paymentTermsText: "Payment due within 14 days.", status: "sent", templateId, pdfLanguage: "en",
    pdfVisibility: { ...defaultPdfVisibility }
  };
  return buildInvoiceFromForm(values, { id: "sample-invoice", createdAt: "2026-01-15T00:00:00Z" }, company, client, "2026-01-15T00:00:00Z");
}

export async function renderAllSamplePdfs(outDir: string): Promise<string[]> {
  const written: string[] = [];
  for (const meta of listTemplates()) {
    const invoice = sampleInvoice(meta.id);
    const { Component: Template } = getTemplate(meta.id);
    const buffer = await pdf(<Template invoice={invoice} labels={getPdfLabels("en")} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const c of buffer as any) chunks.push(c as Buffer);
    const file = path.join(outDir, `${meta.id}.pdf`);
    fs.writeFileSync(file, Buffer.concat(chunks));
    written.push(meta.id);
  }
  return written;
}
