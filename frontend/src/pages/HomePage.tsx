import { ArrowRight, Bot, Cpu, Database, ExternalLink, FileText, Github, Layers, LayoutDashboard, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Contributor } from '../data/site';
import { architectureLayers, fallbackContributors, projectCards, supportingDocuments } from '../data/site';
import { apiFetch } from '../lib/api';

export function HomePage() {
  const [contributors, setContributors] = useState<Contributor[]>(fallbackContributors);

  useEffect(() => {
    apiFetch<{ contributors: Contributor[] }>('/api/contributors')
      .then((data) => {
        if (data.contributors && data.contributors.length > 0) {
          setContributors(data.contributors);
        }
      })
      .catch(() => setContributors(fallbackContributors));
  }, []);

  return (
    <div className="page">
      {/* Hero Banner */}
      <section className="panel" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', borderLeft: '4px solid var(--accent)' }}>
        <div className="page-header">
          <span className="eyebrow"><Sparkles size={14} /> AI-POWERED WORKFORCE PLATFORM</span>
          <h1 style={{ fontSize: '2.1rem' }}>AI-Powered Workforce Analytics & Talent Intelligence Dashboard</h1>
          <p style={{ maxWidth: '900px', fontSize: '1rem', color: '#334155' }}>
            Comprehensive enterprise platform unifying RAG-based AI policy search, interactive Power BI analytics,
            HR attrition dataset inspection, team contribution tracking, and single-page administrative control.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
            <Link to="/assistant" className="button button-primary">
              <Bot size={16} /> Open AI Assistant <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="button button-secondary">
              <LayoutDashboard size={16} /> View Power BI Dashboard
            </Link>
            <Link to="/viewer" className="button">
              <Database size={16} /> Data Viewer (1,470 Records)
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stat Cards */}
      <section className="grid grid-4">
        <div className="stat-card">
          <label>Platform Pages</label>
          <div className="value">5 Pages</div>
          <div className="subtext">Home, Assistant, PowerBI, Viewer, Login</div>
        </div>
        <div className="stat-card">
          <label>Admin Control</label>
          <div className="value">1 Unified Hub</div>
          <div className="subtext">7 Core administrative modules on 1 page</div>
        </div>
        <div className="stat-card">
          <label>Dataset Schema</label>
          <div className="value">32 Attributes</div>
          <div className="subtext">Age, Attrition, Department, Income, etc.</div>
        </div>
        <div className="stat-card">
          <label>RAG Knowledge Engine</label>
          <div className="value">ChromaDB + Gemini</div>
          <div className="subtext">PDF, DOCX, TXT, CSV, PPTX support</div>
        </div>
      </section>

      {/* Project Overview Cards */}
      <section className="grid grid-2">
        {projectCards.map((card) => (
          <article key={card.title} className="panel">
            <div className="panel-title" style={{ color: 'var(--accent)' }}>
              <Cpu size={18} /> {card.title}
            </div>
            <h3 style={{ margin: '10px 0 6px', fontSize: '1.15rem' }}>{card.value}</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{card.detail}</p>
          </article>
        ))}
      </section>

      {/* Architecture & Tech Stack */}
      <section className="grid grid-2">
        <article className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><Layers size={18} /> System Architecture</h2>
            <span className="tag tag-blue">RAG Pipeline</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {architectureLayers.map((layer, idx) => (
              <div key={layer} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 500 }}>{layer}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><Cpu size={18} /> Technology Stack</h2>
            <span className="tag tag-green">Production Ready</span>
          </div>
          <div className="grid grid-2" style={{ gap: '10px' }}>
            {[
              { name: 'Frontend', tech: 'React 18 + Vite + TS', desc: 'Sharp light-mode UI' },
              { name: 'Backend API', tech: 'FastAPI + Python', desc: 'REST API & CORS' },
              { name: 'LLM Engine', tech: 'Gemini API', desc: 'Grounded generation' },
              { name: 'Vector DB', tech: 'ChromaDB', desc: 'Semantic search' },
              { name: 'Database', tech: 'Neon (PostgreSQL)', desc: 'Cloud relational data' },
              { name: 'Analytics', tech: 'Power BI Embedded', desc: 'Dashboard report frame' },
            ].map((item) => (
              <div key={item.name} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}>{item.name}</strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--accent)', fontWeight: 600 }}>{item.tech}</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Team Members Contribution */}
      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title"><Users size={18} /> Team Members Contribution</h2>
          <span className="tag tag-blue">Project Team</span>
        </div>
        <div className="grid grid-2" style={{ gap: '16px' }}>
          {contributors.map((member) => (
            <div key={member.github_username || member.name} className="contributor-card">
              <img
                src={`https://github.com/${member.github_username || 'octocat'}.png?size=80`}
                alt={member.name}
                className="contributor-avatar"
              />
              <div className="contributor-info" style={{ flex: 1 }}>
                <h4>{member.name}</h4>
                <p><strong>{member.course}</strong> · {member.college}</p>
                <p>{member.address}</p>
                <div className="contact">{member.contact}</div>
              </div>
              <a
                href={`https://github.com/${member.github_username}`}
                target="_blank"
                rel="noreferrer"
                className="button button-sm button-secondary"
                style={{ flexShrink: 0 }}
              >
                <Github size={14} /> GitHub
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* All Pages Links & Supporting Documents */}
      <section className="grid grid-2">
        <article className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><ArrowRight size={18} /> Page Links & Quick Navigation</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/assistant', title: 'AI Assistant Page', desc: 'ChatGPT-style RAG workforce assistant with grounded sources' },
              { to: '/dashboard', title: 'Power BI Dashboard', desc: 'Preview embedded workforce analytics report' },
              { to: '/viewer', title: 'Data Viewer Page', desc: 'Filter, sort, search & download 32-attribute dataset' },
              { to: '/login', title: 'Login Page', desc: 'Admin authentication sign-in' },
              { to: '/admin', title: 'Admin Console Page', desc: 'All 7 administrative components in one page' },
            ].map((link) => (
              <Link key={link.to} to={link.to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{link.title}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>{link.desc}</span>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><FileText size={18} /> Supporting Documents</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {supportingDocuments.map((doc) => (
              <div key={doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{doc}</span>
                <span className="tag"><FileText size={12} /> Document</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
