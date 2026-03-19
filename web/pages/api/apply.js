export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumePath } = req.body;

  if (!resumePath || !resumePath.startsWith('/resume')) {
    return res.status(400).json({ error: 'Invalid resume path. Must start with /resume' });
  }

  const targetUrl = `http://web:3000${resumePath}`;
  
  try {
    console.log(`[API] Notifying HR Bot to visit: ${targetUrl}`);
    await fetch(`http://bot:4000/visit?url=${encodeURIComponent(targetUrl)}`);
    
    return res.status(200).json({ message: 'Application submitted successfully! HR will review it shortly.' });
  } catch (error) {
    console.error(`[API] Bot unreachable:`, error);
    return res.status(500).json({ error: 'Failed to reach the HR system.' });
  }
}