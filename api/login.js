export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  const users = {
    'admin1@example.com': { password: 'password123', role: 'admin' },
    'admin2@example.com': { password: 'password123', role: 'admin' },
    'user1@example.com': { password: 'password123', role: 'user' },
    'user2@example.com': { password: 'password123', role: 'user' },
    'user3@example.com': { password: 'password123', role: 'user' },
    'pmahanti@allshore.io': { password: 'password123', role: 'user' },
  };

  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.role === 'admin') {
    return res.status(200).json({ 
      success: true, 
      mfaRequired: false, 
      token: `mock-token-admin-${Date.now()}`,
      user: { email, role: user.role }
    });
  } else {
    // Generate 6 digit MFA
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In Vercel serverless, memory is wiped instantly. We create a stateless token 
    // to pass back and forth from the client instead of using a Database Map.
    const tempPayload = Buffer.from(JSON.stringify({ email, code: mfaCode })).toString('base64');
    
    // Log clearly to Vercel Runtime Logs / Terminal
    console.log(`\n=========================================`);
    console.log(`🔒 MFA Request for [${email}]`);
    console.log(`🔑 Your verification code is: ${mfaCode}`);
    console.log(`=========================================\n`);
    
    return res.status(200).json({ 
      success: true, 
      mfaRequired: true, 
      tempToken: tempPayload // Stateless token sent to client
    });
  }
}
