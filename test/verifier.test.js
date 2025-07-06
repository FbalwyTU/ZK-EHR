const { expect } = require("chai");
const hre = require("hardhat");

describe("Verifier Contract - ZK-EHR", function () {
  let verifier;

  before(async function () {
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
  });

  it("Should verify a valid zk-SNARK proof", async function () {
    const a = [
      "0x16153cf3add45bd2edcd65a532a21ef63575d3f2618f85f1d68a9bf75ab6070a",
      "0x2d1d560c58e619a10ce1370ed9a8d2293c6f44dbfc11e6200184e91dfadbbd1",
    ];

    const b = [
      [
        "0x964ea382584a9120b8acb596aaf69009fdc7988d133ee7312d5340eca85cc8",
        "0x736ef4757009d27f9b85563c5fab462f5709bca97998418914eaac2c4834590",
      ],
      [
        "0x22a0863e0c57edd4b491da35ba9de62d70c665654d48331e7df6f5ccbea8ac3",
        "0x2750edcf89433a5d3a1857ce27f743b59f7fb365830cc2675cbc6f886dff6ef6",
      ],
    ];

    const c = [
      "0x1040ee41407338be16daa6672e5b94e53fc51c2a0e437a299323e560dde59825",
      "0x2bd14feedce1453e4a324ea0a8a5af969366ea43853c359e37032a6171cfd772",
    ];

    const input = ["0x1"];

    const result = await verifier.verifyProof(a, b, c, input);
    expect(result).to.be.true;
  });

  it("Should reject an invalid zk-SNARK proof (all zero)", async function () {
    const a = ["0x0", "0x0"];
    const b = [
      ["0x0", "0x0"],
      ["0x0", "0x0"],
    ];
    const c = ["0x0", "0x0"];
    const input = ["0x0"];

    const result = await verifier.verifyProof(a, b, c, input);
    expect(result).to.be.false;
  });

  it("Should reject a proof with tampered a[0]", async function () {
    const a = [
      "0x9999999999999999999999999999999999999999999999999999999999999999", // tampered
      "0x2d1d560c58e619a10ce1370ed9a8d2293c6f44dbfc11e6200184e91dfadbbd1",
    ];

    const b = [
      [
        "0x964ea382584a9120b8acb596aaf69009fdc7988d133ee7312d5340eca85cc8",
        "0x736ef4757009d27f9b85563c5fab462f5709bca97998418914eaac2c4834590",
      ],
      [
        "0x22a0863e0c57edd4b491da35ba9de62d70c665654d48331e7df6f5ccbea8ac3",
        "0x2750edcf89433a5d3a1857ce27f743b59f7fb365830cc2675cbc6f886dff6ef6",
      ],
    ];

    const c = [
      "0x1040ee41407338be16daa6672e5b94e53fc51c2a0e437a299323e560dde59825",
      "0x2bd14feedce1453e4a324ea0a8a5af969366ea43853c359e37032a6171cfd772",
    ];

    const input = ["0x1"];

    const result = await verifier.verifyProof(a, b, c, input);
    expect(result).to.be.false;
  });

  it("Should reject a valid proof with invalid public input", async function () {
    const a = [
      "0x16153cf3add45bd2edcd65a532a21ef63575d3f2618f85f1d68a9bf75ab6070a",
      "0x2d1d560c58e619a10ce1370ed9a8d2293c6f44dbfc11e6200184e91dfadbbd1",
    ];

    const b = [
      [
        "0x964ea382584a9120b8acb596aaf69009fdc7988d133ee7312d5340eca85cc8",
        "0x736ef4757009d27f9b85563c5fab462f5709bca97998418914eaac2c4834590",
      ],
      [
        "0x22a0863e0c57edd4b491da35ba9de62d70c665654d48331e7df6f5ccbea8ac3",
        "0x2750edcf89433a5d3a1857ce27f743b59f7fb365830cc2675cbc6f886dff6ef6",
      ],
    ];

    const c = [
      "0x1040ee41407338be16daa6672e5b94e53fc51c2a0e437a299323e560dde59825",
      "0x2bd14feedce1453e4a324ea0a8a5af969366ea43853c359e37032a6171cfd772",
    ];

    const input = ["0x2"];

    const result = await verifier.verifyProof(a, b, c, input);
    expect(result).to.be.false;
  });

  it("Should reject execution with invalid public input size at the ABI level", async function () {
    const a = [
      "0x16153cf3add45bd2edcd65a532a21ef63575d3f2618f85f1d68a9bf75ab6070a",
      "0x2d1d560c58e619a10ce1370ed9a8d2293c6f44dbfc11e6200184e91dfadbbd1",
    ];

    const b = [
      [
        "0x964ea382584a9120b8acb596aaf69009fdc7988d133ee7312d5340eca85cc8",
        "0x736ef4757009d27f9b85563c5fab462f5709bca97998418914eaac2c4834590",
      ],
      [
        "0x22a0863e0c57edd4b491da35ba9de62d70c665654d48331e7df6f5ccbea8ac3",
        "0x2750edcf89433a5d3a1857ce27f743b59f7fb365830cc2675cbc6f886dff6ef6",
      ],
    ];

    const c = [
      "0x1040ee41407338be16daa6672e5b94e53fc51c2a0e437a299323e560dde59825",
      "0x2bd14feedce1453e4a324ea0a8a5af969366ea43853c359e37032a6171cfd772",
    ];

    const input = []; // intentionally invalid input size

    await expect(verifier.verifyProof(a, b, c, input)).to.be.rejectedWith(
      Error,
      /wrong length/i
    );
  });
});
