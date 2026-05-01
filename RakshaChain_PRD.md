# 📋 Product Requirements Document (PRD)
## RakshaChain — Blockchain-Based Public Fund Transparency Platform

**Version:** 1.0.0  
**Track:** Cybersecurity & Blockchain  
**Problem Statement:** Track public fund flow end-to-end on a tamper-proof ledger with multi-role access (admin, auditor, public) and automatic flagging of inconsistencies or suspicious transactions.  
**Prototype Stack:** React (Frontend) · Sepolia Testnet (Smart Contracts via Remix IDE) · PostgreSQL via pgAdmin (Database)  
**Status:** Ready for Hackathon Build

---

## 1. Problem Statement (Expanded)

Public infrastructure funds in India and globally are plagued by three systemic failures:

1. **Opacity** — Citizens have no way to verify whether allocated funds reached their intended destination.
2. **Manual Bureaucracy** — Approvals and payments are gated by human intermediaries prone to delays and corruption.
3. **Misappropriation** — Funds are diverted, inflated, or duplicated with no audit trail.

RakshaChain solves this by placing every rupee, every approval, and every proof of work on an immutable ledger — making corruption structurally impossible rather than just illegal.

---

## 2. Goals & Non-Goals

### Goals (Prototype Scope)
- Deploy a smart contract on **Sepolia Testnet** via Remix IDE that manages project creation, milestone tracking, and fund escrow.
- Build a **React frontend** that allows multi-role users (Admin, Contractor, Auditor, Public) to interact with the contract via MetaMask.
- Use **PostgreSQL (pgAdmin)** to index contract events for fast querying and dashboard analytics.
- Automatically flag suspicious transactions (e.g., instant approvals, duplicate entries).
- Provide a public read-only view so any citizen can inspect fund flows.

### Non-Goals (Out of Scope for Prototype)
- IPFS/Pinata integration (simplified to metadata strings for hackathon)
- Mobile app
- Production mainnet deployment
- IoT sensor integration
- DAO governance voting

---

## 3. User Personas & Roles

| Role | Who They Are | Key Actions |
|---|---|---|
| **Admin** | Government treasury official | Creates projects, allocates funds to escrow, assigns roles |
| **Contractor** | Infrastructure company | Submits milestone completion proofs |
| **Auditor** | Independent verifier | Reviews milestones, approves/rejects fund release |
| **Public / Citizen** | Any wallet holder or guest | Views all projects, fund flows, and flags on a read-only dashboard |

---

## 4. Core Features (MVP)

### 4.1 Smart Contract Layer (Solidity · Sepolia via Remix IDE)

#### `RakshaChain.sol` — Monolithic Contract (Hackathon Simplification)
For the prototype, a single contract handles all logic to simplify Remix deployment.

**State Variables:**
```solidity
enum ProjectStatus { Tendering, Active, MilestoneReview, Completed, Paused }
enum MilestoneStatus { Pending, Submitted, Approved, Rejected }

struct Project {
    uint256 id;
    string title;
    string location;
    address contractor;
    uint256 totalBudget;      // in wei
    uint256 releasedAmount;
    ProjectStatus status;
    uint256 createdAt;
}

struct Milestone {
    uint256 id;
    uint256 projectId;
    string description;
    string proofCID;          // simplified: IPFS hash or URL string
    uint256 amount;           // funds to release on approval
    MilestoneStatus status;
    uint256 submittedAt;
    uint256 approvedAt;
}
```

**Role Constants:**
```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");
bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
```

**Key Functions:**

| Function | Role Required | Description |
|---|---|---|
| `createProject(title, location, contractor, milestones[])` | ADMIN | Creates a project and locks ETH in escrow |
| `submitMilestone(projectId, milestoneId, proofCID)` | CONTRACTOR | Submits proof of work for a milestone |
| `approveMilestone(projectId, milestoneId)` | AUDITOR | Approves and auto-releases funds to contractor |
| `rejectMilestone(projectId, milestoneId, reason)` | AUDITOR | Rejects a milestone and logs reason on-chain |
| `grantRole(role, account)` | ADMIN | Assigns a role to a wallet address |
| `emergencyPause(projectId)` | ADMIN | Pauses a project and freezes escrow |
| `getProject(id)` | Public | Returns full project details |
| `getAllProjects()` | Public | Returns all project summaries |

