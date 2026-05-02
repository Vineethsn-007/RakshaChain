import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Search, Activity, ChevronRight, Lock, TerminalSquare, FileSearch } from 'lucide-react';

export default function LandingPage({ onLaunch }) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 40%), radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.1), transparent 40%)',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden'
    }}>
      
      {/* Navbar */}
      <nav style={{ padding: '1.5rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert color="#3b82f6" size={28} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AI Fuzz Tester</span>
        </div>
        <div>
          <button 
            onClick={onLaunch}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#60a5fa',
              padding: '0.5rem 1.25rem',
              borderRadius: '99px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)' }}
          >
            Launch Console
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
            <span style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#f87171', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '99px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              🚀 v1.0 Enterprise Security Edition
            </span>
          </motion.div>
          
          <motion.h1 variants={item} style={{ 
            fontSize: '4.5rem', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Find vulnerabilities before <br/>
            <span style={{ background: 'linear-gradient(to right, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              the bad actors do.
            </span>
          </motion.h1>
          
          <motion.p variants={item} style={{ 
            fontSize: '1.25rem', 
            color: '#94a3b8', 
            maxWidth: '600px', 
            margin: '0 auto 3rem auto',
            lineHeight: 1.6
          }}>
            Autonomous, zero-knowledge API fuzz testing powered by AI. 
            Discover hidden endpoints, mutate thousands of payloads, and generate instant remediation reports.
          </motion.p>

          <motion.div variants={item} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={onLaunch}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
              }}
            >
              Start Fuzzing Now <ChevronRight size={20} />
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto 8rem auto', padding: '0 2rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}
        >
          {/* Feature 1 */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '2.5rem', 
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)' }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Search color="#60a5fa" size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Zero-Knowledge Discovery</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Point the engine at any base URL. We automatically map OpenAPI specs or brute-force common paths and infer schemas from 422 errors.</p>
          </div>

          {/* Feature 2 */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '2.5rem', 
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)' }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <TerminalSquare color="#f87171" size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>7-Vector Mutation Engine</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Automatically generates SQL injections, buffer overflows, extreme boundary limits, encoding attacks, and deep structural malformations.</p>
          </div>

          {/* Feature 3 */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '2.5rem', 
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)' }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <FileSearch color="#34d399" size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Remediation Reports</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Generate downloadable, board-ready Markdown reports via OpenRouter AI. Instantly get code-level fixes for every unique crash found.</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
        <p>© 2026 AI Fuzz Tester. All systems secure.</p>
      </footer>
    </div>
  );
}
