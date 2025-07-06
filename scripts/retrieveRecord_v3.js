const { ethers } = require("hardhat");
const fs = require("fs");
const { create } = require("ipfs-http-client");
const path = require("path");

async function main() {
  console.log("✅ Verifying proof...");

  // تحميل البيانات من ملفات JSON
  const proof = JSON.parse(fs.readFileSync("proof.json"));
  const publicSignals = JSON.parse(fs.readFileSync("public.json"));

  // تحويل القيم من string إلى BigInt
  const a = [proof.pi_a[0], proof.pi_a[1]];
  const b = [
    [proof.pi_b[0][0], proof.pi_b[0][1]],
    [proof.pi_b[1][0], proof.pi_b[1][1]],
  ];
  const c = [proof.pi_c[0], proof.pi_c[1]];
  const input = publicSignals;

  // الاتصال بالعقد
  const verifierArtifact = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await verifierArtifact.attach(
    "0x20e2F410f01733af079A5599c72b03351386F935" // ← ضع العنوان الصحيح هنا
  );

  // التحقق من الإثبات
  const result = await verifier.verifyProof(a, b, c, input);
  console.log("✅ Verification result:", result);

  if (!result) {
    console.error("❌ Proof verification failed.");
    return;
  }

  // تحميل الملف من IPFS
  const ipfs = create({ url: "http://localhost:5001" }); // تأكد أن IPFS daemon يعمل
  const fileCID = "QmcNn6ANuTbNpVsVBbS3HZHCZ5JHtdXoMufYmvBc1YF5CA"; // ← CID الخاص بالملف المشفر
  const chunks = [];

  for await (const chunk of ipfs.cat(fileCID)) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const outputPath = path.join(__dirname, "downloaded", "EHR_record.pdf");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  console.log("📥 File downloaded successfully to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