**Events Emitted (indexed by PostgreSQL):**
```solidity
event ProjectCreated(uint256 indexed projectId, address indexed admin, uint256 budget, uint256 timestamp);
event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, address contractor, string proofCID);
event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, uint256 amountReleased);
event MilestoneRejected(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, string reason);
event FundsReleased(uint256 indexed projectId, address indexed contractor, uint256 amount);
event SuspiciousActivity(uint256 indexed projectId, string flagType, address flaggedAddress);
event RoleGranted(bytes32 role, address account, address grantor);
```

**Anomaly/Flag Logic (on-chain):**
- If `approvedAt - submittedAt < 60 seconds` → emit `SuspiciousActivity("INSTANT_APPROVAL", auditor)`
- If a contractor submits the same `proofCID` twice → emit `SuspiciousActivity("DUPLICATE_PROOF", contractor)`

---

### 4.2 Frontend (React · MetaMask · ethers.js)

#### Pages & Views

**1. Landing / Public Dashboard**
- Shows all projects as cards: title, location, total budget, % released, current status
- Color-coded status badges (Tendering = grey, Active = blue, Completed = green, Paused = red)
- "Suspicious Flags" counter per project (pulled from PostgreSQL)
- No wallet required for viewing

**2. Connect Wallet Page**
- MetaMask connect button
- Detects role from contract (`hasRole()`) and redirects to correct dashboard
- Shows connected wallet address and Sepolia ETH balance

**3. Admin Dashboard**
- Form: Create New Project (title, location, contractor address, budget in ETH, milestone definitions)
- Table: All projects with manage buttons
- Panel: Role Management — grant/revoke roles by pasting wallet address
- Alert banner: Shows all on-chain `SuspiciousActivity` events

**4. Contractor Dashboard**
- List: My assigned projects and their milestones
- Action: "Submit Milestone" modal — enter milestone ID and proof (URL/description for prototype)
- History: Past submissions with status (Pending / Approved / Rejected)

**5. Auditor Dashboard**
- Queue: Milestones awaiting review (MilestoneReview status)
- Each card shows: project name, contractor address, milestone description, proof link, amount to release
- Buttons: Approve (triggers fund release) or Reject (enter reason)
- Flags panel: Lists flagged events from this auditor's activity

**6. Transaction Explorer (Public)**
- Table of all events indexed in PostgreSQL
- Columns: Timestamp, Event Type, Project ID, Actor Address, Amount, Status
- Filters: by project, by event type, by date range
- Highlights suspicious rows in amber/red

---

### 4.3 Database Layer (PostgreSQL · pgAdmin)

#### Schema

