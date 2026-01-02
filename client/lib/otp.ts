import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Generate OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP with expiry
 */
export async function storeOTP(
  phoneNumber: string,
  otp: string,
  expiryMinutes: number = 5,
): Promise<void> {
  const expiry = Date.now() + expiryMinutes * 60 * 1000;
  await AsyncStorage.setItem(
    `otp_${phoneNumber}`,
    JSON.stringify({ otp, expiry }),
  );
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  phoneNumber: string,
  userOTP: string,
): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(`otp_${phoneNumber}`);
    if (!stored) return false;

    const { otp, expiry } = JSON.parse(stored);

    // Check if expired
    if (Date.now() > expiry) {
      await AsyncStorage.removeItem(`otp_${phoneNumber}`);
      return false;
    }

    // Verify OTP
    if (otp === userOTP) {
      await AsyncStorage.removeItem(`otp_${phoneNumber}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
}

/**
 * Send OTP via SMS (mock implementation)
 * In production, integrate with SMS provider like Twilio
 */
export async function sendOTPSMS(
  phoneNumber: string,
  otp: string,
): Promise<boolean> {
  try {
    console.log(`[SMS] Sending OTP ${otp} to ${phoneNumber}`);

    // In production:
    // await twilioClient.messages.create({
    //   body: `رمز التحقق الخاص بك: ${otp}`,
    //   to: phoneNumber,
    //   from: TWILIO_PHONE_NUMBER
    // });

    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
}

/**
 * Request OTP for phone verification
 */
export async function requestPhoneOTP(phoneNumber: string): Promise<boolean> {
  try {
    const otp = generateOTP();
    await storeOTP(phoneNumber, otp);
    return await sendOTPSMS(phoneNumber, otp);
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return false;
  }
}

/**
 * Setup 2FA for user
 */
export async function setup2FA(
  userId: number,
  secret: string,
): Promise<boolean> {
  try {
    // Store 2FA secret in AsyncStorage (in production, store in backend)
    await AsyncStorage.setItem(`2fa_${userId}`, secret);
    return true;
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return false;
  }
}

/**
 * Verify 2FA code
 */
export async function verify2FACode(
  userId: number,
  code: string,
): Promise<boolean> {
  try {
    const secret = await AsyncStorage.getItem(`2fa_${userId}`);
    if (!secret) return false;

    // In production, use speakeasy or similar library
    // const verified = speakeasy.totp.verify({
    //   secret: secret,
    //   encoding: 'base32',
    //   token: code,
    //   window: 1
    // });

    // Mock verification for demo
    return code.length === 6;
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return false;
  }
}

/**
 * Check if 2FA is enabled for user
 */
export async function is2FAEnabled(userId: number): Promise<boolean> {
  try {
    const secret = await AsyncStorage.getItem(`2fa_${userId}`);
    return !!secret;
  } catch (error) {
    return false;
  }
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(userId: number): Promise<void> {
  await AsyncStorage.removeItem(`2fa_${userId}`);
}
