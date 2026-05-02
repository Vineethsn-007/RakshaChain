import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import { Shield, LayoutDashboard, PlusCircle, CheckCircle, FileText, AlertTriangle, Eye, Loader2, Link, Activity, Search, ShieldCheck } from 'lucide-react';
import ProjectMap from './ProjectMap';
import TransactionLedger from './TransactionLedger';
import FuzzTesterPanel from './FuzzTesterPanel';
import InspectorPanel from './InspectorPanel';
import LandingHero from './LandingHero';


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
                  <option value="Inspector">Inspector</option>
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

            {/* Fuzz Tester Panel */}
            <FuzzTesterPanel />
          </>
          )}

          {/* ── Inspector View ── */}
          {selectedRole === 'Inspector' && account && (
            <InspectorPanel
              projects={projects}
              contract={contract}
              onRefresh={() => { fetchProjects(); fetchTransactions(); }}
            />
          )}

          {selectedRole === 'Inspector' && !account && (
            <div className="mb-10 bg-[#032360] rounded-2xl p-10 border border-white/10 shadow-xl text-center text-white/40">
              <p className="text-sm">Connect your wallet to access the Inspector dashboard.</p>
            </div>
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
