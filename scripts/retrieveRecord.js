const fs = require("fs");
const { performance } = require("perf_hooks");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const snarkjs = require("snarkjs");
const { create } = require("ipfs-http-client");

// ✅ استخدام IPFS gateway آمن ومستقر
const ipfs = create({ url: "https://ipfs.io" });

// إعدادات الاتصال بالعقد الذكي
const PRIVATE_KEY =
  "0xaf84bf2b9192e8cce18aa4fdcb95255a08d2447070c016a1114771695213e498";
const verifierAddress = "0x20e2F410f01733af079A5599c72b03351386F935";
const provider = new JsonRpcProvider("http://localhost:8545");
const wallet = new Wallet(PRIVATE_KEY, provider);
const verifierAbi =
  require("../artifacts/contracts/Verifier.sol/Groth16Verifier.json").abi;
const verifier = new Contract(verifierAddress, verifierAbi, wallet);

// الملفات
const input = JSON.parse(fs.readFileSync("circuits/input.json"));
const wasmPath = "circuits/access_js/access.wasm";
const zkeyPath = "access_final.zkey";
const encryptedFilePath = "downloads/Encrypted_EHR.pdf";
const logPath = "evaluation/evaluation_logs.csv";

// إعداد ملف CSV
const header =
  "scenario,proof_time_ms,verification_time_ms,gas_used,ipfs_latency_ms,cid,valid,timestamp";
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, header + "\n");
}

(async () => {
  const iterations = 20;

  for (let i = 1; i <= iterations; i++) {
    console.log(`\n🔁 Iteration ${i} of ${iterations}`);

    const t0 = performance.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    const t1 = performance.now();
    const proofTime = t1 - t0;

    const callData = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const argv = JSON.parse("[" + callData + "]");
    const a = argv[0];
    const b = argv[1];
    const c = argv[2];
    const inputArr = argv[3];

    const tVerifyStart = performance.now();
    const isValid = await verifier.verifyProof(a, b, c, inputArr);
    const tVerifyEnd = performance.now();
    const verifyTime = tVerifyEnd - tVerifyStart;

    const t3 = performance.now();
    const encryptedFile = fs.readFileSync(encryptedFilePath);
    const ipfsResult = await ipfs.add(encryptedFile);
    const t4 = performance.now();
    const ipfsLatency = t4 - t3;
    const cid = ipfsResult.cid.toString();

    const result = {
      scenario: "scenario1-valid-proof",
      proof_time_ms: proofTime.toFixed(2),
      verification_time_ms: verifyTime.toFixed(2),
      gas_used: 0,
      ipfs_latency_ms: ipfsLatency.toFixed(2),
      cid: cid,
      valid: isValid,
      timestamp: new Date().toISOString(),
    };

    const line = Object.values(result).join(",");
    fs.appendFileSync(logPath, line + "\n");

    console.log(`✅ Iteration ${i} done`);
    console.log(
      `   ⏱️ Proof: ${result.proof_time_ms} ms | Verify: ${result.verification_time_ms} ms | IPFS: ${result.ipfs_latency_ms} ms | Valid: ${result.valid}`
    );

    // 🕒 تأخير بين التكرارات لتفادي التجميد أو رفض الاتصال
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n🎯 All iterations completed. Results saved in:", logPath);
})();
