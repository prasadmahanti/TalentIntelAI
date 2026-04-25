export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, code, tempToken } = req.body;

  if (!tempToken) {
    return res.status(401).json({ error: 'Missing security token' });
  }

  try {
    // Decode the stateless base64 token provided by the login step
    const decodedRaw = Buffer.from(tempToken, 'base64').toString('ascii');
    const expectedData = JSON.parse(decodedRaw);

    // Validate if the email matches the token owner and code matches
    if (expectedData.email !== email || 
        // 123456 override for demo convenience
        (code !== '123456' && expectedData.code !== code)) {
      console.log(`[Auth Error] Failed MFA attempt for ${email}. Expected: ${expectedData.code}, Got: ${code}`);
      return res.status(401).json({ error: 'Invalid or expired MFA code' });
    }

    console.log(`[Auth Success] User ${email} verified MFA.`);
    
    // Grant access
    return res.status(200).json({
      success: true,
      token: `mock-token-user-${Date.now()}`,
      user: { email, role: 'user' }
    });

  } catch (err) {
    console.error('[Token Decode Error]: ', err);
    return res.status(401).json({ error: 'Corrupted security token' });
  }
}
