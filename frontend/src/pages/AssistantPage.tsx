import { Bot, BookOpenCheck, FileText, HelpCircle, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { policyKnowledgeBaseCategories, suggestedQuestions } from '../data/site';
import { apiFetch } from '../lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  page?: string;
  confidence?: number;
  topChunks?: { source: string; page: string; text: string }[];
};

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content: "What is the company's leave policy?",
    },
    {
      role: 'assistant',
      content:
        'According to Leave Policy.pdf, employees are entitled to 18 days of paid annual leave, 12 days of sick leave, and optional parental leave. Requests must be submitted through HR portal 5 business days in advance.',
      source: 'Leave_Policy.pdf',
      page: 'Page 6',
      confidence: 96,
      topChunks: [
        {
          source: 'Leave_Policy.pdf',
          page: 'Page 6',
          text: 'Section 4.2 - Annual Leave Entitlement: All full-time employees accrue 1.5 paid leave days per month (18 days annually). Sick leave is allotted at 12 days per year.',
        },
      ],
    },
  ]);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuestion = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    if (!queryText) setQuestion('');
    setLoading(true);

    try {
      const response = await apiFetch<{
        answer: string;
        source: string;
        page: string;
        confidence: number;
        topChunks?: { source: string; page: string; text: string }[];
      }>('/api/rag/chat', {
        method: 'POST',
        body: JSON.stringify({ question: q }),
      });

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.answer,
          source: response.source,
          page: response.page,
          confidence: response.confidence,
          topChunks: response.topChunks,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `Unable to connect to RAG assistant backend service: ${err?.message || 'Network error'}. Please check if the FastAPI server is running.`,
          source: 'System Alert',
          page: 'N/A',
          confidence: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)', gap: '16px', overflow: 'hidden' }}>
      {/* Page Header */}
      <div className="page-header" style={{ flexShrink: 0 }}>
        <span className="eyebrow"><Bot size={14} /> AI WORKFORCE ASSISTANT</span>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>ChatGPT-Style RAG Assistant</h1>
        <p style={{ margin: 0, fontSize: '0.86rem' }}>
          Grounded workforce intelligence powered by ChromaDB vector search and Gemini API.
        </p>
      </div>

      {/* Main Viewport Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) 380px', gap: '18px', flex: 1, minHeight: 0 }}>
        {/* ChatGPT Style Chat Window */}
        <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <div className="chat-header" style={{ flexShrink: 0 }}>
            <h2><Bot size={20} style={{ color: 'var(--accent)' }} /> AI Workforce Assistant</h2>
            <span className="tag tag-blue"><Sparkles size={12} /> Gemini + ChromaDB RAG</span>
          </div>

          {/* Scrollable Thread */}
          <div className="chat-messages" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.role}`}>
                <div className="bubble-role">{msg.role === 'user' ? 'User' : 'Assistant'}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {msg.role === 'assistant' && (
                  <div className="rag-metadata">
                    <span><strong>Source:</strong> {msg.source || 'Leave_Policy.pdf'}</span>
                    <span><strong>Page:</strong> {msg.page || 'Page 6'}</span>
                    <span><strong>Confidence:</strong> {msg.confidence || 96}%</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble assistant">
                <div className="bubble-role">Assistant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                  <Sparkles size={16} className="spin" /> Searching ChromaDB & generating response with Gemini API...
                </div>
              </div>
            )}
          </div>

          {/* Fixed Input Bar at bottom of chat window */}
          <div className="chat-input-bar" style={{ flexShrink: 0 }}>
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
              placeholder="Ask a workforce or HR policy question..."
              disabled={loading}
            />
            <button className="button button-primary" type="button" onClick={() => sendQuestion()} disabled={loading}>
              <Send size={16} /> Send
            </button>
          </div>
        </div>

        {/* Sidebar: Suggested Questions & Active Knowledge Base Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', minHeight: 0, overflowY: 'auto' }}>
          {/* Suggested Questions */}
          <div className="panel" style={{ flexShrink: 0, padding: '16px' }}>
            <div className="panel-title" style={{ fontSize: '0.92rem', marginBottom: '10px' }}>
              <HelpCircle size={16} style={{ color: 'var(--accent)' }} /> Suggested Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestedQuestions.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => sendQuestion(sq)}
                  className="button button-sm button-secondary"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Active Knowledge Base Documents Categories */}
          <div className="panel" style={{ flex: 1, minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-title" style={{ fontSize: '0.92rem', marginBottom: '8px', flexShrink: 0 }}>
              <BookOpenCheck size={16} style={{ color: 'var(--accent)' }} /> Active Knowledge Base Documents
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 10px', flexShrink: 0 }}>
              HR policy document domains used for vector search retrieval:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {policyKnowledgeBaseCategories.map((cat) => (
                <div key={cat.id} style={{ padding: '8px 10px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'monospace' }}>
                      <FileText size={12} style={{ color: 'var(--accent)', marginRight: '4px', verticalAlign: 'middle' }} />
                      {cat.id}
                    </strong>
                    <span className="tag tag-blue" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Active</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
