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

      <div style={{ marginTop: '40px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Builder</Link>
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: '#fff', 
        padding: '6px 12px', 
        borderRadius: '20px', 
        fontSize: '11px', 
        color: '#888',
        border: '1px solid #eaeaea',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        zIndex: 1000
      }}>
        🌍 Locale: <strong>{acceptLang}</strong>
      </div>
    </div>
  );
}