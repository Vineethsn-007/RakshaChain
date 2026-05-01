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
        <p className="text-sm text-[#0C1A30]">
          New Infrastructure Project <span className="font-bold text-[#004E9E]">"{data.title}"</span> initiated with a budget of <span className="font-mono font-bold">₹{data.budget}</span>.
        </p>
      );
    case 'MilestoneSubmitted':
      return (
        <p className="text-sm text-[#0C1A30]">
          Contractor <span className="font-mono text-xs bg-gray-100 px-1 rounded">{data.contractor.slice(0, 10)}...</span> submitted proof for <span className="font-bold">Milestone #{data.milestoneId}</span>.
        </p>
      );
    case 'MilestoneApproved':
      return (
        <p className="text-sm text-[#0C1A30]">
          Auditor verified and approved Milestone #{data.milestoneId}. <span className="text-emerald-600 font-bold">₹{data.amount}</span> released to contractor.
        </p>
      );
    case 'MilestoneRejected':
      return (
        <p className="text-sm text-[#0C1A30]">
          Milestone #{data.milestoneId} was <span className="text-red-600 font-bold">Rejected</span> by Auditor. Reason: <span className="italic">"{data.reason}"</span>.
        </p>
      );
    case 'RoleGranted':
      return (
        <p className="text-sm text-[#0C1A30]">
          Role <span className="font-bold text-purple-600">{data.role}</span> granted to <span className="font-mono text-xs bg-gray-100 px-1 rounded">{data.account.slice(0, 10)}...</span>.
        </p>
      );
    case 'SuspiciousActivity':
      return (
        <p className="text-sm text-[#E53E3E] font-bold">
          CRITICAL: Suspicious activity detected! Type: <span className="underline">{data.flagType}</span> on Project #{data.projectId}.
        </p>
      );
    default:
      return <p className="text-sm text-[#0C1A30]">Blockchain transaction verified on ledger.</p>;
  }
};

export default function TransactionLedger({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#004E9E]/10 border-dashed">
        <div className="mx-auto w-16 h-16 bg-[#FDFCF2] rounded-full flex items-center justify-center mb-4">
          <Activity className="text-[#004E9E]/30" />
        </div>
        <h3 className="text-lg font-bold text-[#0C1A30] mb-2">Synchronizing Ledger...</h3>
        <p className="text-sm text-[#0C1A30]/50 max-w-xs mx-auto">Connecting to Sepolia nodes to retrieve real-time transaction history.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-[#004E9E]/5 overflow-hidden">
      <div className="bg-[#032360] p-8 flex justify-between items-center">
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
            <div key={`${tx.hash}-${idx}`} className="group relative flex gap-6 p-4 rounded-2xl hover:bg-[#FDFCF2] transition-colors border border-transparent hover:border-[#004E9E]/10">
              {/* Timeline Connector */}
              {idx !== transactions.length - 1 && (
                <div className="absolute left-[2.25rem] top-16 bottom-0 w-px bg-gradient-to-b from-[#004E9E]/10 to-transparent" />
              )}
              
              <div className="relative z-10 flex-shrink-0">
                <EventIcon type={tx.type} />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] font-black text-[#004E9E] uppercase tracking-widest bg-[#004E9E]/5 px-2 py-0.5 rounded">
                     {tx.type}
                   </span>
                   <span className="text-[10px] font-bold text-[#0C1A30]/40 flex items-center gap-1">
                     <Clock size={10} /> {tx.time}
                   </span>
                </div>
                
                <div className="mb-3">
                  <EventDescription event={tx} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#0C1A30]/50 bg-gray-50 px-2 py-1 rounded">
                    Hash: {tx.hash.slice(0, 14)}...
                  </div>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-[#004E9E] hover:underline flex items-center gap-1"
                  >
                    View on Explorer <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-[#FDFCF2] p-4 text-center border-t border-[#004E9E]/5">
        <p className="text-[10px] font-bold text-[#0C1A30]/40 uppercase tracking-widest">
          End of Ledger • Verified by RakshaChain Nodes
        </p>
      </div>
    </div>
  );
}
