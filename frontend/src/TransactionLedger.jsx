import React from 'react';
import { 
  ArrowUpRight, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  UserPlus, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';

const EventIcon = ({ type }) => {
  switch (type) {
    case 'ProjectCreated':
      return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><PlusCircle size={20} /></div>;
    case 'MilestoneSubmitted':
      return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={20} /></div>;
    case 'MilestoneApproved':
      return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>;
    case 'MilestoneRejected':
      return <div className="p-2 bg-red-100 text-red-600 rounded-lg"><XCircle size={20} /></div>;
    case 'RoleGranted':
      return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><UserPlus size={20} /></div>;
    case 'SuspiciousActivity':
      return <div className="p-2 bg-orange-100 text-orange-600 rounded-lg animate-pulse"><ShieldCheck size={20} /></div>;
    default:
      return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><ArrowUpRight size={20} /></div>;
  }
};

const EventDescription = ({ event }) => {
  const { type, data } = event;
  
  switch (type) {
    case 'ProjectCreated':
      return (
        <p className="text-sm text-white/80">
          New Infrastructure Project <span className="font-bold text-[#F6CC63]">"{data.title}"</span> initiated with a budget of <span className="font-mono font-bold">₹{data.budget}</span>.
        </p>
      );
    case 'MilestoneSubmitted':
      return (
        <p className="text-sm text-white/80">
          Contractor <span className="font-mono text-xs bg-white/10 px-1 rounded text-white/90">{data.contractor.slice(0, 10)}...</span> submitted proof for <span className="font-bold text-white">Milestone #{data.milestoneId}</span>.
        </p>
      );
    case 'MilestoneApproved':
      return (
        <p className="text-sm text-white/80">
          Auditor verified and approved Milestone #{data.milestoneId}. <span className="text-emerald-400 font-bold">₹{data.amount}</span> released to contractor.
        </p>
      );
    case 'MilestoneRejected':
      return (
        <p className="text-sm text-white/80">
          Milestone #{data.milestoneId} was <span className="text-red-400 font-bold">Rejected</span> by Auditor. Reason: <span className="italic text-white/60">"{data.reason}"</span>.
        </p>
      );
    case 'RoleGranted':
      return (
        <p className="text-sm text-white/80">
          Role <span className="font-bold text-[#F6CC63]">{data.role}</span> granted to <span className="font-mono text-xs bg-white/10 px-1 rounded text-white/90">{data.account.slice(0, 10)}...</span>.
        </p>
      );
    case 'SuspiciousActivity':
      return (
        <p className="text-sm text-red-400 font-bold">
          CRITICAL: Suspicious activity detected! Type: <span className="underline">{data.flagType}</span> on Project #{data.projectId}.
        </p>
      );
    default:
      return <p className="text-sm text-white/80">Blockchain transaction verified on ledger.</p>;
  }
};

export default function TransactionLedger({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 text-center border border-white/10 border-dashed">
        <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Activity className="text-[#F6CC63]/50" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Synchronizing Ledger...</h3>
        <p className="text-sm text-white/50 max-w-xs mx-auto">Connecting to Sepolia nodes to retrieve real-time transaction history.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
      <div className="bg-black/20 p-8 flex justify-between items-center border-b border-white/5">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#F6CC63] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Public Transaction Ledger
          </h3>
          <p className="text-[#F6CC63]/60 text-xs font-bold uppercase tracking-widest mt-1">Immutable Activity Feed • Real-time</p>
        </div>
        <div className="hidden md:flex gap-4">
           <div className="text-right">
             <p className="text-[10px] font-bold text-white/40 uppercase">Network Status</p>
             <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Synchronized
             </p>
           </div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-h-[600px] overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          {transactions.map((tx, idx) => (
            <div key={`${tx.hash}-${idx}`} className="group relative flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              {/* Timeline Connector */}
              {idx !== transactions.length - 1 && (
                <div className="absolute left-[2.25rem] top-16 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
              )}
              
              <div className="relative z-10 flex-shrink-0">
                <EventIcon type={tx.type} />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] font-black text-[#F6CC63] uppercase tracking-widest bg-[#F6CC63]/10 px-2 py-0.5 rounded">
                     {tx.type}
                   </span>
                   <span className="text-[10px] font-bold text-white/40 flex items-center gap-1">
                     <Clock size={10} /> {tx.time}
                   </span>
                </div>
                
                <div className="mb-3">
                  <EventDescription event={tx} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 bg-black/20 px-2 py-1 rounded">
                    Hash: {tx.hash.slice(0, 14)}...
                  </div>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-[#F6CC63] hover:text-white transition-colors flex items-center gap-1"
                  >
                    View on Explorer <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-black/20 p-4 text-center border-t border-white/5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          End of Ledger • Verified by RakshaChain Nodes
        </p>
      </div>
    </div>
  );
}
