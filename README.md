
# ZK-EHR: Zero-Knowledge Access Control Framework for Encrypted Health Records

ZK-EHR is a privacy-preserving, blockchain-orchestrated framework for secure access to encrypted Electronic Health Records (EHRs). It leverages zk-SNARKs for zero-knowledge proof generation, Ethereum-compatible smart contracts for on-chain proof verification, and IPFS for decentralized storage.

## 📌 Overview

This prototype demonstrates a modular and reproducible implementation of the ZK-EHR architecture. It integrates:
- **zk-SNARK circuits** written in Circom
- **Smart contracts** for proof verification deployed on Ethereum testnets
- **Evaluation scripts** to simulate authorized, adversarial, and concurrent access scenarios
- **Encrypted health record samples** to test file-based access and scalability

## 🧱 Project Structure

```
circuits/             → Circom circuit and proof inputs
contracts/            → Solidity smart contracts (Verifier)
evaluation/           → Evaluation scripts and result CSVs
downloads/            → Sample encrypted EHR files (PDFs)
scripts/              → Deployment and record retrieval scripts
client/, ipfs/, keys/ → Auxiliary directories for node config and assets
artifacts/, cache/    → Hardhat and build artifacts
```

## 🧪 Evaluation

The evaluation includes:
- Valid proof acceptance (Scenario 1)
- Proof tampering resistance (Scenario 2)
- Public input corruption detection (Scenario 3)
- Concurrent access simulation (Scenario 4)
Results are stored in CSV files under `evaluation/`.

## 🛠 Tech Stack

- Circom & SnarkJS for zk-circuit design and proof generation
- Solidity for smart contract implementation
- Hardhat for contract deployment and testing
- IPFS for decentralized encrypted file storage
- Node.js for scripting and orchestration

## 🔐 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute the source code for academic and non-commercial purposes.

## 📎 Publication

This code supports the experiments and evaluations described in our research manuscript. To cite or reproduce results, please refer to the public repository:

👉 [https://github.com/zk-ehr-prototype](https://github.com/zk-ehr-prototype)

## 📬 Contact

For feedback, questions, or collaboration inquiries, please reach out via the GitHub Issues section or through the corresponding author listed in the paper.
