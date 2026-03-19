import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const name = context.query.name || 'Anonymous Applicant';
  const title = context.query.title || 'Unknown Position';

  const acceptLang = context.req.headers['accept-language'] || 'en-US';
  
  return { props: { name, title, acceptLang } };
}

export default function Resume({ name, title, acceptLang }: { name: string, title: string, acceptLang: string }) {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '50px', fontFamily: 'sans-serif' }}>
      <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1>{name}</h1>
        <p style={{ fontSize: '18px', color: '#555' }}>{title}</p>
      </div>

      <div>
        <h3>Cover Letter</h3>
        <p>I am highly interested in the open position and possess strong skills in web security and Next.js framework.</p>
      </div>

      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#666', fontSize: '13px' }}>
        <p>🌍 <strong>Localization Info:</strong></p>
        <p>This resume is auto-translated based on the reviewer's browser settings.</p>
      </div>
        
      <div style={{ display: 'inline-block', background: '#f4f4f4', padding: '5px 10px', borderRadius: '4px' }}>
      Detected Reviewer Locale: <strong>{acceptLang}</strong>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link href="/">← Back to Builder</Link>
      </div>
    </div>
  );
}