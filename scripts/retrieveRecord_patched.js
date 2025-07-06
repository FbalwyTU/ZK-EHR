const { create } = require("ipfs-http-client");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("✅ Verifying proof...");

  const verifierFactory = await hre.ethers.getContractFactory(
    "Groth16Verifier"
  );
  const verifier = await verifierFactory.attach(
    "0x20e2F410f01733af079A5599c72b03351386F935"
  );

  // ثابتة من test/verifier.test.js
  const a = [
    "0x1eceb4dd7f1dd45cefd8df0a0dc7f031eb13a0e0fdc110a4306d30615b94e515",
    "0x1ea898c3bf2eae85a2fa979f4971a94f3b5fa5f0828cfbb99f15b6d542365e64",
  ];
  const b = [
    [
      "0x03c1c6698fde5dad6b5ba77454f247f3059a2323ab4422dcc6d0812bbb54b814",
      "0x1d54d56c6c8018bfe985a4e0965329b534ca90045684ec575fa038e0a8330de8",
    ],
    [
      "0x2f17ec5862af067532b0a64153917899d50e5772bee2e2e1f4acd7c2a16e9fc1",
      "0x2f82c59dbc18208d1b53d30d0ef6c47cfd8b1cee168959bc0737bc978f697508",
    ],
  ];
  const c = [
    "0x17d5519c54308746cadd792f8a5680284e225b70a298974048ef932bbbd8fdfe",
    "0x2f41d450885994a22d3fd9582ca9662a4be91eb9387dcff7faa016b1eb1da27b",
  ];
  const input = ["0x1"];

  const result = await verifier.verifyProof(a, b, c, input);
  console.log("✅ Verification result:", result);

  if (!result) {
    console.error("❌ Proof verification failed.");
    return;
  }

  // إعداد IPFS
  const ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });
  const fileCID = "QmcNn6ANuTbNpVsVBbS3HZHCZ5JHtdXoMufYmvBc1YF5CA";

  console.log("⬇️ Downloading encrypted record from IPFS...");
  const stream = ipfs.cat(fileCID);

  const downloadDir = path.join(__dirname, "../downloads");
  const filePath = path.join(downloadDir, "Encrypted_EHR.pdf");

  if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir, { recursive: true });

  const writeStream = fs.createWriteStream(filePath);
  for await (const chunk of stream) {
    writeStream.write(chunk);
  }

  console.log("✅ File downloaded to:", filePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
