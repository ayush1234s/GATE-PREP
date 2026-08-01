// src/services/emailService.js
// Automated Welcome Email Service for GATE-PREP.
// Triggers Firebase Auth verification & writes a rich HTML welcome email to Firestore 'mail' collection.

import { sendEmailVerification } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Generate a high-converting, beautiful HTML Welcome Email for GATE ECE Students.
 */
export const getWelcomeEmailHtml = (name, email) => {
  const userName = name || 'GATE Aspirant'

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GATE-PREP</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      
      <!-- Header Banner -->
      <tr>
        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; tracking-tight: -0.5px;">
            🎓 GATE<span style="color: #cbd5e1;">-PREP</span>
          </h1>
          <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
            GATE ECE Preparation Platform
          </p>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 32px 28px;">
          <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
            Welcome, ${userName}! 👋
          </h2>

          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            Congratulations on taking the first step towards cracking the <strong>GATE ECE Examination</strong>! We are thrilled to have you join our learning community.
          </p>

          <!-- Highlights Box -->
          <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #1e1b4b; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              📚 Your Full GATE ECE Syllabus Access:
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
              <li><strong>10 Core Subjects</strong> (Maths, Networks, Signals, ED, Analog, Digital, Control, Comm, EMT, GA)</li>
              <li><strong>49 Structured Units</strong> with full chapter breakdowns</li>
              <li><strong>150+ Video Lectures</strong> & embedded study guides</li>
              <li><strong>Real-time Progress Tracker</strong> to keep your streak alive</li>
            </ul>
          </div>

          <!-- Study Strategy Tips -->
          <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 24px 0 12px 0;">
            💡 Recommended Study Blueprint:
          </h3>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <strong style="color: #4f46e5;">Step 1:</strong> Start with <em>Engineering Mathematics</em> & <em>General Aptitude</em> to build high-scoring fundamentals.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <strong style="color: #4f46e5;">Step 2:</strong> Master high-weightage topics like <em>Networks</em> and <em>Signals & Systems</em>.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <strong style="color: #4f46e5;">Step 3:</strong> Mark completed lectures as you go and track your % progress live!
              </td>
            </tr>
          </table>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="http://localhost:5173/dashboard" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
              🚀 Start Studying Now
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 6px 0;">Happy Studying & All the Best!</p>
          <p style="margin: 0; font-weight: 600; color: #64748b;">Team GATE-PREP Platform</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

/**
 * Send Welcome Email to user:
 * 1. Triggers Firebase Auth email verification (if applicable).
 * 2. Writes a structured HTML email document to Firestore 'mail' collection.
 */
export const sendWelcomeEmail = async (user, name) => {
  if (!user || !user.email) return

  const recipientName = name || user.displayName || 'GATE Aspirant'

  // 1. Trigger Firebase Auth Email Verification if not verified
  if (!user.emailVerified) {
    try {
      await sendEmailVerification(user)
      console.log('[EmailService] Firebase verification email triggered for:', user.email)
    } catch (err) {
      console.warn('[EmailService] Email verification trigger notice:', err.message)
    }
  }

  // 2. Queue Rich HTML Welcome Email in Firestore 'mail' collection
  try {
    const htmlContent = getWelcomeEmailHtml(recipientName, user.email)

    await addDoc(collection(db, 'mail'), {
      to: [user.email],
      message: {
        subject: `Welcome to GATE-PREP, ${recipientName}! 🚀 Your Study Journey Begins`,
        text: `Welcome to GATE-PREP ${recipientName}! Start studying at http://localhost:5173/dashboard`,
        html: htmlContent,
      },
      createdAt: serverTimestamp(),
    })
    console.log('[EmailService] Welcome email queued successfully in Firestore for:', user.email)
  } catch (err) {
    console.warn('[EmailService] Welcome email Firestore queue notice:', err.message)
  }
}