**`projects` table**
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    on_chain_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    contractor_address VARCHAR(42) NOT NULL,
    admin_address VARCHAR(42) NOT NULL,
    total_budget_wei NUMERIC(30, 0),
    released_amount_wei NUMERIC(30, 0) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Tendering',
    created_at TIMESTAMP DEFAULT NOW(),
    tx_hash VARCHAR(66)
);
```

**`milestones` table**
```sql
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    on_chain_milestone_id INTEGER NOT NULL,
    project_id INTEGER REFERENCES projects(on_chain_id),
    description TEXT,
    proof_cid TEXT,
    amount_wei NUMERIC(30, 0),
    status VARCHAR(20) DEFAULT 'Pending',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    auditor_address VARCHAR(42),
    tx_hash VARCHAR(66)
);
```

**`events` table**
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    project_id INTEGER,
    milestone_id INTEGER,
    actor_address VARCHAR(42),
    amount_wei NUMERIC(30, 0),
    metadata JSONB,
    block_number INTEGER,
    tx_hash VARCHAR(66) UNIQUE,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**`flags` table**
```sql
CREATE TABLE flags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(on_chain_id),
    flag_type VARCHAR(50),
    flagged_address VARCHAR(42),
    description TEXT,
    severity VARCHAR(10) DEFAULT 'MEDIUM',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    tx_hash VARCHAR(66)
);
```

**`roles` table**
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role_name VARCHAR(30) NOT NULL,
    granted_by VARCHAR(42),
    granted_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexer Logic (Frontend polling fallback for prototype)
Since the prototype uses React without a Node.js backend, the indexer can be implemented as:
- A React `useEffect` hook on app load that queries `contract.queryFilter()` for all past events
- Writes parsed events to PostgreSQL via a lightweight Express API endpoint or Supabase REST API
- Runs every 15 seconds to stay within 1 block of chain truth

---

## 5. User Flows

### Flow 1: Admin Creates a Project
```
Admin connects MetaMask (Sepolia)
→ Fills "Create Project" form (title, contractor address, 3 milestones, 0.5 ETH budget)
→ MetaMask prompts to send 0.5 ETH + gas
→ Tx confirmed → ProjectCreated event emitted
→ Indexer writes to `projects` table in PostgreSQL
→ Public dashboard immediately shows new project card
```

### Flow 2: Contractor Submits Milestone
```
Contractor connects MetaMask
→ Sees "Milestone 1: Foundation Laid" in their dashboard
→ Clicks "Submit Proof" → pastes photo URL/description
→ MetaMask prompts for gas
→ Tx confirmed → MilestoneSubmitted event
→ Auditor dashboard shows new item in review queue
→ PostgreSQL updates milestone status to "Submitted"
```

### Flow 3: Auditor Reviews & Approves
```
Auditor connects MetaMask
→ Sees pending milestone for "Ring Road Project"
→ Reviews proof, clicks "Approve"
→ MetaMask prompts for gas
→ Tx confirmed → MilestoneApproved + FundsReleased events
→ 0.15 ETH auto-transferred to contractor wallet
→ Public dashboard updates: "15% funds released" badge turns green
→ If approval took < 60s from submission → SuspiciousActivity event emitted → flags table updated → amber alert on admin dashboard
```

### Flow 4: Citizen Inspects Fund Flow
```
Citizen opens app (no wallet needed)
→ Sees "Smart City Project — ₹50 Lakh" card
→ Clicks "View Transactions"
→ Sees full event log: Project Created → Milestone 1 Submitted → Milestone 1 Approved → ₹15L Released
→ One row highlighted amber: "Instant Approval Detected (12s)"
→ Citizen can copy tx hash and verify on Sepolia Etherscan
```

---

## 6. Anomaly Detection Rules

| Rule | Trigger Condition | Flag Type | Severity |
|---|---|---|---|
| Instant Approval | `approvedAt - submittedAt < 60s` | `INSTANT_APPROVAL` | HIGH |
| Duplicate Proof | Same `proofCID` submitted twice | `DUPLICATE_PROOF` | HIGH |
| Self-Approval | Auditor == Contractor address | `SELF_APPROVAL` | CRITICAL |
| Over-Budget Release | `releasedAmount > totalBudget` | `OVER_BUDGET` | CRITICAL |
| Rapid Sequential Approvals | 3+ milestones approved within 5 minutes | `RAPID_APPROVALS` | MEDIUM |
| Unauthorized Role Access | Function called without required role | Contract reverts (on-chain) | — |

---

## 7. Technical Architecture (Prototype)

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│  (ethers.js · MetaMask · Tailwind CSS)               │
│                                                     │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │  Public  │ │   Admin   │ │ Auditor/Contractor│   │
│  │Dashboard │ │ Dashboard │ │    Dashboard      │   │
│  └────┬─────┘ └─────┬─────┘ └────────┬─────────┘   │
└───────┼─────────────┼────────────────┼─────────────┘
        │             │                │
        ▼             ▼                ▼
┌─────────────────────────────────────────────────────┐
│         Sepolia Testnet (via MetaMask RPC)           │
│                                                     │
│         RakshaChain.sol (Remix IDE Deploy)           │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │  Roles   │ │  Projects  │ │ MilestoneEscrow  │  │
│  │  (ACL)   │ │  Registry  │ │   (auto-release) │  │
│  └──────────┘ └────────────┘ └──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ event polling (queryFilter)
                        ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (pgAdmin)                    │
│                                                     │
│  projects │ milestones │ events │ flags │ roles      │
│                                                     │
│  Indexed for: fast dashboard queries, flag lookups, │
│  analytics, suspicious pattern detection            │
└─────────────────────────────────────────────────────┘
```

---

