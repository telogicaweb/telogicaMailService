const nodemailer = require('nodemailer');
const connectDB = require('../config/db');

// Connect to MongoDB for email logs
connectDB();

// Transporter instance (created lazily)
let transporter = null;

// Create or get email transporter
const getTransporter = () => {
  if (!transporter) {
    // Validate credentials before creating transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials missing: EMAIL_USER and EMAIL_PASS environment variables are required');
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }

    console.log('📧 Creating email transporter with user:', process.env.EMAIL_USER?.substring(0, 5) + '***');

    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter configuration (async, non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter configuration error:', error.message);
        console.error('   Check your EMAIL_USER and EMAIL_PASS in Vercel environment variables');
      } else {
        console.log('✅ Email server is ready to send emails');
      }
    });
  }
  return transporter;
};

// Send Email Function with Logging
const sendEmail = async (to, subject, text, emailType, relatedEntity = null, html = null) => {
  let EmailLog;
  try {
    EmailLog = require('../models/EmailLog');
  } catch (error) {
    console.warn('EmailLog model not available, skipping logging');
  }

  const emailBody = html || text || 'No content';
  
  // Determine recipient type
  let recipientType = 'user';
  if (to && (to.includes('admin') || to === process.env.ADMIN_EMAIL)) {
    recipientType = 'admin';
  } else if (to && to.includes('retailer')) {
    recipientType = 'retailer';
  }

  // Create email log entry
  let emailLog;
  if (EmailLog) {
    try {
      emailLog = await EmailLog.create({
        recipient: to || 'unknown',
        recipientType,
        subject: subject || 'No Subject',
        body: emailBody,
        emailType: emailType || 'general',
        status: 'pending',
        relatedEntity: relatedEntity || {}
      });
    } catch (error) {
      console.error('Error creating email log:', error);
    }
  }

  // Validate required fields
  if (!to) {
    const errorMsg = 'Recipient email is missing';
    console.error(errorMsg);
    if (emailLog) {
      emailLog.status = 'failed';
      emailLog.errorMessage = errorMsg;
      await emailLog.save();
    }
    return { success: false, error: errorMsg, emailLog };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const errorMsg = 'Email credentials missing in environment variables';
    console.error(errorMsg);
    if (emailLog) {
      emailLog.status = 'failed';
      emailLog.errorMessage = errorMsg;
      await emailLog.save();
    }
    return { success: false, error: errorMsg, emailLog };
  }

  // Send email
  try {
    // Get transporter instance
    const emailTransporter = getTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Telogica'} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to, '| MessageID:', info.messageId);
    
    // Update email log status to sent
    if (emailLog) {
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      emailLog.metadata = new Map([['messageId', info.messageId]]);
      await emailLog.save();
    }
    
    return { success: true, messageId: info.messageId, emailLog };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Update email log status to failed
    if (emailLog) {
      emailLog.status = 'failed';
      emailLog.errorMessage = error.message;
      await emailLog.save();
    }
    
    return { success: false, error: error.message, emailLog };
  }
};

// Resend Email from Log
const resendEmail = async (emailLogId) => {
  const EmailLog = require('../models/EmailLog');
  
  try {
    const emailLog = await EmailLog.findById(emailLogId);
    if (!emailLog) {
      throw new Error('Email log not found');
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Telogica'} <${process.env.EMAIL_USER}>`,
      to: emailLog.recipient,
      subject: emailLog.subject,
      html: emailLog.body
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Update email log
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    emailLog.errorMessage = null;
    emailLog.metadata = new Map([['messageId', info.messageId]]);
    await emailLog.save();
    
    console.log('✅ Email resent successfully | MessageID:', info.messageId);
    return { success: true, messageId: info.messageId, emailLog };
  } catch (error) {
    console.error('❌ Error resending email:', error);
    return { success: false, error: error.message };
  }
};

// Get Email Logs
const getEmailLogs = async (filters = {}) => {
  const EmailLog = require('../models/EmailLog');
  
  try {
    const query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.emailType) query.emailType = filters.emailType;
    if (filters.recipientType) query.recipientType = filters.recipientType;
    if (filters.recipient) query.recipient = new RegExp(filters.recipient, 'i');
    
    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);
      
    return logs;
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }
};

// Get Email Stats
const getEmailStats = async () => {
  const EmailLog = require('../models/EmailLog');
  
  try {
    const totalEmails = await EmailLog.countDocuments();
    const sentEmails = await EmailLog.countDocuments({ status: 'sent' });
    const failedEmails = await EmailLog.countDocuments({ status: 'failed' });
    const pendingEmails = await EmailLog.countDocuments({ status: 'pending' });
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEmails = await EmailLog.countDocuments({ createdAt: { $gte: last24Hours } });
    
    return {
      total: totalEmails,
      sent: sentEmails,
      failed: failedEmails,
      pending: pendingEmails,
      last24Hours: recentEmails
    };
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return null;
  }
};

module.exports = {
  sendEmail,
  resendEmail,
  getEmailLogs,
  getEmailStats
};
