import { ExternalLink, LayoutDashboard, Maximize2, RefreshCw, Settings, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export function DashboardPage() {
  const [embedUrl, setEmbedUrl] = useState<string>(
    import.meta.env.VITE_POWERBI_EMBED_URL || 'https://app.powerbi.com/view?r=eyJrIjoiZGY4NjE4NDgtMWZlOS00MWE4LWE3MTctMGU3NWRiN2ZjYTVlIiwidCI6ImE4MmFjYWUwLTgxMDUtNDNmYS1hZWM2LTVjOWViMmExN2M5YiJ9'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ embedUrl: string }>('/api/powerbi')
      .then((data) => {
        if (data.embedUrl) setEmbedUrl(data.embedUrl);
      })
      .catch(() => {});
  }, []);

  const refreshDashboard = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow"><LayoutDashboard size={14} /> POWER BI ANALYTICS DASHBOARD</span>
        <h1>Workforce Analytics & Talent Intelligence Preview</h1>
        <p>Interactive Power BI report previewing employee headcount, attrition rates, satisfaction scores, and salary distributions.</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-4">
        <div className="stat-card">
          <label>Total Workforce</label>
          <div className="value">1,470</div>
          <div className="subtext">Active Employee Dataset</div>
        </div>
        <div className="stat-card">
          <label>Attrition Rate</label>
          <div className="value" style={{ color: 'var(--danger)' }}>16.1%</div>
          <div className="subtext">237 Employees Left</div>
        </div>
        <div className="stat-card">
          <label>Avg Monthly Income</label>
          <div className="value">$6,503</div>
          <div className="subtext">Across All Job Levels</div>
        </div>
        <div className="stat-card">
          <label>Work Life Balance</label>
          <div className="value" style={{ color: 'var(--success)' }}>2.76 / 4</div>
          <div className="subtext">Satisfaction Metric</div>
        </div>
      </div>

      {/* Embed Frame Panel */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <LayoutDashboard size={20} style={{ color: 'var(--accent)' }} /> Embedded Power BI Report
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="button button-sm button-secondary" type="button" onClick={refreshDashboard} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <a href={embedUrl} target="_blank" rel="noreferrer" className="button button-sm">
              <ExternalLink size={14} /> Open Fullscreen
            </a>
          </div>
        </div>

        {embedUrl ? (
          <iframe
            title="Power BI Workforce Report"
            className="powerbi-frame"
            src={embedUrl}
            allowFullScreen
          />
        ) : (
          <div className="dropzone" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={36} style={{ color: 'var(--muted)' }} />
            <h3 style={{ margin: '12px 0 6px' }}>No Power BI Embed URL Configured</h3>
            <p>Go to the Admin Console page to add or update your Power BI embed report link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
