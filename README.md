# <p align="center"><img src="frontend/public/logo (1).png" width="80" alt="RakshaChain Logo"><br>RakshaChain</p>

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Ethereum_Sepolia-004E9E?style=for-the-badge&logo=ethereum" alt="Sepolia Badge">
  <img src="https://img.shields.io/badge/Storage-IPFS_%2B_Pinata-36D6B7?style=for-the-badge&logo=ipfs&logoColor=white" alt="IPFS Badge">
  <img src="https://img.shields.io/badge/Security-AI_Fuzzing-EF4444?style=for-the-badge&logo=openai" alt="Security Badge">
  <img src="https://img.shields.io/badge/Frontend-React_Vite-F6CC63?style=for-the-badge&logo=react&logoColor=032360" alt="React Badge">
  <img src="https://img.shields.io/badge/Status-Hackathon_MVP-success?style=for-the-badge" alt="Status Badge">
</p>

---

## 🛡️ The Problem: The Silence of Stolen Funds
Public infrastructure funds globally are plagued by a structural "Opacity Crisis". In India alone, billions of rupees are misappropriated through:
*   **Ghost Projects**: Funding for roads and buildings that only exist on paper.
*   **Manual Bureaucracy**: Non-transparent approval loops where funds vanish between departments.
*   **Proof Inflation**: Contractors getting paid without delivering verifiable work.

**RakshaChain** is an end-to-end cryptographic transparency platform that makes corruption structurally impossible by placing every rupee, every approval, and every proof of work on an immutable, public ledger.

---

## ✨ Key Features

### 🌍 Immersive Project Map & Premium UI
*   **Dynamic UI**: A cohesive, glassmorphic dark theme (`#004E9E` base) featuring dynamic GSAP smooth-scroll animations and procedural HTML5 Canvas particle networks.
*   **MapLibre GL Integration**: Automatically centers and zooms into active project locations.
*   **Live HUD**: Real-time project counts, status indicators, and bounding visual pins.

### 📜 Integrity Timeline (Public Ledger)
A human-readable transaction feed that translates raw blockchain technicalities into plain English.
*   **Proof Tracking**: Clickable links to Etherscan to verify every transaction.
*   **Role Identification**: Clearly see who initiated, submitted, and approved each phase.
*   **Historical Audit**: A scrolling, immutable history of all government spending.

### 🕵️ Inspector Role & IPFS Proof-of-Work
A dedicated dashboard for on-site inspectors to verify physical progress.
*   **Tamper-Proof Storage**: Upload on-site photos directly to the decentralized **IPFS** network via the **Pinata API**. Images cannot be altered or deleted.
*   **Emergency Pause**: Inspectors have the power to instantly trigger an on-chain `emergencyPause`—blocking the project's budget and freezing all pending escrow funds if fraud or incomplete work is detected.

### 🤖 AI-Driven Autonomous Fuzz Tester
An advanced backend microservice that acts as an autonomous security agent to protect the platform.
*   **Dynamic Mutation Engine**: Uses AI (OpenRouter API) to analyze server errors and dynamically generate context-aware payloads to attempt logic bypasses.
*   **Live Attack Terminal**: A high-visibility dashboard integrated directly into the Admin panel to monitor the fuzzer's attacks in real-time.
*   **Automated Remediation Reports**: Generates professional, actionable Markdown security reports on completion.

---

## 🛠️ Technology Stack
*   **Core**: Solidity (Smart Contracts)
*   **Network**: Ethereum Sepolia Testnet
*   **Decentralized Storage**: IPFS, Pinata API
*   **Frontend**: React + Vite + Tailwind CSS + GSAP (Animations)
*   **Mapping**: MapLibre GL + React-Map-GL
*   **AI Security Backend**: FastAPI, Python, OpenRouter (GPT-4o-mini)
*   **Blockchain Integration**: Ethers.js

---

## 🚀 Getting Started

### Prerequisites
1.  **Node.js**: v18+ recommended.
2.  **Python 3.10+**: Required for the Fuzz Tester Backend.
3.  **MetaMask**: Connected to the **Sepolia Testnet**.
4.  **API Keys**: You will need a Pinata JWT and an OpenRouter API Key.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/rakshachain.git
    cd rakshachain
    ```

2.  **Setup the AI Security Backend**:
    ```bash
    cd "fuzz tester/backend"
    python -m venv venv
    source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
    pip install -r requirements.txt
    cp .env.example .env      # Edit .env with your OpenRouter API Key
    uvicorn main:app --port 8001 --reload
    ```

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    cp .env.example .env      # Edit .env with your Pinata JWT
    npm run dev
    ```

4.  **Access the App**:
    Open `http://localhost:5173` (or the port shown in your terminal).

---

## 📋 How to Test (Role-Based Flow)

1.  **Admin (Treasury)**: Connect wallet -> Switch Role to Admin -> Create a Project (allocates total budget). View live AI Fuzzing metrics at the bottom of the dashboard.
2.  **Contractor**: Switch Role to Contractor -> Select Project -> Submit Proof (upload CID/Link) for a milestone.
3.  **Inspector**: Switch Role to Inspector -> Upload IPFS on-site photos -> Block the Budget if fraud is suspected.
4.  **Auditor (Third-Party)**: Switch Role to Auditor -> Review IPFS Proof -> Approve Milestone (releases funds from Escrow to Contractor).
5.  **Public (Citizen)**: Switch Role to Public -> View the **Immersive Map** and the **Integrity Timeline** to monitor the flow of public money.

---

<p align="center">
  <b>RakshaChain</b> • <i>Guarding Public Funds with Cryptographic Truth</i>
</p>
