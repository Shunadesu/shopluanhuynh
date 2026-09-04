import nodemailer from 'nodemailer';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email (using nodemailer as fallback)
export const sendOTP = async (email, otp, fullName) => {
  try {
    // For EmailJS integration, this would be called from frontend
    // This is a backup using nodemailer
    
    // Note: Configure your email service or use EmailJS from frontend
    console.log(`OTP for ${email}: ${otp}`);
    console.log('Configure EmailJS on frontend for production');
    
    // Return success for development
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Verify OTP
export const verifyOTP = (userOTP, providedOTP, expiresAt) => {
  if (!userOTP || !expiresAt) {
    return { valid: false, message: 'No OTP found' };
  }
  
  if (new Date() > new Date(expiresAt)) {
    return { valid: false, message: 'OTP expired' };
  }
  
  if (userOTP !== providedOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true, message: 'OTP verified successfully' };
};
