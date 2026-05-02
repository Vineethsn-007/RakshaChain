import React, { useState, useRef, useCallback } from 'react';
import {
  Camera, Upload, Ban, CheckCircle, AlertTriangle, Loader2,
  ExternalLink, ImageIcon, ShieldOff, Eye, X, ChevronDown, ChevronUp
} from 'lucide-react';

// ── Pinata config (loaded from .env via Vite) ─────────────────────────────────
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY ?? 'https://gateway.pinata.cloud/ipfs/';


// ── Upload a file to Pinata and return IPFS CID ───────────────────────────────
async function uploadToPinata(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: file.name,
      keyvalues: { source: 'RakshaChain-Inspector', ...metadata },
    })
  );
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }
  const data = await res.json();
  return data.IpfsHash; // CID
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = ['Tendering', 'Active', 'MilestoneReview', 'Completed', 'Paused'];
const STATUS_STYLE = [
  'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
];
const M_STATUS_MAP = ['Pending', 'Submitted', 'Approved', 'Rejected'];

function StatusPill({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_STYLE[status] || STATUS_STYLE[0]}`}>
      {STATUS_MAP[status] ?? 'Unknown'}
    </span>
  );
}

// ── Single milestone upload row ───────────────────────────────────────────────
function MilestoneUploadRow({ project, milestone, contractInstance, onBlockBudget }) {
  const [uploads, setUploads] = useState([]); // [{cid, name, url, note}]
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null); // image URL to preview
  const fileRef = useRef();

  const handleFiles = useCallback(async (files) => {
    if (!files.length) return;
    setUploading(true);
    const results = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const cid = await uploadToPinata(file, {
          projectId: project.id,
          milestoneId: milestone.id.toString(),
          note,
        });
        results.push({ cid, name: file.name, url: PINATA_GATEWAY + cid, note });
      } catch (err) {
        alert(`Upload failed for ${file.name}: ${err.message}`);
      }
    }
    setUploads((prev) => [...prev, ...results]);
    setUploading(false);
  }, [project.id, milestone.id, note]);

  const onFileChange = (e) => handleFiles(e.target.files);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-white/[0.04] rounded-xl border border-white/10 p-4 space-y-3">
      {/* Milestone header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white/90">{milestone.description}</p>
          <p className="text-[11px] text-white/40 font-mono">₹ {milestone.amount} — Status: {M_STATUS_MAP[milestone.status]}</p>
        </div>
        {milestone.proofCID && (
          <a
            href={PINATA_GATEWAY + milestone.proofCID}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#F6CC63] hover:underline"
          >
            <Eye className="w-3 h-3" /> Contractor Proof
          </a>
        )}
      </div>

      {/* Note input */}
      <input
        className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#F6CC63]"
        placeholder="Inspection note (optional — saved with image metadata)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {/* Drag-and-drop upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[#F6CC63] bg-[#F6CC63]/5'
            : 'border-white/15 hover:border-white/30 hover:bg-white/[0.03]'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-[#F6CC63]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Uploading to IPFS via Pinata…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Camera className="w-6 h-6 text-white/20" />
            <span className="text-xs text-white/40">Drag &amp; drop images, or click to browse</span>
            <span className="text-[10px] text-white/20">JPG, PNG, WEBP — stored permanently on IPFS</span>
          </div>
        )}
      </div>

      {/* Uploaded images */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {uploads.map((u, i) => (
            <div
              key={i}
              className="group relative rounded-lg overflow-hidden border border-white/10 bg-black/20 cursor-pointer"
              onClick={() => setPreview(u.url)}
            >
              <img src={u.url} alt={u.name} className="w-full h-24 object-cover group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-[9px] text-white/60 truncate font-mono">{u.cid.slice(0, 12)}…</p>
              </div>
              <a
                href={u.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-1.5 right-1.5 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 rounded-full p-1.5 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={preview} alt="Preview" className="rounded-2xl w-full max-h-[80vh] object-contain" />
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-[#F6CC63] text-xs hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open on IPFS Gateway
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project card for Inspector ────────────────────────────────────────────────
function InspectorProjectCard({ project, milestones, contract, onBlockBudget }) {
  const [expanded, setExpanded] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const isPaused = Number(project.status) === 4;

  const handleBlock = async () => {
    if (!contract) { alert('Please connect your wallet first.'); return; }
    if (!window.confirm(`Block budget for "${project.title}"?\nThis will pause the project on-chain and prevent any further fund releases.`)) return;
    try {
      setBlocking(true);
      const tx = await contract.emergencyPause(project.id);
      await tx.wait();
      alert('✅ Budget blocked. Project is now Paused on-chain.');
      onBlockBudget?.();
    } catch (err) {
      console.error(err);
      alert(`Failed to block budget: ${err.reason || err.message}`);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className={`bg-[#032360] rounded-2xl border shadow-xl overflow-hidden transition-all ${isPaused ? 'border-red-500/40' : 'border-white/10'}`}>
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-serif font-bold text-white truncate">{project.title}</h3>
              <StatusPill status={Number(project.status)} />
            </div>
            <p className="text-xs text-white/40 font-mono">{project.location}</p>
            <p className="text-[11px] text-white/30 mt-0.5 truncate">Contractor: {project.contractor}</p>
          </div>

          {/* Budget meter */}
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Budget</p>
            <p className="text-base font-mono font-bold text-[#F6CC63]">₹ {Number(project.totalBudget).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-400 font-mono">Released: ₹ {Number(project.releasedAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#F6CC63] rounded-full transition-all duration-500"
            style={{ width: `${Math.min((Number(project.releasedAmount) / Number(project.totalBudget)) * 100, 100)}%` }}
          />
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Upload Inspection Images'} ({milestones.length} milestone{milestones.length !== 1 ? 's' : ''})
          </button>

          <button
            onClick={handleBlock}
            disabled={blocking || isPaused || !contract}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isPaused
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white'
            }`}
          >
            {blocking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Ban className="w-3.5 h-3.5" />
            )}
            {isPaused ? 'Budget Blocked' : blocking ? 'Blocking…' : 'Block Budget'}
          </button>
        </div>
      </div>

      {/* Expandable: milestone upload rows */}
      {expanded && (
        <div className="border-t border-white/10 p-6 space-y-4 bg-black/10">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-[#F6CC63]" />
            <span className="text-sm font-bold text-[#F6CC63] uppercase tracking-wider">Inspection Photo Upload</span>
          </div>
          <p className="text-xs text-white/40 -mt-2">
            Upload on-site photos for each milestone. Images are pinned to IPFS via Pinata — permanent &amp; tamper-proof.
          </p>
          {milestones.map((m) => (
            <MilestoneUploadRow
              key={m.id}
              project={project}
              milestone={m}
              contractInstance={contract}
              onBlockBudget={onBlockBudget}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main exported panel ───────────────────────────────────────────────────────
export default function InspectorPanel({ projects, contract, onRefresh }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="mb-10 bg-[#032360] rounded-2xl p-10 border border-white/10 text-center text-white/30 shadow-xl">
        <Camera className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No projects found on the ledger yet.</p>
      </div>
    );
  }

  return (
    <div className="mb-10 space-y-6">
      {/* Header */}
      <div className="bg-[#032360] rounded-2xl p-8 border border-white/10 shadow-xl">
        <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-white mb-3">
          <Camera className="text-[#F6CC63] w-6 h-6" />
          Inspector Dashboard
        </h2>
        <p className="text-white/50 text-sm max-w-2xl leading-relaxed">
          As an Inspector, you can upload on-site photos for each project milestone — stored permanently on IPFS via Pinata.
          If work is incomplete or fraudulent, use <span className="text-red-400 font-bold">Block Budget</span> to pause the project on-chain and freeze all further fund releases.
        </p>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap gap-4">
          {[
            { icon: <Camera className="w-4 h-4 text-[#F6CC63]" />, label: 'Upload site photos per milestone → pinned to IPFS' },
            { icon: <Ban className="w-4 h-4 text-red-400" />, label: 'Block Budget → calls emergencyPause on-chain' },
            { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, label: 'Images are permanent & publicly verifiable via IPFS gateway' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-white/50">
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Project cards */}
      {projects.map((project) => (
        <InspectorProjectCard
          key={project.id}
          project={project}
          milestones={project.milestones || []}
          contract={contract}
          onBlockBudget={onRefresh}
        />
      ))}
    </div>
  );
}
