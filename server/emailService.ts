import nodemailer from 'nodemailer';
import { contactFormSchema } from '@shared/schema';
import type { z } from 'zod';

type ContactFormData = z.infer<typeof contactFormSchema>;

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

/**
 * Sends an email with the contact form data to the specified email address
 */
export async function sendContactEmail(formData: ContactFormData): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured, skipping email sending but storing submission');
      return false;
    }
    
    // Get nursery name from location
    const nurseryName = formData.nurseryLocation
      ? formData.nurseryLocation.charAt(0).toUpperCase() + formData.nurseryLocation.slice(1)
      : 'Not specified';

    // Format the message content
    const messageHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone}</p>
      <p><strong>Nursery Location:</strong> ${nurseryName}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message.replace(/\n/g, '<br>')}</p>
      <p><em>This email was sent from the CMC Nursery website contact form.</em></p>
    `;

    const messageText = `
      New Contact Form Submission
      
      From: ${formData.name}
      Email: ${formData.email}
      Phone: ${formData.phone}
      Nursery Location: ${nurseryName}
      
      Message:
      ${formData.message}
      
      This email was sent from the CMC Nursery website contact form.
    `;

    // For development purposes, log the email content
    console.log('Email content would be:', {
      to: 'IT@kingsborough.org.uk',
      subject: `New Contact Form Submission - ${nurseryName} Nursery`,
      messageText
    });

    // Send email to IT@kingsborough.org.uk 
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'CMC Nursery Website <noreply@cmcnursery.co.uk>',
      to: 'IT@kingsborough.org.uk',
      replyTo: formData.email,
      subject: `New Contact Form Submission - ${nurseryName} Nursery`,
      text: messageText,
      html: messageHtml
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Function to verify email configuration is working
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}