import userRepository from '../repositories/userRepository.js';
import RefreshToken from '../models/RefreshToken.js';
import EmailVerification from '../models/EmailVerification.js';
import PasswordReset from '../models/PasswordReset.js';
import ApiError from '../utils/ApiError.js';
import generateOTP from '../utils/generateOTP.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';

class AuthService {
  async registerUser({ name, email, password, phoneNumber }) {
    // Check if user already exists and is verified
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser && existingUser.isEmailVerified) {
      throw new ApiError(400, 'A user with this email address already exists');
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save temporary details and OTP in EmailVerification
    await EmailVerification.findOneAndUpdate(
      { email },
      { name, password, phoneNumber, otp, expiresAt: otpExpire, isUsed: false },
      { upsert: true, new: true }
    );

    // Try sending email (don't fail registration if email fails)
    let emailSent = true;

    try {
      await sendEmail({
        email: email,
        subject: 'Verify your Mojilo Account',
        message: `Your verification OTP code is: ${otp}. It is valid for 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Welcome to Mojilo 👕</h2>
            <p>Thank you for registering.</p>
            <p>Your verification OTP is:</p>

            <div style="
                font-size:28px;
                font-weight:bold;
                letter-spacing:4px;
                color:#2563eb;
                margin:20px 0;
            ">
              ${otp}
            </div>

            <p>This OTP is valid for <strong>15 minutes</strong>.</p>

            <p>If you did not create this account, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      emailSent = false;
      console.error('Email sending failed:', error.message);
    }

    return {
      email: email,
      emailSent,
      message: emailSent
        ? 'Registration successful. Verification OTP sent to your email.'
        : 'Registration successful, but verification email could not be sent. Please use the "Resend OTP" option.',
    };
  }

  async loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, 'Your email address is not verified yet.');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await this.saveRefreshToken(user._id, refreshToken, expiresAt);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      accessToken,
      refreshToken
    };
  }

  async saveRefreshToken(userId, token, expiresAt) {
    try {
      await RefreshToken.create({
        user: userId,
        token: token,
        expiresAt,
      });
    } catch (err) {
      if (err.code === 11000) {
        await RefreshToken.findOneAndUpdate(
          { token },
          { user: userId, expiresAt, isRevoked: false },
          { upsert: true }
        );
      } else {
        throw err;
      }
    }
  }

  async refreshUserSession(token) {
    if (!token) {
      throw new ApiError(401, 'Refresh token required');
    }

    const tokenDoc = await RefreshToken.findOne({ token, isRevoked: false });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findById(tokenDoc.user);
    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Revoke old token and save new one
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await this.saveRefreshToken(user._id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logoutUser(token) {
    if (token) {
      await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
    }
    return { message: 'Logged out successfully' };
  }

  async verifyEmail({ email, otp }) {
    // Check if user already exists and is verified
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser && existingUser.isEmailVerified) {
      throw new ApiError(400, 'Email is already verified');
    }

    const verificationRecord = await EmailVerification.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      throw new ApiError(400, 'Invalid or expired OTP code');
    }

    verificationRecord.isUsed = true;
    await verificationRecord.save();

    // Create the actual user in the User collection now that verification is successful
    let user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.create({
        name: verificationRecord.name,
        email: verificationRecord.email,
        password: verificationRecord.password,
        phoneNumber: verificationRecord.phoneNumber,
        isEmailVerified: true,
        status: 'active',
      });
    } else {
      user.name = verificationRecord.name;
      user.password = verificationRecord.password;
      user.phoneNumber = verificationRecord.phoneNumber;
      user.isEmailVerified = true;
      user.status = 'active';
      await user.save();
    }

    // Generate tokens for automatic session login after registration
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.saveRefreshToken(user._id, refreshToken, expiresAt);

    return {
      message: 'Registration and email verification successful. Automatically logged in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      accessToken,
      refreshToken
    };
  }

  async sendForgotPasswordOTP(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'No account found with this email address');
    }

    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save/update password reset OTP
    await PasswordReset.create({
      email,
      otp,
      expiresAt,
    });

    await sendEmail({
      email,
      subject: 'Mojilo Password Reset OTP',
      message: `Your password reset OTP code is: ${otp}. It is valid for 15 minutes.`,
      html: `<p>Your password reset OTP code is: <strong>${otp}</strong>. It is valid for 15 minutes.</p>`
    });

    return { message: 'Password reset OTP sent to your email.' };
  }

  async resetPassword({ email, otp, newPassword }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const resetRecord = await PasswordReset.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw new ApiError(400, 'Invalid or expired OTP code');
    }

    resetRecord.isUsed = true;
    await resetRecord.save();

    user.password = newPassword;
    await user.save();

    return { message: 'Password has been updated successfully.' };
  }

  async googleAuth({ idToken }) {
    if (!idToken) {
      throw new ApiError(400, 'Google ID token is required');
    }

    let payload;
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (err) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!response.ok) throw new Error('Failed to verify token with Google');
        payload = await response.json();
      } catch (fallbackErr) {
        throw new ApiError(401, 'Invalid or expired Google authentication token');
      }
    }

    if (!payload || !payload.email) {
      throw new ApiError(400, 'Could not retrieve email from Google profile');
    }

    const { email, name, picture } = payload;

    let user = await userRepository.findByEmail(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await userRepository.create({
        name: name || email.split('@')[0],
        email: email,
        password: randomPassword,
        isEmailVerified: true,
        status: 'active',
      });
    } else {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.status = 'active';
        await user.save();
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.saveRefreshToken(user._id, refreshToken, expiresAt);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        picture: picture || null
      },
      accessToken,
      refreshToken
    };
  }
}

export default new AuthService();