## 8. Deployment Steps (Hackathon)

### Step 1: Smart Contract (Remix IDE)
1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Create `RakshaChain.sol` with the contract code
3. Install OpenZeppelin via npm import or paste `AccessControl.sol`
4. Compile with Solidity `^0.8.20`
5. In Deploy tab: select **Injected Provider — MetaMask**, connect to **Sepolia**
6. Deploy with 0 ETH (escrow funded via `createProject`)
7. Copy contract ABI and address → paste into React app's `config.js`

### Step 2: Database (pgAdmin)
1. Open pgAdmin, create database `rakshachain`
2. Run the SQL schema from Section 4.3
3. Note connection string: `postgresql://user:pass@localhost:5432/rakshachain`
4. (Optional) Expose via PostgREST for React to write directly

### Step 3: React App
```bash
npx create-react-app rakshachain-ui
cd rakshachain-ui
npm install ethers@5.7.2 @metamask/detect-provider react-router-dom axios
```

Key files to create:
- `src/config.js` — contract address + ABI
- `src/hooks/useContract.js` — ethers.js contract instance
- `src/hooks/useRole.js` — reads user role from contract
- `src/pages/PublicDashboard.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/AuditorDashboard.jsx`
- `src/pages/ContractorDashboard.jsx`
- `src/pages/TransactionExplorer.jsx`
- `src/services/indexer.js` — polls events and writes to PostgreSQL

### Step 4: Get Sepolia ETH
- Use [sepoliafaucet.com](https://sepoliafaucet.com) or [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- Fund the Admin wallet with ~0.5 ETH for demos

---

## 9. Acceptance Criteria

| Feature | Acceptance Criterion |
|---|---|
| Project Creation | Admin can create a project with ETH locked in escrow; visible on public dashboard |
| Milestone Submission | Contractor can submit proof; auditor queue updates |
| Fund Release | Auditor approval auto-transfers ETH to contractor; no manual step needed |
| Suspicious Flag | Instant approval (< 60s) triggers flag visible on admin dashboard |
| Role Enforcement | Contractor calling `approveMilestone` reverts with access error |
| PostgreSQL Sync | All on-chain events appear in `events` table within 30 seconds |
| Public Transparency | Any user without a wallet can view all projects and transaction history |
| Etherscan Verifiable | Every tx hash links to valid Sepolia Etherscan entry |

---

## 10. Evaluation Alignment

As noted in the problem statement, submissions are evaluated on **intelligence, real-world applicability, explainability, and handling of uncertainty.**

| Criterion | How RakshaChain Addresses It |
|---|---|
| **Intelligence** | On-chain anomaly detection auto-flags suspicious patterns without human review |
| **Real-World Applicability** | Directly mirrors how PFMS (Public Financial Management System) operates; applicable to MNREGA, Smart Cities, PWD contracts |
| **Explainability** | Every fund movement has a linked proof, approver address, timestamp, and block hash — fully auditable |
| **Handling Uncertainty** | Emergency pause, milestone rejection flows, and flag escalation handle edge cases and bad actors |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| MetaMask not installed | Show install prompt with link; read-only mode for public users |
| Sepolia RPC rate limits | Use Alchemy/Infura free tier; cache results in PostgreSQL |
| Solidity compilation errors in Remix | Use Solidity 0.8.20 exactly; avoid floating pragma |
| pgAdmin connection refused | Use `localhost:5432` defaults; include `.env` template in repo |
| Gas estimation failures | Pre-set gas limit 300,000 for milestone functions |
| Demo ETH runs out | Keep separate funded wallet; refill before judging |

---

## 12. Deliverables Checklist

- [ ] `RakshaChain.sol` deployed and verified on Sepolia Etherscan
- [ ] React app running on `localhost:3000` with all 4 role views
- [ ] PostgreSQL schema set up in pgAdmin with sample data
- [ ] At least 2 projects with 3 milestones each demoed end-to-end
- [ ] 1 suspicious flag triggered and visible on dashboard
- [ ] Public dashboard accessible without MetaMask
- [ ] README with setup instructions and contract address

---

*Document prepared for hackathon Track 3 — Cybersecurity & Blockchain*  
*Build minimal, demo clearly, explain the trust model.*
