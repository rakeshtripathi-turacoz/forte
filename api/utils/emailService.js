const db = require('../config/database');

/**
 * Simple function to log email details to database
 * No actual email sending - just database logging
 */
const logEmail = async (to_email, to_name, subject, body_text, body_html, email_type) => {
  try {
    console.log('📝 Logging to database:', to_email, subject);

    const [result] = await db.query(
      `INSERT INTO email_logs (
        to_email, to_name, from_email, from_name,
        subject, body_text, body_html, status, email_type, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        to_email,
        to_name || null,
        'admin@forte.ac.in',
        'Forte Institute',
        subject,
        body_text || null,
        body_html || null,
        'sent',
        email_type || null,
        new Date()
      ]
    );

    console.log('✅ Logged to database! ID:', result.insertId);
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send admission enquiry confirmation
 */
const sendAdmissionEnquiryEmail = async (enquiryData) => {
  const { full_name, email, program_interested } = enquiryData;

  const subject = 'Admission Enquiry Received - Forte Institute';
  const text = `Dear ${full_name}, Thank you for your interest in ${program_interested} program.`;

  return await logEmail(
    email,
    full_name,
    subject,
    text,
    null,
    'admission_enquiry_confirmation'
  );
};

/**
 * Send contact form confirmation
 */
const sendContactFormEmail = async (contactData) => {
  const { name, email, subject: contactSubject } = contactData;

  const subject = 'Contact Form Received - Forte Institute';
  const text = `Dear ${name}, Thank you for contacting us about: ${contactSubject}`;

  return await logEmail(
    email,
    name,
    subject,
    text,
    null,
    'contact_form_confirmation'
  );
};

/**
 * Notify admin about new admission enquiry
 */
const notifyAdminNewEnquiry = async (enquiryData) => {
  const { full_name, email, program_interested } = enquiryData;

  const subject = `New Admission Enquiry - ${program_interested} - ${full_name}`;
  const text = `New admission enquiry from ${full_name} (${email}) for ${program_interested}`;

  return await logEmail(
    'admin@forte.ac.in',
    'Admin',
    subject,
    text,
    null,
    'admin_admission_notification'
  );
};

/**
 * Notify admin about new contact form
 */
const notifyAdminNewContact = async (contactData) => {
  const { name, email, subject: contactSubject } = contactData;

  const subject = `New Contact Form - ${contactSubject || 'General'} - ${name}`;
  const text = `New contact form from ${name} (${email}): ${contactSubject}`;

  return await logEmail(
    'admin@forte.ac.in',
    'Admin',
    subject,
    text,
    null,
    'admin_contact_notification'
  );
};

module.exports = {
  sendAdmissionEnquiryEmail,
  sendContactFormEmail,
  notifyAdminNewEnquiry,
  notifyAdminNewContact
};
