import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  const [applyStatus, setApplyStatus] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/resume?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}`;
    setResumeUrl(url);
    setApplyStatus('');
  };

  const handleApply = async () => {
    setApplyStatus('Submitting to HR Admin...');
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumePath: resumeUrl }),
    });

    const data = await res.json();
    if (res.ok) setApplyStatus('✅ Application submitted! HR Admin is reviewing your resume now.');
    else setApplyStatus('❌ Error: ' + data.error);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>📝 DevFolio Builder</h1>
      <p>Create your public resume and apply for the Software Engineer position.</p>

      <div style={{ padding: '25px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Step 1: Build Your Resume</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name:</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Job Title:</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Hacker" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💾 Save & Generate URL
          </button>
        </form>
      </div>

      {resumeUrl && (
        <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, color: '#166534' }}>Step 2: Review & Apply</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>Your Public Resume URL:</strong><br/>
            <Link href={resumeUrl} target="_blank" style={{ color: '#0070f3', wordBreak: 'break-all' }}>
              {resumeUrl}
            </Link>
          </div>

          <button onClick={handleApply} style={{ width: '100%', padding: '12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            ✉️ Submit to HR Admin
          </button>

          {applyStatus && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', border: '1px dashed #22c55e', fontSize: '14px', fontWeight: 'bold' }}>
              {applyStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}