import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import { Shield, LayoutDashboard, PlusCircle, CheckCircle, FileText, AlertTriangle, Eye, Loader2, Link, Activity, Search, ShieldCheck } from 'lucide-react';
import ProjectMap from './ProjectMap';
import TransactionLedger from './TransactionLedger';

const LandingHero = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#FDFCF2] text-[#0C1A30] font-sans overflow-hidden">
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="bg-[#032360]/80 backdrop-blur-lg border border-white/10 rounded-full px-6 py-3 flex justify-between items-center w-full max-w-5xl shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="/logo (1).png" alt="RakshaChain Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">RakshaChain</span>
          </div>
          <button 
            onClick={onEnterApp}
            className="bg-[#F6CC63] text-[#032360] px-6 py-2 rounded-full font-bold hover:bg-white transition-colors text-sm"
          >
            View Dashboard
          </button>
        </nav>
      </div>

      <div className="relative pt-40 pb-48 px-4 sm:px-6 lg:px-8 bg-[#004E9E] text-center overflow-hidden" 
           style={{ borderBottomLeftRadius: '50% 6%', borderBottomRightRadius: '50% 6%' }}>
        
        <div className="absolute top-28 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.04] pointer-events-none flex justify-center mix-blend-overlay">
          <span className="text-[15rem] font-black text-white uppercase tracking-tighter">
            NEL • PUBLIC FUNDS • TRANSPAR
          </span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto mt-24 animate-fade-in-up opacity-0">
          <div className="inline-block border border-[#F6CC63]/20 rounded-full px-6 py-2 mb-10">
            <span className="text-[#F6CC63] text-[0.65rem] font-bold tracking-[0.2em] uppercase">
              ✦ Live Monitoring • Sepolia Testnet
            </span>
          </div>

          <h1 className="text-6xl md:text-[6.5rem] font-serif font-bold tracking-tight leading-[1.05] mb-8">
            <span className="text-[#F6CC63] italic block">Public funds.</span>
            <span className="text-white block">Cryptographic trust.</span>
            <span className="text-[#F6CC63] block">Attack tested.</span>
          </h1>

          <p className="text-[15px] md:text-[17px] text-white/70 max-w-xl mx-auto mb-14 font-light leading-relaxed tracking-wide opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Track every transaction. Simulate attacks. Detect fraud instantly. <br className="hidden md:block" />Built for public accountability at scale.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button 
              onClick={onEnterApp}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
            >
              View Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: The Corruption India Cannot Afford */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="inline-block border border-[#004E9E]/20 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
          <span className="text-[#004E9E] text-xs font-bold tracking-wider uppercase">
            📊 Real India Data • 2023-2024
          </span>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#0C1A30] mb-6 leading-tight max-w-3xl">
          The corruption India cannot afford to ignore.
        </h2>
        
        <p className="text-lg text-[#0C1A30]/70 max-w-3xl mb-16 leading-relaxed">
          These are not hypothetical figures. Every number below comes from official government reports, CAG audits, and investigative journalism published in the last 18 months.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 border-[#E53E3E] hover:-translate-y-1 transition-transform">
            <div className="text-xs font-bold text-[#E53E3E] uppercase tracking-wider mb-4">MGNREGA Fraud - Gujarat 2023</div>
            <div className="text-4xl font-serif font-bold text-[#0C1A30] mb-2">₹71 Crore</div>
            <div className="font-bold text-[#0C1A30] mb-4">Ghost Projects. Fake Geo-Tagged Photos</div>
            <p className="text-sm text-[#0C1A30]/70 mb-6">
              In Gujarat's Dahod district, ₹66.9 crore in MGNREGA bills were paid to unauthorized contractors. Only 1.5 km of 16.2 km sanctioned road was built. Fake geo-tagged photos submitted.
            </p>
            <div className="text-xs text-[#0C1A30]/50 border-t border-[#0C1A30]/10 pt-4">Source: The Hindu (May 2023) - FIR dated 24 April 2023</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 border-[#ED8936] hover:-translate-y-1 transition-transform">
            <div className="text-xs font-bold text-[#ED8936] uppercase tracking-wider mb-4">Adani Fraud Allegations - 2020-2024</div>
            <div className="text-4xl font-serif font-bold text-[#0C1A30] mb-2">$265M USD</div>
            <div className="font-bold text-[#0C1A30] mb-4">Securities & Wire Fraud, Bribery Allegations</div>
            <p className="text-sm text-[#0C1A30]/70 mb-6">
              U.S. prosecutors alleged Adani Group paid $265 million in bribes to secure government solar contracts over 4 years highlighting how procurement corruption bypasses existing oversight.
            </p>
            <div className="text-xs text-[#0C1A30]/50 border-t border-[#0C1A30]/10 pt-4">Source: AP News & Hindenburg Research (Feb 2023)</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 border-[#004E9E] hover:-translate-y-1 transition-transform">
            <div className="text-xs font-bold text-[#004E9E] uppercase tracking-wider mb-4">MGNREGA National - 2023-24</div>
            <div className="text-4xl font-serif font-bold text-[#0C1A30] mb-2">₹169.75 Cr</div>
            <div className="font-bold text-[#0C1A30] mb-4">Nationwide Fund Misappropriation</div>
            <p className="text-sm text-[#0C1A30]/70 mb-6">
              As of March 2024, ₹169.75 crore was misappropriated nationally across 1,25,902 MGNREGA cases. Only ₹20.93 crore (12.33%) was recovered. UP alone saw ₹82.46 crore misused.
            </p>
            <div className="text-xs text-[#0C1A30]/50 border-t border-[#0C1A30]/10 pt-4">Source: Ministry of Rural Development (2024)</div>
          </div>
        </div>

        {/* Table Section */}
        <h3 className="text-2xl font-serif font-bold text-[#0C1A30] mb-6">MGNREGA Fund Misappropriation (2023-24)</h3>
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/10 mb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FDFCF2] text-xs uppercase font-bold text-[#0C1A30]/70 border-b border-[#0C1A30]/10">
                <tr>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Allocated (Approx)</th>
                  <th className="px-6 py-4 text-[#E53E3E]">Misappropriated</th>
                  <th className="px-6 py-4 text-[#38A169]">Recovered</th>
                  <th className="px-6 py-4">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0C1A30]/5">
                {[
                  { state: "Uttar Pradesh", allocated: "₹12,984.12 Cr", misapp: "₹82.46 Cr", rec: "₹9.72 Cr", rate: "11.79%" },
                  { state: "Madhya Pradesh", allocated: "₹8,452.34 Cr", misapp: "₹67.93 Cr", rec: "₹8.45 Cr", rate: "12.46%" },
                  { state: "Rajasthan", allocated: "₹9,162.54 Cr", misapp: "₹59.82 Cr", rec: "₹6.26 Cr", rate: "10.46%" },
                  { state: "Maharashtra", allocated: "₹7,215.65 Cr", misapp: "₹54.10 Cr", rec: "₹5.56 Cr", rate: "10.29%", highlight: true },
                  { state: "Andhra Pradesh", allocated: "₹8,901.26 Cr", misapp: "₹45.57 Cr", rec: "₹0.79 Cr", rate: "1.74%" },
                  { state: "Karnataka", allocated: "₹6,822.40 Cr", misapp: "₹41.58 Cr", rec: "₹0.06 Cr", rate: "0.14%" },
                  { state: "Assam", allocated: "₹3,415.60 Cr", misapp: "₹12.45 Cr", rec: "₹1.88 Cr", rate: "15.10%" },
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? "bg-[#F6CC63]/10" : ""}>
                    <td className="px-6 py-4 font-medium">{row.state}</td>
                    <td className="px-6 py-4 text-[#004E9E] font-mono">{row.allocated}</td>
                    <td className="px-6 py-4 text-[#E53E3E] font-bold font-mono">{row.misapp}</td>
                    <td className="px-6 py-4 text-[#38A169] font-mono">{row.rec}</td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-2">
                        {row.rate}
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#E53E3E]" style={{ width: row.rate }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-[#0C1A30]/50 mt-2">*Data represents reported cases. Actual misappropriation is estimated to be significantly higher.</p>
      </div>

      {/* Section 2: Dark Blue Problem Section */}
      <div className="bg-[#004E9E] py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div>
              <div className="inline-block border border-[#F6CC63]/50 rounded-full px-4 py-1.5 mb-6 bg-[#F6CC63]/10">
                <span className="text-[#F6CC63] text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> INDIA'S ₹169.75 CR PROBLEM
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Public funds <br />are being <br />
                <span className="text-[#F6CC63] italic">silently stolen.</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                India ranks 96th out of 180 nations in Transparency International's 2024 Corruption Perceptions Index. Procurement fraud is up 21% year-on-year. Only 12.3% of misappropriated MGNREGA funds are ever recovered. We built RakshaChain to end this.
              </p>
            </div>

            {/* Right Cards */}
            <div className="space-y-4">
              {/* Stat 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute bottom-0 left-0 h-1 bg-[#F6CC63] w-1/4 group-hover:w-full transition-all duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-[#F6CC63]">96<span className="text-2xl text-white/50">/180</span></div>
                  <span className="px-3 py-1 bg-[#E53E3E]/20 text-[#FC8181] text-xs font-bold rounded-full border border-[#E53E3E]/30">↓ From 93rd</span>
                </div>
                <p className="text-sm text-white/70">India's rank in Transparency International's 2024 Corruption Perceptions Index. Score: 39/100.</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute bottom-0 left-0 h-1 bg-[#F6CC63] w-1/3 group-hover:w-full transition-all duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-[#F6CC63]">59%</div>
                  <span className="px-3 py-1 bg-[#004E9E] text-white text-xs font-bold rounded-full border border-white/20">-15% vs global</span>
                </div>
                <p className="text-sm text-white/70">Of Indian organizations faced financial or economic fraud in the past 24 months. (PwC, 2024)</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute bottom-0 left-0 h-1 bg-[#F6CC63] w-1/2 group-hover:w-full transition-all duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-[#F6CC63]">₹169.75 Cr</div>
                  <span className="px-3 py-1 bg-[#38A169]/20 text-[#68D391] text-xs font-bold rounded-full border border-[#38A169]/30">12.3% recovered</span>
                </div>
                <p className="text-sm text-white/70">Total MGNREGA fund misappropriation across India in 2023-24. 88% of cases unresolved.</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="absolute bottom-0 left-0 h-1 bg-[#F6CC63] w-2/3 group-hover:w-full transition-all duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-[#F6CC63]">50%</div>
                  <span className="px-3 py-1 bg-[#E53E3E]/20 text-[#FC8181] text-xs font-bold rounded-full border border-[#E53E3E]/30">Procurement fraud ↑21%</span>
                </div>
                <p className="text-sm text-white/70">Of organizations identify procurement fraud as the biggest economic crime type in 2024.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Section 3: Architecture of Trust */}
      <div className="py-24 bg-[#FDFCF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
            <div className="inline-block border border-[#004E9E]/20 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
              <span className="text-[#004E9E] text-xs font-bold tracking-wider uppercase">
                ⚙️ THE ARCHITECTURE OF TRUST
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#0C1A30] mb-6 leading-tight max-w-3xl">
              Cryptographic certainty, <br />not bureaucratic hope.
            </h2>
            <p className="text-lg text-[#0C1A30]/70 max-w-3xl leading-relaxed">
              RakshaChain replaces paper trails with cryptographic proofs. By moving public funds to a blockchain-based escrow system, corruption becomes mathematically impossible rather than merely illegal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Features List */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/5 flex gap-6 items-start hover:border-[#004E9E]/30 transition-colors">
                <div className="bg-[#F6CC63]/20 p-3 rounded-xl text-[#B7791F]">
                  <Link className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0C1A30] mb-2">Smart Contract Escrow</h4>
                  <p className="text-[#0C1A30]/70 text-sm leading-relaxed">Funds are held in programmable escrow and only released when verified cryptographically-signed milestones are met.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/5 flex gap-6 items-start hover:border-[#004E9E]/30 transition-colors">
                <div className="bg-[#F6CC63]/20 p-3 rounded-xl text-[#B7791F]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0C1A30] mb-2">AI Anomaly Detection</h4>
                  <p className="text-[#0C1A30]/70 text-sm leading-relaxed">Real-time flagging of unusual payment velocities, duplicate invoices, or wallets tied to blocklisted entities.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/5 flex gap-6 items-start hover:border-[#004E9E]/30 transition-colors">
                <div className="bg-[#F6CC63]/20 p-3 rounded-xl text-[#B7791F]">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0C1A30] mb-2">Public Ledger</h4>
                  <p className="text-[#0C1A30]/70 text-sm leading-relaxed">Citizens act as auditors. Every rupee is traceable from the central treasury down to the final contractor's wallet.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/5 flex gap-6 items-start hover:border-[#004E9E]/30 transition-colors">
                <div className="bg-[#F6CC63]/20 p-3 rounded-xl text-[#B7791F]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0C1A30] mb-2">Attack Simulation</h4>
                  <p className="text-[#0C1A30]/70 text-sm leading-relaxed">Stress-test deployment protocols in a sandbox environment before taking them live.</p>
                </div>
              </div>
            </div>

            {/* The India Context Card */}
            <div className="bg-[#004E9E] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#F6CC63] mb-8">The India Context</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-6 items-start border-b border-white/10 pb-6">
                    <div className="text-3xl font-serif font-bold text-white w-32 shrink-0">₹64.76 Cr</div>
                    <p className="text-sm text-white/80">National Blockchain Framework allocation by MeitY for indigenous blockchain infrastructure.</p>
                  </div>
                  
                  <div className="flex gap-6 items-start border-b border-white/10 pb-6">
                    <div className="text-3xl font-serif font-bold text-white w-32 shrink-0">34 Cr+</div>
                    <p className="text-sm text-white/80">Documents verified across 6 states currently utilizing limited blockchain e-governance.</p>
                  </div>

                  <div className="flex gap-6 items-start border-b border-white/10 pb-6">
                    <div className="text-3xl font-serif font-bold text-white w-32 shrink-0">47.3%</div>
                    <p className="text-sm text-white/80">CAGR of the Indian blockchain market, projected to reach $4.3B by 2028.</p>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="text-3xl font-serif font-bold text-white w-32 shrink-0">40%</div>
                    <p className="text-sm text-white/80">Reduction in corruption in pilot public distribution systems using smart contracts.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  Aligned with MeitY E-Gov Challenge 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Public');
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    location: '',
    contractor: '',
    budget: '',
    milestones: [{ description: '', amount: '' }]
  });

  const [roleAddress, setRoleAddress] = useState('');
  const [roleType, setRoleType] = useState('CONTRACTOR');
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // Automatically load projects via public RPC so wallet is not needed for public view
    const loadPublicData = async () => {
      try {
        const publicProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
        const publicContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, publicProvider);
        await fetchProjects(publicContract);
        await fetchTransactions(publicContract);
      } catch (err) {
        console.error("Public load error:", err);
      }
    };
    if (!contract) {
      loadPublicData();
    }
  }, [contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
        
        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);
        
        fetchProjects(_contract);
        fetchTransactions(_contract);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const fetchProjects = async (_contract = contract) => {
    if (!_contract) return;
    try {
      setLoading(true);
      const data = await _contract.getAllProjects();
      
      const formattedProjects = await Promise.all(data.map(async (p) => {
        if (p.id.toString() === "0") return null; // empty struct check
        const milestones = await _contract.getMilestones(p.id);
        return {
          id: p.id.toString(),
          title: p.title,
          location: p.location,
          contractor: p.contractor,
          totalBudget: p.totalBudget.toString(),
          releasedAmount: p.releasedAmount.toString(),
          status: p.status.toString(),
          milestones: milestones.map(m => ({
            id: m.id.toString(),
            description: m.description,
            proofCID: m.proofCID,
            amount: m.amount.toString(),
            status: m.status.toString()
          }))
        };
      }));
      setProjects(formattedProjects.filter(Boolean));
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (_contract = contract) => {
    if (!_contract) return;
    try {
      const events = await _contract.queryFilter('*', -10000); 
      
      const formattedTx = await Promise.all(events.map(async (event) => {
        const block = await event.getBlock();
        const date = new Date(Number(block.timestamp) * 1000);
        
        let type = event.fragment ? event.fragment.name : "UnknownTransaction";
        let data = {};
        
        if (type === 'ProjectCreated') {
           data = { 
             projectId: event.args[0].toString(), 
             budget: event.args[2].toString(), 
             title: `Project #${event.args[0].toString()}` 
           };
        } else if (type === 'MilestoneSubmitted') {
           data = { projectId: event.args[0].toString(), milestoneId: (Number(event.args[1]) + 1).toString(), contractor: event.args[2] };
        } else if (type === 'MilestoneApproved') {
           data = { projectId: event.args[0].toString(), milestoneId: (Number(event.args[1]) + 1).toString(), amount: event.args[3].toString() };
        } else if (type === 'RoleGrantedEvent') {
           const roleHashes = {
             "0xa496669719a93077651a547796d88c0379963e6f21287c2b53589b27566107f9": "ADMIN",
             "0x79435f3750033c46e165b4c90d8102d96c90558117d3d2b512e0326d9c6c2e7f": "CONTRACTOR",
             "0xb82666d6d8471415951a89c4465430335e36f4d38692790757a3e6f988863f6a": "AUDITOR"
           };
           type = 'RoleGranted';
           data = { role: roleHashes[event.args[0]] || "USER", account: event.args[1] };
        } else if (type === 'SuspiciousActivity') {
           data = { projectId: event.args[0].toString(), flagType: event.args[1] };
        } else if (type === 'MilestoneRejected') {
           data = { projectId: event.args[0].toString(), milestoneId: (Number(event.args[1]) + 1).toString(), reason: event.args[3] };
        }

        return {
          hash: event.transactionHash,
          type: type,
          data: data,
          time: date.toLocaleString(),
          timestamp: block.timestamp
        };
      }));

      setTransactions(formattedTx.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };


  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      const descs = newProject.milestones.map(m => m.description);
      const amounts = newProject.milestones.map(m => BigInt(m.amount));
      const totalBudget = BigInt(newProject.budget);
      
      const tx = await contract.createProject(
        newProject.title,
        newProject.location,
        newProject.contractor,
        totalBudget,
        descs,
        amounts
      );
      await tx.wait();
      alert("Project created successfully!");
      fetchProjects();
      fetchTransactions();
    } catch (error) {
      console.error(error);
      alert("Error creating project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const submitMilestone = async (projectId, milestoneId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const proof = prompt("Enter Proof CID/URL:");
      if (!proof) { setLoading(false); return; }
      const tx = await contract.submitMilestone(projectId, milestoneId, proof);
      await tx.wait();
      alert("Milestone submitted!");
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Error submitting milestone. Make sure you are the contractor.");
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (projectId, milestoneId) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.approveMilestone(projectId, milestoneId);
      await tx.wait();
      alert("Milestone approved and funds released!");
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Error approving milestone. Make sure you are an auditor and not the contractor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      let roleHash;
      if (roleType === 'CONTRACTOR') roleHash = await contract.CONTRACTOR_ROLE();
      if (roleType === 'AUDITOR') roleHash = await contract.AUDITOR_ROLE();
      
      const tx = await contract.grantUserRole(roleHash, roleAddress);
      await tx.wait();
      alert(`${roleType} role granted successfully!`);
      setRoleAddress('');
    } catch (error) {
      console.error(error);
      alert("Error granting role. Make sure you are the Admin.");
    } finally {
      setLoading(false);
    }
  };

  const statusMap = ["Tendering", "Active", "MilestoneReview", "Completed", "Paused"];
  const mStatusMap = ["Pending", "Submitted", "Approved", "Rejected"];
  const statusColor = ["bg-gray-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-red-500"];

  if (!showApp) {
    return <LandingHero onEnterApp={() => setShowApp(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF2] text-[#0C1A30] font-sans">
      <div className="bg-[#004E9E] pb-32" style={{ borderBottomLeftRadius: '50% 5%', borderBottomRightRadius: '50% 5%' }}>
        <nav className="border-b border-white/10 bg-[#004E9E]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <img src="/logo (1).png" alt="RakshaChain Logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-white">
                  RakshaChain
                </span>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="bg-[#032360] border border-white/20 text-white rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F6CC63] outline-none shadow-sm"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="Public">Public View</option>
                  <option value="Admin">Admin</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Auditor">Auditor</option>
                </select>
                
                {selectedRole !== 'Public' && !account && (
                  <button 
                    onClick={connectWallet}
                    className="bg-[#F6CC63] hover:bg-white text-[#032360] px-4 py-2 rounded-lg font-bold transition-all shadow-md"
                  >
                    Connect Wallet
                  </button>
                )}
                {selectedRole !== 'Public' && account && (
                  <div className="flex items-center gap-2 bg-[#032360] px-4 py-2 rounded-lg border border-white/10 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-mono text-white">{account.slice(0, 6)}...{account.slice(-4)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Banner */}
          <div className="mb-12 p-8 rounded-3xl bg-[#032360] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Shield className="w-40 h-40 text-[#F6CC63]" />
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">Transparent Public Infrastructure</h1>
            <p className="text-white/80 max-w-2xl text-lg">
              RakshaChain tracks public funds on a tamper-proof ledger. Every rupee, every approval, and every proof of work is immutable.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center my-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#F6CC63]" />
            </div>
          )}

          {/* Dashboard Views */}
          {selectedRole === 'Admin' && account && (
          <>
            <div className="mb-10 bg-[#032360] rounded-2xl p-8 border border-white/10 shadow-xl">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2 text-white">
                <PlusCircle className="text-[#F6CC63]" /> Create New Project
              </h2>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  <input required className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]" placeholder="Location" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} />
                  <input required className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]" placeholder="Contractor Address (0x...)" value={newProject.contractor} onChange={e => setNewProject({...newProject, contractor: e.target.value})} />
                  <input required className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]" placeholder="Total Budget (₹ INR)" type="number" step="1" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} />
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-bold text-[#F6CC63] uppercase tracking-wider mb-4">Milestones</h3>
                  {newProject.milestones.map((m, i) => (
                    <div key={i} className="flex gap-2 mb-3">
                      <input required className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F6CC63]" placeholder={`Milestone ${i+1} Description`} value={m.description} onChange={e => {
                        const ms = [...newProject.milestones];
                        ms[i].description = e.target.value;
                        setNewProject({...newProject, milestones: ms});
                      }} />
                      <input required className="w-32 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F6CC63]" placeholder="Amount (₹)" type="number" step="1" value={m.amount} onChange={e => {
                        const ms = [...newProject.milestones];
                        ms[i].amount = e.target.value;
                        setNewProject({...newProject, milestones: ms});
                      }} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewProject({...newProject, milestones: [...newProject.milestones, {description:'', amount:''}]})} className="text-[#F6CC63] font-bold text-sm hover:underline mt-2">
                    + Add Milestone
                  </button>
                </div>

                <button type="submit" className="w-full bg-[#F6CC63] hover:bg-white text-[#032360] py-3 rounded-xl font-bold transition-colors shadow-md">
                  Deploy & Fund Escrow
                </button>
              </form>
            </div>
            
            <div className="mb-10 bg-[#032360] rounded-2xl p-8 border border-white/10 shadow-xl">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2 text-white">
                <Shield className="text-[#F6CC63] w-6 h-6" /> Role Management
              </h2>
              <form onSubmit={handleGrantRole} className="flex gap-4">
                <select 
                  className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]"
                  value={roleType}
                  onChange={e => setRoleType(e.target.value)}
                >
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
                <input 
                  required 
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#F6CC63]" 
                  placeholder="Wallet Address (0x...)" 
                  value={roleAddress} 
                  onChange={e => setRoleAddress(e.target.value)} 
                />
                <button type="submit" className="bg-[#F6CC63] hover:bg-white text-[#032360] px-8 py-3 rounded-xl font-bold transition-colors shadow-md">
                  Grant Role
                </button>
              </form>
            </div>
          </>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-10">
        
        {/* Immersive Map */}
        {projects.length > 0 && !loading && (
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-2 text-[#0C1A30]">
              <LayoutDashboard className="text-[#004E9E]" /> Active Locations
            </h2>
            <ProjectMap projects={projects} />
          </div>
        )}

        {/* Project List */}
        <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-2 text-[#0C1A30]">
          <FileText className="text-[#004E9E]" /> Active Projects
        </h2>
        
        {projects.length === 0 && !loading && (
          <div className="text-center py-16 text-[#0C1A30]/50 bg-white rounded-2xl border border-[#004E9E]/10 border-dashed">
            No projects found on the ledger.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-[#004E9E]/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#0C1A30] mb-2">{p.title}</h3>
                    <div className="text-sm text-[#0C1A30]/60 flex items-center gap-2 font-medium">
                      <span className="truncate w-32" title={p.contractor}>Contractor: {p.contractor.slice(0,6)}...</span>
                      <span>•</span>
                      <span>{p.location}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm ${statusColor[p.status]}`}>
                    {statusMap[p.status]}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-[#FDFCF2] rounded-xl border border-[#004E9E]/5">
                  <div>
                    <p className="text-xs text-[#0C1A30]/50 font-bold uppercase tracking-wider mb-1">Total Budget</p>
                    <p className="font-mono text-xl font-bold text-[#004E9E]">₹ {p.totalBudget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0C1A30]/50 font-bold uppercase tracking-wider mb-1">Released</p>
                    <p className="font-mono text-xl font-bold text-[#38A169]">₹ {p.releasedAmount}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="h-2 w-full bg-[#004E9E]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#38A169] transition-all duration-500" 
                        style={{ width: `${(parseFloat(p.releasedAmount) / parseFloat(p.totalBudget)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#004E9E] uppercase tracking-wider">Milestones</h4>
                  {p.milestones.map((m) => (
                    <div key={m.id} className="bg-white p-4 rounded-xl border border-[#004E9E]/10 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-[#0C1A30]">{m.description}</span>
                        <span className="text-sm font-mono font-bold text-[#004E9E]">₹ {m.amount}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#004E9E]/10">
                        <span className="text-xs px-3 py-1 bg-[#FDFCF2] rounded-full text-[#0C1A30]/70 font-medium border border-[#004E9E]/5">
                          Status: {mStatusMap[m.status]}
                        </span>
                        
                        {/* Action Buttons based on Role */}
                        {selectedRole === 'Contractor' && m.status === '0' && (
                          <button onClick={() => submitMilestone(p.id, m.id)} className="text-xs bg-[#F6CC63] text-[#032360] hover:bg-[#eab308] px-4 py-1.5 rounded-full font-bold transition-colors">
                            Submit Proof
                          </button>
                        )}
                        {selectedRole === 'Auditor' && m.status === '1' && (
                          <div className="flex gap-3">
                            <a href={m.proofCID} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-[#004E9E] hover:underline font-bold">
                              <Eye className="w-4 h-4" /> View Proof
                            </a>
                            <button onClick={() => approveMilestone(p.id, m.id)} className="text-xs bg-[#38A169] hover:bg-[#2F855A] text-white px-4 py-1.5 rounded-full font-bold transition-colors">
                              Approve
                            </button>
                          </div>
                        )}
                        {m.status === '2' && (
                          <span className="text-xs text-[#38A169] font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Transaction Ledger */}
        <div className="mt-24 mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#0C1A30] flex items-center gap-2">
                <ShieldCheck className="text-[#004E9E]" /> Integrity Timeline
              </h2>
              <p className="text-sm text-[#0C1A30]/50 mt-1">Immutable proof of every single rupee allocated and spent.</p>
            </div>
            <div className="hidden sm:block">
               <span className="px-4 py-2 bg-[#004E9E]/5 text-[#004E9E] rounded-full text-xs font-bold uppercase tracking-widest border border-[#004E9E]/10">
                 {transactions.length} Verified Entries
               </span>
            </div>
          </div>
          <TransactionLedger transactions={transactions} />
        </div>

      </main>
    </div>
  );
};

export default App;
