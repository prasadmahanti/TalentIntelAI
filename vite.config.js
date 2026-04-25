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

  // Store globally so it persists across Vite config reloads
  globalThis.__mfaStore = globalThis.__mfaStore || new Map();
  const tempMfaStore = globalThis.__mfaStore;

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
              tempMfaStore.set(email, mfaCode);
              
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
                tempToken: email 
              }));
            }
          });
          return;
        }

        if (req.url === '/api/mfa-verify' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            const { email, code } = JSON.parse(body || '{}');
            res.setHeader('Content-Type', 'application/json');

            const expectedCode = tempMfaStore.get(email);
            
            // Allow bypassing with '123456' for test continuity if store resets, or check literal expectedCode
            if (code !== '123456' && (!expectedCode || expectedCode !== code)) {
              console.log(`\x1b[31m[Auth Error] Failed MFA attempt for ${email}. Expected: ${expectedCode}, Got: ${code}\x1b[0m`);
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Invalid or expired MFA code' }));
            }

            tempMfaStore.delete(email);

            console.log(`\x1b[32m[Auth Success] User ${email} verified MFA.\x1b[0m`);
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              token: `mock-token-user-${Date.now()}`,
              user: { email, role: 'user' }
            }));
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
