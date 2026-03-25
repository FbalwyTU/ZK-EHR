const fs = require("fs");
const { performance } = require("perf_hooks");
const { createIpfsClient } = require("../lib/ipfsClient");
const {
  encryptFileBuffer,
  generateRecordKey,
} = require("../lib/recordCrypto");

const ipfs = createIpfsClient();

const outputCsv = "evaluation/upload_scalability.csv";
const fileList = [
  { label: "Small Text Record (200KB)", path: "downloads/ehr_text_200kb.pdf" },
  { label: "Annotated PDF (1MB)", path: "downloads/ehr_annotated_1mb.pdf" },
  { label: "X-Ray Image (5MB)", path: "downloads/ehr_xray_5mb.pdf" },
  { label: "MRI Scan (10MB)", path: "downloads/ehr_mri_10mb.pdf" },
];

// إنشاء الملف إذا لم يوجد
const header =
  "file_type,upload_time_ms,cid,success,plaintext_bytes,ciphertext_bytes,timestamp";
if (!fs.existsSync(outputCsv)) {
  fs.writeFileSync(outputCsv, header + "\n");
}

(async () => {
  for (const file of fileList) {
    console.log(`\n📦 Uploading: ${file.label}`);
    const exists = fs.existsSync(file.path);
    if (!exists) {
      console.warn(`⚠️ File not found: ${file.path}. Skipping.`);
      continue;
    }

    const buffer = fs.readFileSync(file.path);
    const encrypted = encryptFileBuffer(buffer, generateRecordKey());

    const t0 = performance.now();
    let cid = "";
    let success = false;

    try {
      const result = await ipfs.add(encrypted.ciphertext);
      cid = result.cid.toString();
      success = true;
    } catch (err) {
      console.error(`❌ Upload failed for ${file.label}:`, err.message);
    }

    const t1 = performance.now();
    const timeTaken = (t1 - t0).toFixed(2);

    const line = [
      file.label,
      timeTaken,
      cid,
      success,
      buffer.length,
      encrypted.ciphertext.length,
      new Date().toISOString(),
    ].join(",");

    fs.appendFileSync(outputCsv, line + "\n");

    console.log(
      `✅ Done: ${file.label} | Time: ${timeTaken} ms | Success: ${success}`
    );
  }

  console.log(`\n📊 All results saved to: ${outputCsv}`);
})();
