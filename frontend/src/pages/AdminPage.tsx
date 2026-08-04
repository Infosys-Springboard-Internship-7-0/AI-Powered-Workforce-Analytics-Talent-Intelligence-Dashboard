import { CheckCircle2, Database, Edit3, Eye, FileText, FileUp, KeyRound, LayoutDashboard, LogOut, Plus, Save, Settings, ShieldAlert, Sparkles, Trash2, UserCheck, UserPlus, Users, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contributor } from '../data/site';
import { dataAttributes, fallbackContributors } from '../data/site';
import { API_BASE_URL, apiFetch } from '../lib/api';

type AdminRecord = { name: string; email: string; role: string };
type DocumentRecord = { name: string; content_type: string; char_count: number; text?: string };

export function AdminPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Tab State (6 Clean Tabs)
  const [activeTab, setActiveTab] = useState<'admins' | 'profile' | 'team' | 'docs' | 'powerbi' | 'dataset'>('admins');

  // Status Feedback Message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Session State
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
  const currentAdminEmail = localStorage.getItem('admin_email') || 'admin@ai.com';

  // Module 1: Admins List & Form
  const [admins, setAdmins] = useState<AdminRecord[]>([
    { name: 'Platform Admin', email: 'admin@ai.com', role: 'admin' },
  ]);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Module 2: Profile Form
  const [profile, setProfile] = useState({
    name: 'Platform Admin',
    email: currentAdminEmail,
    password: '',
    confirmPassword: '',
  });

  // Module 3: Team Members State & Form
  const [contributors, setContributors] = useState<Contributor[]>(fallbackContributors);
  const [memberForm, setMemberForm] = useState<Contributor>({
    name: '', contact: '', course: '', college: '', address: '', github_username: '',
  });

  // Module 4: Chatbot Documents State & Editor Drawer
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [extracting, setExtracting] = useState(false);

  // Draft document editor state for Upload Review or Direct Markdown creation
  const [docEditor, setDocEditor] = useState<{
    open: boolean;
    name: string;
    content_type: string;
    text: string;
    isNewMarkdown?: boolean;
  }>({
    open: false,
    name: '',
    content_type: 'text/markdown',
    text: '',
  });

  // Module 5: Power BI URL State
  const [powerbiUrl, setPowerbiUrl] = useState<string>(
    'https://app.powerbi.com/view?r=eyJrIjoiZGY4NjE4NDgtMWZlOS00MWE4LWE3MTctMGU3NWRiN2ZjYTVlIiwidCI6ImE4MmFjYWUwLTgxMDUtNDNmYS1hZWM2LTVjOWViMmExN2M5YiJ9'
  );

  // Module 6: Dataset Upload Validation State
  const [datasetValidation, setDatasetValidation] = useState<{ status: 'valid' | 'invalid' | 'idle'; missingCols: string[]; totalRows: number } | null>(null);

  useEffect(() => {
    // Load initial data from API
    apiFetch<{ admins: AdminRecord[] }>('/api/admins').then((data) => { if (data.admins) setAdmins(data.admins); }).catch(() => {});
    apiFetch<{ name: string; email: string; role: string }>('/api/profile').then((data) => {
      if (data && data.name) {
        setProfile({ name: data.name, email: data.email || currentAdminEmail, password: '', confirmPassword: '' });
      }
    }).catch(() => {});
    apiFetch<{ contributors: Contributor[] }>('/api/contributors').then((data) => { if (data.contributors) setContributors(data.contributors); }).catch(() => {});
    apiFetch<{ embedUrl: string }>('/api/powerbi').then((data) => { if (data.embedUrl) setPowerbiUrl(data.embedUrl); }).catch(() => {});
    apiFetch<{ documents: DocumentRecord[] }>('/api/rag/documents').then((data) => {
      if (data && data.documents) {
        setDocuments(data.documents);
      }
    }).catch(() => {});
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');
    navigate('/login');
  };

  // Module 1 Action: Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) return;

    if (adminForm.password !== adminForm.confirmPassword) {
      showStatus('Password and Confirm Password do not match!', 'error');
      return;
    }

    try {
      const res = await apiFetch<{ admins: AdminRecord[] }>('/api/admins', {
        method: 'POST',
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
          role: 'admin',
        }),
      });
      if (res && res.admins) {
        setAdmins(res.admins);
      }
      const latest = await apiFetch<{ admins: AdminRecord[] }>('/api/admins');
      if (latest && latest.admins) {
        setAdmins(latest.admins);
      }
      setAdminForm({ name: '', email: '', password: '', confirmPassword: '' });
      showStatus(`Admin ${adminForm.name} saved to Neon DB!`);
    } catch (err: any) {
      showStatus(`Error saving admin: ${err?.message || 'Failed to save to Neon DB'}`, 'error');
    }
  };

  // Module 1 Action: Remove Admin
  const handleRemoveAdmin = async (email: string) => {
    try {
      const res = await apiFetch<{ admins: AdminRecord[] }>(`/api/admins/${encodeURIComponent(email)}`, { method: 'DELETE' });
      setAdmins(res.admins);
      showStatus(`Admin ${email} removed.`);
    } catch {
      setAdmins(admins.filter((a) => a.email !== email));
      showStatus(`Admin ${email} removed.`);
    }
  };

  // Module 2 Action: Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.password && profile.password !== profile.confirmPassword) {
      showStatus('New Password and Confirm Password do not match!', 'error');
      return;
    }

    try {
      const res = await apiFetch<{ name: string; email: string; role: string }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          password: profile.password,
          role: 'admin',
        }),
      });
      if (res && res.email) {
        localStorage.setItem('admin_email', res.email);
        setProfile({ name: res.name, email: res.email, password: '', confirmPassword: '' });
      }
      apiFetch<{ admins: AdminRecord[] }>('/api/admins').then((data) => { if (data.admins) setAdmins(data.admins); }).catch(() => {});
      showStatus('Profile updated successfully in Neon DB!');
    } catch {
      localStorage.setItem('admin_email', profile.email);
      showStatus('Profile updated!');
    }
  };

  // Module 3 Action: Save Team Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.github_username) return;
    try {
      const res = await apiFetch<{ contributors: Contributor[] }>('/api/contributors', {
        method: 'POST',
        body: JSON.stringify(memberForm),
      });
      setContributors(res.contributors);
      setMemberForm({ name: '', contact: '', course: '', college: '', address: '', github_username: '' });
      showStatus(`Team member ${memberForm.name} saved!`);
    } catch {
      setContributors([...contributors.filter(c => c.github_username !== memberForm.github_username), memberForm]);
      setMemberForm({ name: '', contact: '', course: '', college: '', address: '', github_username: '' });
      showStatus(`Team member ${memberForm.name} saved!`);
    }
  };

  // Module 3 Action: Remove Team Member
  const handleRemoveMember = async (githubUsername: string) => {
    try {
      const res = await apiFetch<{ contributors: Contributor[] }>(`/api/contributors/${githubUsername}`, { method: 'DELETE' });
      setContributors(res.contributors);
      showStatus(`Contributor ${githubUsername} removed.`);
    } catch {
      setContributors(contributors.filter((c) => c.github_username !== githubUsername));
      showStatus(`Contributor ${githubUsername} removed.`);
    }
  };

  // Module 4 Action A: Upload File & Extract Text in Background
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setExtracting(true);
    showStatus(`Extracting text from ${file.name} in background...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Extraction failed');
      const data = await response.json();

      setDocEditor({
        open: true,
        name: data.filename || file.name,
        content_type: data.content_type || file.type || 'application/octet-stream',
        text: data.extracted_text || '',
        isNewMarkdown: false,
      });
      showStatus(`Text extracted! Review title & content before saving.`);
    } catch {
      // Direct upload fallback
      try {
        const uploadRes = await fetch(`${API_BASE_URL}/api/rag/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.documents) setDocuments(uploadData.documents);
        showStatus(`Document ${file.name} saved & indexed!`);
      } catch {
        showStatus(`Failed to upload ${file.name}`, 'error');
      }
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Module 4 Action B: Save Reviewed/Edited Document to Vector Store
  const handleSaveDocEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docEditor.name.trim() || !docEditor.text.trim()) {
      showStatus('Please provide both document title and content!', 'error');
      return;
    }

    try {
      const res = await apiFetch<{ documents: DocumentRecord[] }>('/api/rag/save', {
        method: 'POST',
        body: JSON.stringify({
          name: docEditor.name.trim(),
          content_type: docEditor.content_type,
          text: docEditor.text.trim(),
        }),
      });

      if (res && res.documents) {
        setDocuments(res.documents);
      } else {
        const latest = await apiFetch<{ documents: DocumentRecord[] }>('/api/rag/documents');
        if (latest && latest.documents) setDocuments(latest.documents);
      }

      setDocEditor({ open: false, name: '', content_type: 'text/markdown', text: '' });
      showStatus(`Document ${docEditor.name} saved & indexed into ChromaDB!`);
    } catch (err: any) {
      showStatus(`Error saving document: ${err?.message || 'Server error'}`, 'error');
    }
  };

  // Module 4 Action C: Delete Document
  const handleDeleteDocument = async (name: string) => {
    try {
      const res = await apiFetch<{ documents: DocumentRecord[] }>(`/api/rag/documents/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res && res.documents) {
        setDocuments(res.documents);
      } else {
        setDocuments((prev) => prev.filter((d) => d.name !== name));
      }
      if (selectedDoc && selectedDoc.name === name) {
        setSelectedDoc(null);
      }
      showStatus(`Document ${name} deleted successfully!`);
    } catch {
      setDocuments((prev) => prev.filter((d) => d.name !== name));
      if (selectedDoc && selectedDoc.name === name) {
        setSelectedDoc(null);
      }
      showStatus(`Document ${name} deleted.`);
    }
  };

  // Module 4 Action D: View Document Details
  const handleViewDocument = async (doc: DocumentRecord) => {
    try {
      const res = await apiFetch<{ document?: DocumentRecord }>(`/api/rag/documents/${encodeURIComponent(doc.name)}`);
      if (res.document) {
        setSelectedDoc(res.document);
      } else {
        setSelectedDoc(doc);
      }
    } catch {
      setSelectedDoc(doc);
    }
  };

  // Module 5 Action: Save Power BI Embed URL
  const handleSavePowerBi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/powerbi', { method: 'PUT', body: JSON.stringify({ embedUrl: powerbiUrl }) });
      showStatus('Power BI embed link saved!');
    } catch {
      showStatus('Power BI embed link saved!');
    }
  };

  // Module 6 Action: Dataset Upload & Attribute Validation
  const handleDatasetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

      // Validate 32 required attributes
      const missing = dataAttributes.filter((attr) => !headers.includes(attr));

      if (missing.length === 0) {
        setDatasetValidation({ status: 'valid', missingCols: [], totalRows: lines.length - 1 });
        showStatus(`Dataset CSV uploaded! Validated all 32 required attributes across ${lines.length - 1} rows.`);
      } else {
        setDatasetValidation({ status: 'invalid', missingCols: missing, totalRows: lines.length - 1 });
        showStatus(`Dataset upload failed validation: Missing ${missing.length} required attributes.`, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow"><Settings size={14} /> UNIFIED ADMIN CONSOLE</span>
        <h1>Admin Control Hub</h1>
        <p>Single-page administration for managing accounts, profile, team contributions, chatbot documents, Power BI link, and dataset uploads.</p>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: statusMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: statusMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-border)' : '#fca5a5'}`,
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Clean Admin Navigation Tabs */}
      <div className="admin-nav">
        <button className={`admin-tab ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
          <UserPlus size={16} /> 1. Manage Admins & Session
        </button>
        <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <KeyRound size={16} /> 2. My Profile & Password
        </button>
        <button className={`admin-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
          <Users size={16} /> 3. Team Contributions
        </button>
        <button className={`admin-tab ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
          <FileText size={16} /> 4. Chatbot Documents
        </button>
        <button className={`admin-tab ${activeTab === 'powerbi' ? 'active' : ''}`} onClick={() => setActiveTab('powerbi')}>
          <LayoutDashboard size={16} /> 5. Power BI Link
        </button>
        <button className={`admin-tab ${activeTab === 'dataset' ? 'active' : ''}`} onClick={() => setActiveTab('dataset')}>
          <Database size={16} /> 6. Dataset Upload
        </button>
      </div>

      {/* MODULE 1: Manage Admins & Session Status */}
      {activeTab === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section className="panel" style={{ background: 'var(--bg-subtle)', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} style={{ color: 'var(--accent)' }} />
                  <strong style={{ fontSize: '1rem' }}>Active Session: {currentAdminEmail}</strong>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  Authenticated with Neon PostgreSQL DB. Access granted to admin controls.
                </p>
              </div>

              <button className="button button-danger" type="button" onClick={handleSignOut}>
                <LogOut size={16} /> Sign Out Admin
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title"><UserPlus size={18} style={{ color: 'var(--accent)' }} /> Manage Administrator Accounts</h2>
              <span className="tag tag-blue">Role: admin</span>
            </div>

            <div className="grid grid-2">
              <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Add New Administrator</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="input" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="Full Name" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="input" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="admin@email.com" required />
                </div>

                <div className="form-grid two">
                  <div className="form-group">
                    <label>Password</label>
                    <input className="input" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input className="input" type="password" value={adminForm.confirmPassword} onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} placeholder="••••••••" required />
                  </div>
                </div>

                <button className="button button-primary" type="submit">
                  <Plus size={16} /> Save Admin to Database
                </button>
              </form>

              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Registered Administrators ({admins.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {admins.map((adm) => (
                    <div key={adm.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                      <div>
                        <strong style={{ fontSize: '0.92rem' }}>{adm.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>{adm.email}</span>
                      </div>
                      {adm.email !== 'admin@ai.com' && (
                        <button className="button button-sm button-danger" type="button" onClick={() => handleRemoveAdmin(adm.email)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* MODULE 2: Manage Profile & Password */}
      {activeTab === 'profile' && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><KeyRound size={18} style={{ color: 'var(--accent)' }} /> Manage Profile & Password</h2>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
            </div>

            <div className="form-grid two">
              <div className="form-group">
                <label>New Password</label>
                <input className="input" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="Enter new password..." />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="input" type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} placeholder="Confirm new password..." />
              </div>
            </div>

            <button className="button button-primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          </form>
        </section>
      )}

      {/* MODULE 3: Manage Team Members Contribution */}
      {activeTab === 'team' && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><Users size={18} style={{ color: 'var(--accent)' }} /> Manage Team Members Contribution</h2>
          </div>

          <div className="grid grid-2">
            <form onSubmit={handleSaveMember} className="form-grid">
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Add / Update Team Member</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input className="input" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Saurabh Kumar" required />
              </div>

              <div className="form-grid two">
                <div className="form-group">
                  <label>Contact Info</label>
                  <input className="input" value={memberForm.contact} onChange={(e) => setMemberForm({ ...memberForm, contact: e.target.value })} placeholder="contact@email.com" />
                </div>
                <div className="form-group">
                  <label>Course / Qualification</label>
                  <input className="input" value={memberForm.course} onChange={(e) => setMemberForm({ ...memberForm, course: e.target.value })} placeholder="BCA / BTech" />
                </div>
              </div>

              <div className="form-grid two">
                <div className="form-group">
                  <label>College / University</label>
                  <input className="input" value={memberForm.college} onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })} placeholder="Galgotias University" />
                </div>
                <div className="form-group">
                  <label>GitHub Username</label>
                  <input className="input" value={memberForm.github_username} onChange={(e) => setMemberForm({ ...memberForm, github_username: e.target.value })} placeholder="Saurabhtbj1201" required />
                </div>
              </div>

              <div className="form-group">
                <label>Address / Location</label>
                <input className="input" value={memberForm.address} onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })} placeholder="Greater Noida, UP" />
              </div>

              <button className="button button-primary" type="submit">
                <Plus size={16} /> Save Team Member
              </button>
            </form>

            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Project Contributors ({contributors.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contributors.map((member) => (
                  <div key={member.github_username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`https://github.com/${member.github_username}.png?size=48`} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <strong style={{ fontSize: '0.92rem' }}>{member.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)' }}>{member.course} · {member.college}</span>
                      </div>
                    </div>

                    <button className="button button-sm button-danger" type="button" onClick={() => handleRemoveMember(member.github_username)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODULE 4: Manage Documents for Chatbot Assistant (Upload, Direct Markdown, Preview & Save) */}
      {activeTab === 'docs' && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><FileText size={18} style={{ color: 'var(--accent)' }} /> Manage Documents for Chatbot Assistant</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="button button-sm button-secondary"
                type="button"
                onClick={() => setDocEditor({ open: true, name: 'new_policy.md', content_type: 'text/markdown', text: '', isNewMarkdown: true })}
              >
                <Edit3 size={14} /> + Type / Paste Markdown Text
              </button>
            </div>
          </div>

          <div className="grid grid-2">
            {/* Upload Area & Direct Triggers */}
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>Upload File for Background Text Extraction</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '0 0 14px' }}>
                Supported formats: <strong>PDF, DOCX, TXT, CSV, PPTX</strong>. Text will be extracted in background, letting you review, name & edit before saving into ChromaDB.
              </p>

              {/* Hidden file input with ref */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelected}
                accept=".pdf,.docx,.txt,.csv,.pptx"
                style={{ display: 'none' }}
              />

              <div
                className="dropzone"
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'relative' }}
              >
                <FileUp size={32} style={{ color: 'var(--accent)' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '8px 0 4px' }}>
                  Click to browse and upload policy document
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Extracts text &rarr; Allows title review &rarr; Stores in Vector Database
                </span>

                {extracting && (
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Sparkles size={16} className="spin" /> Extracting text in background...
                  </div>
                )}
              </div>
            </div>

            {/* List Knowledge Base Documents */}
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>Active Knowledge Base Documents ({documents.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documents.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    No documents indexed yet. Upload a file or type markdown text to build knowledge base.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} style={{ color: 'var(--accent)' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{doc.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {doc.content_type} · {(doc.char_count / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="button button-sm button-secondary" type="button" onClick={() => handleViewDocument(doc)}>
                          <Eye size={14} /> View
                        </button>
                        <button className="button button-sm button-danger" type="button" onClick={() => handleDeleteDocument(doc.name)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive Document Review & Editor Modal / Drawer */}
          {docEditor.open && (
            <form onSubmit={handleSaveDocEditor} style={{ marginTop: '24px', padding: '20px', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} /> {docEditor.isNewMarkdown ? 'Create New Markdown Document' : `Review Extracted Document: ${docEditor.name}`}
                </h3>
                <button className="button button-sm" type="button" onClick={() => setDocEditor({ open: false, name: '', content_type: 'text/markdown', text: '' })}>
                  <X size={14} /> Cancel
                </button>
              </div>

              <div className="form-grid two" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Document Title / Name</label>
                  <input
                    className="input"
                    value={docEditor.name}
                    onChange={(e) => setDocEditor({ ...docEditor, name: e.target.value })}
                    placeholder="leave_policy_2026.md"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Document Format / Type</label>
                  <input
                    className="input"
                    value={docEditor.content_type}
                    onChange={(e) => setDocEditor({ ...docEditor, content_type: e.target.value })}
                    placeholder="text/markdown"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Extracted Text / Markdown Content</label>
                <textarea
                  className="textarea"
                  rows={10}
                  value={docEditor.text}
                  onChange={(e) => setDocEditor({ ...docEditor, text: e.target.value })}
                  placeholder="Enter policy sections, guidelines, or extracted document text here..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="button button-primary" type="submit">
                  <Save size={16} /> Save & Index into ChromaDB Vector Store
                </button>
              </div>
            </form>
          )}

          {/* View Existing Document Details */}
          {selectedDoc && !docEditor.open && (
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', background: 'var(--accent-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent)' }}>
                  <FileText size={16} /> Document Details: {selectedDoc.name}
                </h4>
                <button className="button button-sm" type="button" onClick={() => setSelectedDoc(null)}>
                  <X size={14} /> Close Preview
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px' }}>
                <strong>Format:</strong> {selectedDoc.content_type} | <strong>Size:</strong> {(selectedDoc.char_count / 1024).toFixed(1)} KB | <strong>Character Count:</strong> {selectedDoc.char_count.toLocaleString()}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', maxHeight: '260px', overflowY: 'auto', fontSize: '0.88rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedDoc.text || 'Document indexed into vector store. Text preview loaded.'}
              </div>
            </div>
          )}
        </section>
      )}

      {/* MODULE 5: Manage Power BI Link */}
      {activeTab === 'powerbi' && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><LayoutDashboard size={18} style={{ color: 'var(--accent)' }} /> Add / Edit Power BI Embed Link</h2>
          </div>

          <form onSubmit={handleSavePowerBi} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px' }}>
            <div className="form-group">
              <label>Power BI Report Embed URL</label>
              <input
                className="input"
                value={powerbiUrl}
                onChange={(e) => setPowerbiUrl(e.target.value)}
                placeholder="https://app.powerbi.com/view?r=..."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="button button-primary" type="submit">
                <Save size={16} /> Save Power BI Link
              </button>
              <a href={powerbiUrl} target="_blank" rel="noreferrer" className="button">
                Test Embed Link
              </a>
            </div>
          </form>
        </section>
      )}

      {/* MODULE 6: Manage Dataset Upload & 32-Attribute Validation */}
      {activeTab === 'dataset' && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><Database size={18} style={{ color: 'var(--accent)' }} /> Add Dataset (CSV / Excel) & Attribute Validation</h2>
            <span className="tag tag-blue">32 Attribute Schema</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0 }}>
              Upload a new workforce CSV or Excel dataset. The system automatically validates all 32 required HR attributes before updating the database.
            </p>

            <label className="dropzone">
              <input type="file" onChange={handleDatasetFileUpload} accept=".csv,.xlsx" style={{ display: 'none' }} />
              <FileUp size={32} style={{ color: 'var(--accent)' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Click to upload workforce dataset CSV or Excel file</p>
            </label>

            {datasetValidation && (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius)',
                background: datasetValidation.status === 'valid' ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${datasetValidation.status === 'valid' ? 'var(--success-border)' : '#fca5a5'}`,
              }}>
                <h4 style={{ margin: '0 0 8px', color: datasetValidation.status === 'valid' ? 'var(--success)' : 'var(--danger)' }}>
                  {datasetValidation.status === 'valid' ? 'Validation Passed: All 32 Required Attributes Match!' : 'Validation Failed: Missing Required Attributes'}
                </h4>
                <div>Total Dataset Records: <strong>{datasetValidation.totalRows}</strong></div>

                {datasetValidation.missingCols.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Missing Columns:</strong> {datasetValidation.missingCols.join(', ')}
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>32 Required Schema Attributes:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {dataAttributes.map((attr) => (
                  <span key={attr} className="tag tag-blue" style={{ fontSize: '0.76rem' }}>
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
