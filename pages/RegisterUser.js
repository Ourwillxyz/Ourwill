import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import emailjs from "@emailjs/browser";
import crypto from "crypto";

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    username: "",
    county: "",
    subcounty: "",
    ward: "",
    polling_centre: "",
  });

  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (formData.county) fetchSubcounties();
  }, [formData.county]);

  useEffect(() => {
    if (formData.subcounty) fetchWards();
  }, [formData.subcounty]);

  useEffect(() => {
    if (formData.ward) fetchPollingCentres();
  }, [formData.ward]);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from("counties").select("*");
    if (data) setCounties(data);
  };

  const fetchSubcounties = async () => {
    const { data } = await supabase
      .from("subcounties")
      .select("*")
      .eq("county_code", formData.county);
    if (data) setSubcounties(data);
  };

  const fetchWards = async () => {
    const { data } = await supabase
      .from("wards")
      .select("*")
      .eq("subcounty_code", formData.subcounty);
    if (data) setWards(data);
  };

  const fetchPollingCentres = async () => {
    const { data } = await supabase
      .from("polling_centres")
      .select("*")
      .eq("ward_code", formData.ward);
    if (data) setPollingCentres(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateHash = (input) => {
    return crypto.createHash("sha256").update(input).digest("hex");
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendEmailOtp = async (email, otp) => {
    try {
      const result = await emailjs.send(
        "service_21itetw",
        "template_ks69v69",
        {
          email: email,
          passcode: otp,
        },
        "OrOyy74P28MfrgPhr"
      );
      console.log("Email sent:", result.text);
    } catch (error) {
      console.error("EmailJS error:", error);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const otpCode = generateOtp();

    const { mobile, email, username } = formData;

    const { data: duplicate, error: dupErr } = await supabase
      .from("voter")
      .select("*")
      .or(`mobile.eq.${mobile},email.eq.${email}`);

    if (duplicate && duplicate.length > 0) {
      alert("This mobile or email is already registered.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("voter").insert({
      ...formData,
      mobile_hash: generateHash(mobile),
      email_hash: generateHash(email),
      username_hash: generateHash(username),
      voter_hash: generateHash(mobile + email + username),
      status: "pending",
    });

    if (error) {
      alert("Registration failed");
      console.error(error);
    } else {
      setOtp(otpCode);
      await sendEmailOtp(email, otpCode);
      alert("Registration successful. OTP sent.");
      startResendTimer();
    }

    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    const newOtp = generateOtp();
    setOtp(newOtp);
    await sendEmailOtp(formData.email, newOtp);
    startResendTimer();
    alert("OTP resent.");
  };

  return (
    <div style={{ backgroundImage: 'url("/flag.png")', backgroundSize: "cover", padding: "2rem" }}>
      <h2>Register Voter</h2>
      <form onSubmit={handleSubmit}>
        <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />

        <select name="county" value={formData.county} onChange={handleChange} required>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select name="subcounty" value={formData.subcounty} onChange={handleChange} required>
          <option value="">Select Subcounty</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select name="ward" value={formData.ward} onChange={handleChange} required>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>{w.name}</option>
          ))}
        </select>

        <select name="polling_centre" value={formData.polling_centre} onChange={handleChange} required>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>

        <button type="submit" disabled={isSubmitting}>Register</button>
      </form>

      {otp && (
        <div>
          <p>OTP: {otp}</p>
          <button onClick={handleResendOtp} disabled={resendTimer > 0}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      )}
    </div>
  );
}
