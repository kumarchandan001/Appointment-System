// server/utils/sendEmailStub.js
/**
 * Email Notification Stub
 * Replace with real email service (Nodemailer, SendGrid) in production
 */

const sendEmail = (to, subject, body) => {
  console.log('\n📧 EMAIL NOTIFICATION:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log('---\n');
};

module.exports = sendEmail;
