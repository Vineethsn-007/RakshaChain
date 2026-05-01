# <p align="center"><img src="frontend/public/logo (1).png" width="80" alt="RakshaChain Logo"><br>RakshaChain</p>

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Ethereum_Sepolia-004E9E?style=for-the-badge&logo=ethereum" alt="Sepolia Badge">
  <img src="https://img.shields.io/badge/Frontend-React_Vite-F6CC63?style=for-the-badge&logo=react&logoColor=032360" alt="React Badge">
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind Badge">
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

### 🌍 Immersive Project Map
A 3D, interactive mapping system powered by **MapLibre GL**.
*   **Dynamic Zoom**: Automatically centers and zooms into active project locations.
*   **Live HUD**: Real-time project counts and status indicators.
*   **Visual Pins**: Bouncing, branded markers with glassmorphic info-cards.

### 📜 Integrity Timeline (Public Ledger)
A human-readable transaction feed that translates raw blockchain technicalities into plain English.
*   **Proof Tracking**: Clickable links to Etherscan to verify every transaction.
*   **Role Identification**: Clearly see who initiated, submitted, and approved each phase.
*   **Historical Audit**: A scrolling, immutable history of all government spending.

### 🚨 Autonomous Fraud Detection
Built-in anomaly detection within the Smart Contract layer.
*   **Instant Approval Flag**: Flags auditors who approve milestones too quickly (suspected collusion).
*   **Self-Approval Block**: Cryptographically prevents contractors from approving their own work.
*   **Transparency Score**: Visual metrics for each project's data integrity.

---

## 🛠️ Technology Stack
*   **Core**: Solidity (Smart Contracts)
*   **Network**: Ethereum Sepolia Testnet
*   **Frontend**: React + Vite + Tailwind CSS
*   **Mapping**: MapLibre GL + React-Map-GL
*   **Blockchain Integration**: Ethers.js
*   **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
1.  **Node.js**: v18+ recommended.
2.  **MetaMask**: Connected to the **Sepolia Testnet**.
3.  **Sepolia ETH**: Get free test ETH from a faucet (e.g., Alchemy or Infura).

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/rakshachain.git
    cd rakshachain
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App**:
    Open `http://localhost:5173` (or the port shown in your terminal).

---

## 📋 How to Test (Role-Based Flow)

1.  **Admin (Treasury)**: Connect wallet -> Switch Role to Admin -> Create a Project (allocates total budget).
2.  **Contractor**: Switch Role to Contractor -> Select Project -> Submit Proof (upload CID/Link) for a milestone.
3.  **Auditor (Third-Party)**: Switch Role to Auditor -> Review Proof -> Approve Milestone (releases funds from Escrow to Contractor).
4.  **Public (Citizen)**: Switch Role to Public -> View the **Immersive Map** and the **Integrity Timeline** to monitor the flow of public money.

---

<p align="center">
  <b>RakshaChain</b> • <i>Guarding Public Funds with Cryptographic Truth</i>
</p>
