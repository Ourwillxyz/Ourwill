import { useEffect, useState } from "react";
import { supabase } from "../src/supabaseClient";
import emailjs from "@emailjs/browser";
import CryptoJS from "crypto-js";

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedSubcounty, setSelectedSubcounty] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    username: "",
    polling_centre: "",
  });

  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // --- Load Counties ---
  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from("counties").select("*");
      setCounties(data || []);
    };
    fetchCounties();
  }, []);

  // --- Load Subcounties ---
  useEffect(() => {
    if (!selectedCounty) return;
    const fetchSubcounties = async () => {
      const { data } = await supabase
        .from("subcounties")
        .select("*")
        .eq("county_code", selectedCounty);
      setSubcounties(data || []);
    };
    fetchSubcounties();
  }, [selectedCounty]);

  // --- Load Wards ---
  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetchWards = async () => {
      const { data } = await supabase
        .from("wards")
        .select("*")
        .eq("subcounty_code", selectedSubcounty);
      setWards(data || []);
    };
    fetchWards();
  }, [selectedSubcounty]);

  // --- Load Polling Centres ---
  useEffect(() => {
    if (!selectedWard) return;
    const fetchPolling = async () => {
      const { data } = await supabase
        .from("polling_centres")
        .select("*")
        .eq("ward_code", selectedWard);
      setPollingCentres(data || []);
    };
    fetchPolling();
  }, [selectedWard]);

  // --- Handle Input ---
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Generate OTP ---
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // --- Hash Data ---
  const hash = (value) => CryptoJS.SHA256(value).toString();

  // --- Countdown ---
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // --- Submit Form ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { mobile, email, username, polling_centre } = formData;
    if (!mobile || !email || !username || !selectedCounty || !selectedSubcounty || !selectedWard || !polling_centre) {
      alert("Please fill all fields.");
      return;
    }

    // --- Check if mobile/email/username exists ---
    const { data: existing } = await supabase
      .from("voter")
      .select("id")
      .or(`mobile.eq.${mobile},email.eq.${email},username.eq.${username}`);
    if (existing.length > 0) {
      alert("Mobile, Email, or Username already registered.");
      return;
    }

    // --- Generate OTP ---
    const newOtp = generateOTP();
    setOtp(newOtp);

    // --- Insert voter ---
    const { error } = await supabase.from("voter").insert([
      {
        mobile,
        email,
        username,
        county: selectedCounty,
        subcounty: selectedSubcounty,
        ward: selectedWard,
        polling_centre,
        mobile_hash: hash(mobile),
        email_hash: hash(email),
        username_hash: hash(username),
        voter_hash: hash(mobile + email + username),
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      alert("Registration failed.");
      return;
    }

    // --- Send Email with OTP ---
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          email,
          passcode: newOtp,
        },
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID
      );
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      console.error("EmailJS error:", err);
      alert("OTP not sent via email.");
    }
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    const newOtp = generateOTP();
    setOtp(newOtp);
    setCountdown(60);
    emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      {
        email: formData.email,
        passcode: newOtp,
      },
      process.env.NEXT_PUBLIC_EMAILJS_USER_ID
    );
  };

  return (
    <div style={{ background: "url('/flag.png') no-repeat", backgroundSize: "cover", padding: 20 }}>
      <img src="/logo.png" alt="Logo" style={{ width: 100, opacity: 0.3 }} />
      <h2>Register to Vote</h2>
      <form onSubmit={handleSubmit}>
        <input name="mobile" placeholder="Mobile" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />

        <select onChange={(e) => setSelectedCounty(e.target.value)} required>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedSubcounty(e.target.value)} required>
          <option value="">Select Subcounty</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedWard(e.target.value)} required>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>{w.name}</option>
          ))}
        </select>

        <select name="polling_centre" onChange={handleChange} required>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>

        <button type="submit">Register</button>
      </form>

      {otpSent && (
        <div>
          <h3>Enter OTP sent to your email</h3>
          <input
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={() => alert(userOtp === otp ? "OTP Verified!" : "Invalid OTP")}>
            Verify
          </button>
          <br />
          <button onClick={resendOtp} disabled={countdown > 0}>
            Resend OTP {countdown > 0 ? `(${countdown}s)` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
