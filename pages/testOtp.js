// pages/testOtp.js
import OtpEntryForm from '../src/components/OtpEntryForm';

export default function TestOtpPage() {
  const handleVerify = (otp) => {
    alert(`OTP entered: ${otp}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Test OTP Entry</h2>
      <OtpEntryForm onVerify={handleVerify} />
    </div>
  );
}
