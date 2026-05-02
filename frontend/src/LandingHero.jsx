import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { AlertTriangle, Link, Activity, Search, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ── Canvas particle network background ─────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];
    const NUM = 60;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < NUM; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(246,204,99,0.35)';
        ctx.fill();
        for (let j = i + 1; j < NUM; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(246,204,99,${0.12 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Floating orbs ──────────────────────────────────────────────────────── */
function Orbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function LandingHero({ onEnterApp }) {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const sec2Ref = useRef(null);
  const sec3Ref = useRef(null);
  const sec4Ref = useRef(null);

  /* hero entrance */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(badgeRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo([line1Ref.current, line2Ref.current, line3Ref.current],
        { y: 60, opacity: 0, skewY: 4 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.9, stagger: 0.15 }, '-=0.3')
      .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.3')
      .fromTo(btnRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 }, '-=0.4')
      .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');

    /* floating scroll indicator */
    gsap.to(scrollIndicatorRef.current, { y: 10, repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut' });
  }, []);

  /* scroll-triggered section reveals */
  useEffect(() => {
    const sections = [sec2Ref.current, sec3Ref.current, sec4Ref.current].filter(Boolean);
    sections.forEach((el) => {
      const children = el.querySelectorAll('.reveal');
      gsap.fromTo(children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' } }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const scrollTo = (id) => gsap.to(window, { duration: 1, scrollTo: { y: id, offsetY: 60 }, ease: 'power2.inOut' });

  return (
    <div className="min-h-screen bg-[#FDFCF2] text-[#0C1A30] font-sans overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="bg-[#032360]/85 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center w-full max-w-5xl shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="/logo (1).png" alt="RakshaChain" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">RakshaChain</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <button onClick={() => scrollTo('#sec-problem')} className="hover:text-white transition-colors">Problem</button>
            <button onClick={() => scrollTo('#sec-solution')} className="hover:text-white transition-colors">Solution</button>
            <button onClick={() => scrollTo('#sec-architecture')} className="hover:text-white transition-colors">Architecture</button>
          </div>
          <button onClick={onEnterApp} className="bg-[#F6CC63] text-[#032360] px-6 py-2 rounded-full font-bold hover:bg-white transition-colors text-sm shadow-md">
            View Dashboard
          </button>
        </nav>
      </div>

      {/* ── HERO (full viewport) ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-[#004E9E]"
        style={{ borderBottomLeftRadius: '50% 8%', borderBottomRightRadius: '50% 8%' }}
      >
        <ParticleCanvas />
        <Orbs />

        {/* grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* radial glow centre */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(246,204,99,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
          <div ref={badgeRef} className="inline-flex items-center gap-2 border border-[#F6CC63]/25 rounded-full px-6 py-2 mb-10 bg-white/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#F6CC63] animate-pulse" />
            <span className="text-[#F6CC63] text-[0.65rem] font-bold tracking-[0.2em] uppercase">Live Monitoring · Sepolia Testnet</span>
          </div>

          <h1 className="font-serif font-bold tracking-tight leading-[1.05] mb-6 text-4xl sm:text-5xl md:text-[4.5rem]">
            <span ref={line1Ref} className="text-[#F6CC63] italic block">Public funds.</span>
            <span ref={line2Ref} className="text-white block">Cryptographic trust.</span>
            <span ref={line3Ref} className="text-[#F6CC63] block">Attack tested.</span>
          </h1>

          <p ref={subRef} className="text-base md:text-lg text-white/65 max-w-xl mx-auto mb-12 font-light leading-relaxed tracking-wide">
            Track every transaction. Simulate attacks. Detect fraud instantly.<br className="hidden md:block" />
            Built for public accountability at scale.
          </p>

          <div ref={btnRef} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={onEnterApp}
              className="bg-[#F6CC63] hover:bg-white text-[#032360] px-10 py-4 rounded-full font-bold text-base transition-all shadow-2xl hover:scale-105 active:scale-95 duration-200">
              View Dashboard →
            </button>
            <button onClick={() => scrollTo('#sec-problem')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-base transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 cursor-pointer"
          onClick={() => scrollTo('#sec-problem')}>
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2.5" fill="currentColor" className="scroll-dot"/>
          </svg>
        </div>
      </section>

      {/* ── SECTION 1: The Problem ─────────────────────────────────────── */}
      <section id="sec-problem" ref={sec2Ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="reveal inline-block border border-[#004E9E]/20 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
          <span className="text-[#004E9E] text-xs font-bold tracking-wider uppercase">📊 Real India Data · 2023-2024</span>
        </div>
        <h2 className="reveal text-5xl md:text-6xl font-serif font-bold text-[#0C1A30] mb-6 leading-tight max-w-3xl">
          The corruption India cannot afford to ignore.
        </h2>
        <p className="reveal text-lg text-[#0C1A30]/70 max-w-3xl mb-16 leading-relaxed">
          These are not hypothetical figures. Every number below comes from official government reports, CAG audits, and investigative journalism published in the last 18 months.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { tag: 'MGNREGA Fraud - Gujarat 2023', color: '#E53E3E', amount: '₹71 Crore', title: 'Ghost Projects. Fake Geo-Tagged Photos', body: 'In Gujarat\'s Dahod district, ₹66.9 crore in MGNREGA bills were paid to unauthorized contractors. Only 1.5 km of 16.2 km sanctioned road was built. Fake geo-tagged photos submitted.', src: 'The Hindu (May 2023) - FIR dated 24 April 2023' },
            { tag: 'Adani Fraud Allegations - 2020-2024', color: '#ED8936', amount: '$265M USD', title: 'Securities & Wire Fraud, Bribery Allegations', body: 'U.S. prosecutors alleged Adani Group paid $265 million in bribes to secure government solar contracts over 4 years highlighting how procurement corruption bypasses existing oversight.', src: 'AP News & Hindenburg Research (Feb 2023)' },
            { tag: 'MGNREGA National - 2023-24', color: '#004E9E', amount: '₹169.75 Cr', title: 'Nationwide Fund Misappropriation', body: 'As of March 2024, ₹169.75 crore was misappropriated nationally across 1,25,902 MGNREGA cases. Only ₹20.93 crore (12.33%) was recovered. UP alone saw ₹82.46 crore misused.', src: 'Ministry of Rural Development (2024)' },
          ].map((c, i) => (
            <div key={i} className="reveal bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 hover:-translate-y-1 transition-transform" style={{ borderTopColor: c.color }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: c.color }}>{c.tag}</div>
              <div className="text-4xl font-serif font-bold text-[#0C1A30] mb-2">{c.amount}</div>
              <div className="font-bold text-[#0C1A30] mb-4">{c.title}</div>
              <p className="text-sm text-[#0C1A30]/70 mb-6">{c.body}</p>
              <div className="text-xs text-[#0C1A30]/50 border-t border-[#0C1A30]/10 pt-4">Source: {c.src}</div>
            </div>
          ))}
        </div>

        <h3 className="reveal text-2xl font-serif font-bold text-[#0C1A30] mb-6">MGNREGA Fund Misappropriation (2023-24)</h3>
        <div className="reveal bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/10 mb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FDFCF2] text-xs uppercase font-bold text-[#0C1A30]/70 border-b border-[#0C1A30]/10">
                <tr>
                  {['State','Allocated (Approx)','Misappropriated','Recovered','Recovery Rate'].map(h => <th key={h} className="px-6 py-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0C1A30]/5">
                {[
                  { state:'Uttar Pradesh', allocated:'₹12,984.12 Cr', misapp:'₹82.46 Cr', rec:'₹9.72 Cr', rate:'11.79%' },
                  { state:'Madhya Pradesh', allocated:'₹8,452.34 Cr', misapp:'₹67.93 Cr', rec:'₹8.45 Cr', rate:'12.46%' },
                  { state:'Rajasthan', allocated:'₹9,162.54 Cr', misapp:'₹59.82 Cr', rec:'₹6.26 Cr', rate:'10.46%' },
                  { state:'Maharashtra', allocated:'₹7,215.65 Cr', misapp:'₹54.10 Cr', rec:'₹5.56 Cr', rate:'10.29%', hi:true },
                  { state:'Andhra Pradesh', allocated:'₹8,901.26 Cr', misapp:'₹45.57 Cr', rec:'₹0.79 Cr', rate:'1.74%' },
                  { state:'Karnataka', allocated:'₹6,822.40 Cr', misapp:'₹41.58 Cr', rec:'₹0.06 Cr', rate:'0.14%' },
                  { state:'Assam', allocated:'₹3,415.60 Cr', misapp:'₹12.45 Cr', rec:'₹1.88 Cr', rate:'15.10%' },
                ].map((row, i) => (
                  <tr key={i} className={row.hi ? 'bg-[#F6CC63]/10' : ''}>
                    <td className="px-6 py-4 font-medium">{row.state}</td>
                    <td className="px-6 py-4 text-[#004E9E] font-mono">{row.allocated}</td>
                    <td className="px-6 py-4 text-[#E53E3E] font-bold font-mono">{row.misapp}</td>
                    <td className="px-6 py-4 text-[#38A169] font-mono">{row.rec}</td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-2">{row.rate}
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#E53E3E]" style={{ width: row.rate }} />
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
      </section>

      {/* ── SECTION 2: Blue problem section ──────────────────────────────── */}
      <section id="sec-solution" ref={sec3Ref} className="relative bg-[#004E9E] py-28 text-white overflow-hidden">
        <ParticleCanvas />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(246,204,99,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(246,204,99,0.06)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="reveal inline-block border border-[#F6CC63]/50 rounded-full px-4 py-1.5 mb-6 bg-[#F6CC63]/10">
                <span className="text-[#F6CC63] text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> INDIA'S ₹169.75 CR PROBLEM
                </span>
              </div>
              <h2 className="reveal text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Public funds <br />are being <br /><span className="text-[#F6CC63] italic">silently stolen.</span>
              </h2>
              <p className="reveal text-lg text-white/80 leading-relaxed mb-8">
                India ranks 96th out of 180 nations in Transparency International's 2024 Corruption Perceptions Index. Procurement fraud is up 21% year-on-year. Only 12.3% of misappropriated MGNREGA funds are ever recovered. We built RakshaChain to end this.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { val:'96', sup:'/180', badge:'↓ From 93rd', badgeColor:'#E53E3E', text:"India's rank in Transparency International's 2024 Corruption Perceptions Index. Score: 39/100." },
                { val:'59%', sup:'', badge:'-15% vs global', badgeColor:'#004E9E', text:'Of Indian organizations faced financial or economic fraud in the past 24 months. (PwC, 2024)' },
                { val:'₹169.75 Cr', sup:'', badge:'12.3% recovered', badgeColor:'#38A169', text:'Total MGNREGA fund misappropriation across India in 2023-24. 88% of cases unresolved.' },
                { val:'50%', sup:'', badge:'Procurement fraud ↑21%', badgeColor:'#E53E3E', text:'Of organizations identify procurement fraud as the biggest economic crime type in 2024.' },
              ].map((s, i) => (
                <div key={i} className="reveal bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
                  <div className="absolute bottom-0 left-0 h-1 bg-[#F6CC63] w-1/4 group-hover:w-full transition-all duration-500" />
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-4xl font-serif font-bold text-[#F6CC63]">{s.val}<span className="text-2xl text-white/50">{s.sup}</span></div>
                    <span className="px-3 py-1 text-xs font-bold rounded-full border text-white" style={{ background: `${s.badgeColor}33`, borderColor: `${s.badgeColor}55` }}>{s.badge}</span>
                  </div>
                  <p className="text-sm text-white/70">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Architecture ───────────────────────────────────────── */}
      <section id="sec-architecture" ref={sec4Ref} className="py-28 bg-[#FDFCF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="reveal inline-block border border-[#004E9E]/20 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
              <span className="text-[#004E9E] text-xs font-bold tracking-wider uppercase">⚙️ THE ARCHITECTURE OF TRUST</span>
            </div>
            <h2 className="reveal text-5xl md:text-6xl font-serif font-bold text-[#0C1A30] mb-6 leading-tight max-w-3xl">
              Cryptographic certainty,<br />not bureaucratic hope.
            </h2>
            <p className="reveal text-lg text-[#0C1A30]/70 max-w-3xl leading-relaxed">
              RakshaChain replaces paper trails with cryptographic proofs. By moving public funds to a blockchain-based escrow system, corruption becomes mathematically impossible rather than merely illegal.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {[
                { icon: <Link className="w-6 h-6" />, title:'Smart Contract Escrow', body:'Funds are held in programmable escrow and only released when verified cryptographically-signed milestones are met.' },
                { icon: <Activity className="w-6 h-6" />, title:'AI Anomaly Detection', body:'Real-time flagging of unusual payment velocities, duplicate invoices, or wallets tied to blocklisted entities.' },
                { icon: <Search className="w-6 h-6" />, title:'Public Ledger', body:'Citizens act as auditors. Every rupee is traceable from the central treasury down to the final contractor\'s wallet.' },
                { icon: <ShieldCheck className="w-6 h-6" />, title:'Attack Simulation', body:'Stress-test deployment protocols in a sandbox environment before taking them live.' },
              ].map((f, i) => (
                <div key={i} className="reveal bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0C1A30]/5 flex gap-6 items-start hover:border-[#004E9E]/30 transition-colors">
                  <div className="bg-[#F6CC63]/20 p-3 rounded-xl text-[#B7791F] shrink-0">{f.icon}</div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0C1A30] mb-2">{f.title}</h4>
                    <p className="text-[#0C1A30]/70 text-sm leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal bg-[#004E9E] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#F6CC63] mb-8">The India Context</h3>
                <div className="space-y-6">
                  {[
                    { val:'₹64.76 Cr', text:'National Blockchain Framework allocation by MeitY for indigenous blockchain infrastructure.' },
                    { val:'34 Cr+', text:'Documents verified across 6 states currently utilizing limited blockchain e-governance.' },
                    { val:'47.3%', text:'CAGR of the Indian blockchain market, projected to reach $4.3B by 2028.' },
                    { val:'40%', text:'Reduction in corruption in pilot public distribution systems using smart contracts.' },
                  ].map((r, i, a) => (
                    <div key={i} className={`flex gap-6 items-start ${i < a.length-1 ? 'border-b border-white/10 pb-6' : ''}`}>
                      <div className="text-3xl font-serif font-bold text-white w-32 shrink-0">{r.val}</div>
                      <p className="text-sm text-white/80">{r.text}</p>
                    </div>
                  ))}
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
      </section>
    </div>
  );
}
