import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

const mockAuthPlugin = () => {
  const users = {
    'admin1@example.com': { password: 'password123', role: 'admin' },
    'admin2@example.com': { password: 'password123', role: 'admin' },
    'user1@example.com': { password: 'password123', role: 'user' },
    'user2@example.com': { password: 'password123', role: 'user' },
    'user3@example.com': { password: 'password123', role: 'user' },
    'pmahanti@allshore.io': { password: 'password123', role: 'user' },
  };

  // Initialize Ethereal fake SMTP
  if (!globalThis.__etherealTransporter) {
    nodemailer.createTestAccount().then(testAccount => {
      globalThis.__etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`\n\x1b[35m[Ethereal] Fake SMTP Ready for Emails!\x1b[0m\n`);
    }).catch(err => console.error('[Ethereal Initialization Error]: ', err));
  }

  return {
    name: 'mock-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/login' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            const { email, password } = JSON.parse(body || '{}');
            res.setHeader('Content-Type', 'application/json');

            const user = users[email];
            if (!user || user.password !== password) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }

            if (user.role === 'admin') {
              res.statusCode = 200;
              return res.end(JSON.stringify({ 
                success: true, 
                mfaRequired: false, 
                token: `mock-token-admin-${Date.now()}`,
                user: { email, role: user.role }
              }));
            } else {
              // Generate MFA
              const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
              
              // Stateless
              const tempPayload = Buffer.from(JSON.stringify({ email, code: mfaCode })).toString('base64');
              
              // Render MFA to terminal
              console.log(`\n\x1b[36m=========================================\x1b[0m`);
              console.log(`\x1b[36m🔒 MFA Request for [${email}]\x1b[0m`);
              console.log(`\x1b[36m🔑 Your one-time code is: \x1b[1m\x1b[33m${mfaCode}\x1b[0m\x1b[0m`);

              const transporter = globalThis.__etherealTransporter;
              if (transporter) {
                transporter.sendMail({
                  from: '"TalentIntel AI" <no-reply@talentintel.ai>',
                  to: email,
                  subject: 'Your Login Verification Code',
                  text: `Your one-time code is ${mfaCode}`,
                  html: `<div style="font-family: sans-serif; padding: 20px;">
                           <h2 style="color: #4f46e5;">TalentIntel AI Verification</h2>
                           <p>Your one-time verification code is <b style="font-size: 24px;">${mfaCode}</b></p>
                           <p>Please enter this code in the browser to complete validation.</p>
                         </div>`
                }).then(info => {
                  console.log(`\x1b[35m📧 Email mock "sent" to ${email}!\x1b[0m`);
                  console.log(`\x1b[35m🔗 **Preview Email URL**: \x1b[4m${nodemailer.getTestMessageUrl(info)}\x1b[0m`);
                  console.log(`\x1b[36m=========================================\x1b[0m\n`);
                });
              } else {
                console.log(`\x1b[36m=========================================\x1b[0m\n`);
              }

              res.statusCode = 200;
              return res.end(JSON.stringify({ 
                success: true, 
                mfaRequired: true, 
                tempToken: tempPayload 
              }));
            }
          });
          return;
        }

        if (req.url === '/api/mfa-verify' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            const { email, code, tempToken } = JSON.parse(body || '{}');
            res.setHeader('Content-Type', 'application/json');

            if (!tempToken) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Missing security token' }));
            }

            try {
              const decodedRaw = Buffer.from(tempToken, 'base64').toString('ascii');
              const expectedData = JSON.parse(decodedRaw);

              if (expectedData.email !== email || (code !== '123456' && expectedData.code !== code)) {
                console.log(`\x1b[31m[Auth Error] Failed MFA attempt for ${email}. Expected: ${expectedData.code}, Got: ${code}\x1b[0m`);
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid or expired MFA code' }));
              }

              console.log(`\x1b[32m[Auth Success] User ${email} verified MFA.\x1b[0m`);
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                token: `mock-token-user-${Date.now()}`,
                user: { email, role: 'user' }
              }));
            } catch (err) {
              console.error('[Token Decode Error]: ', err);
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Corrupted security token' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
};

// Vite configuration with code-splitting hints for heavy libs (PDF.js, mammoth, recharts).
export default defineConfig({
  plugins: [react(), mockAuthPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          docx: ['mammoth'],
          charts: ['recharts'],
          pdfExport: ['jspdf', 'html2canvas'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
});
