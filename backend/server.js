const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rakshachain',
  password: 'postgres',
  port: 5432,
});

async function initializeDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
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

      CREATE TABLE IF NOT EXISTS milestones (
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
          tx_hash VARCHAR(66),
          UNIQUE(project_id, on_chain_milestone_id)
      );

      CREATE TABLE IF NOT EXISTS events (
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

      CREATE TABLE IF NOT EXISTS flags (
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

      CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) UNIQUE NOT NULL,
          role_name VARCHAR(30) NOT NULL,
          granted_by VARCHAR(42),
          granted_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("DB Init Error:", err);
  } finally {
    client.release();
  }
}

// Minimal indexer logic
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x76699042BC14da770F21334cB67A0d0b00330eB4";
const RPC_URL = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
// Provide the basic ABI to listen to events
const ABI = [
  "event ProjectCreated(uint256 indexed projectId, address indexed admin, uint256 budget, uint256 timestamp)",
  "event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, address contractor, string proofCID)",
  "event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, uint256 amountReleased)",
  "event MilestoneRejected(uint256 indexed projectId, uint256 indexed milestoneId, address auditor, string reason)",
  "event FundsReleased(uint256 indexed projectId, address indexed contractor, uint256 amount)",
  "event SuspiciousActivity(uint256 indexed projectId, string flagType, address flaggedAddress)",
  "event RoleGrantedEvent(bytes32 role, address account, address grantor)"
];

async function startIndexer() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
    console.warn("No valid CONTRACT_ADDRESS provided. Indexer not started.");
    return;
  }
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log("Listening to contract events via manual polling...");

    let lastBlock = await provider.getBlockNumber();

    setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > lastBlock) {
          
          const projectEvents = await contract.queryFilter(contract.filters.ProjectCreated(), lastBlock + 1, currentBlock);
          for (const event of projectEvents) {
            const [projectId, admin, budget, timestamp] = event.args;
            console.log("ProjectCreated", projectId, admin);
            await pool.query(
                `INSERT INTO projects (on_chain_id, title, location, contractor_address, admin_address, total_budget_wei, tx_hash)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (on_chain_id) DO NOTHING`,
                [Number(projectId), "Unknown Title", "Unknown Location", "0x00", admin, budget.toString(), event.transactionHash]
            );
          }

          const suspiciousEvents = await contract.queryFilter(contract.filters.SuspiciousActivity(), lastBlock + 1, currentBlock);
          for (const event of suspiciousEvents) {
            const [projectId, flagType, flaggedAddress] = event.args;
            console.log("SuspiciousActivity", projectId, flagType);
            await pool.query(
                `INSERT INTO flags (project_id, flag_type, flagged_address, description, severity, tx_hash)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [Number(projectId), flagType, flaggedAddress, "Detected by smart contract rules", flagType === "INSTANT_APPROVAL" ? "HIGH" : "CRITICAL", event.transactionHash]
            );
          }
          
          lastBlock = currentBlock;
        }
      } catch (e) {
        console.error("Polling error", e.message);
      }
    }, 10000);
  } catch (error) {
    console.error("Indexer Error:", error);
  }
}

// Endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/flags', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM flags ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/sync', async (req, res) => {
  // Demo endpoint to insert project data from frontend when created, since events miss strings
  try {
    const { projectId, title, location, contractor, admin, budget, txHash } = req.body;
    await pool.query(
      `INSERT INTO projects (on_chain_id, title, location, contractor_address, admin_address, total_budget_wei, tx_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (on_chain_id) DO UPDATE SET title = $2, location = $3, contractor_address = $4, admin_address = $5, total_budget_wei = $6`,
      [projectId, title, location, contractor, admin, budget, txHash]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDB();
  await startIndexer();
});
