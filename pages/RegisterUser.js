import { useState, useEffect } from "react";
import { supabase } from "../src/supabaseClient";
import emailjs from "emailjs-com";

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    county: "",
    subcounty: "",
    ward: "",
    polling_centre: "",
  });

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (formData.county) fetchSubcounties(formData.county);
  }, [formData.county]);

  useEffect(() => {
    if (formData.subcounty) fetchWards(formData.subcounty);
  }, [formData.subcounty]);

  useEffect(() => {
    if (formData.ward) fetchPollingCentres(formData.ward);
  }, [formData.ward]);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from("counties").select("*");
    if (!error) setCounties(data);
  };

  const fetchSubcounties = async (countyCode) => {
    const { data, error } = await supabase
      .from("subcounties")
      .select("*")
      .eq("county_code", countyCode);
    if (!error) setSubcounties(data);
  };

  const fetchWards = async (subcountyCode) => {
    const { data, error } = await supabase
      .from("wards")
      .select("*")
      .eq("subcounty_code", subcountyCode);
    if (!error) setWards(data);
  };

  const fetchPollingCentres = async (wardCode) => {
    const { data, error } = await supabase
      .from("polling_centres")
      .select("*")
      .eq("ward_code", wardCode);
    if (!error) setPollingCentres(data);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateHash = async (input) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendEmailOTP = async (email, username, otp) => {
    try {
      await emailjs.send(
        "your_service_id", // ✅ Replace this
        "template_ks69v69", // ✅ Replace this
        {
          to_email: email,
          username: username,
          otp_code: otp,
        },
        "OrOyy74P28MfrgPhr" // ✅ Replace this
      );
      console.log("OTP email sent successfully");
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      setMessage("Failed to send OTP email.");
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setMessage("");

    try {
      const requiredFields = [
        "username",
        "email",
        "mobile",
        "county",
        "subcounty",
        "ward",
        "polling_centre",
      ];
      for (const field of requiredFields) {
        if (!formData[field]) {
          setMessage(`Please fill out the ${field} field.`);
          setLoading(false);
          return;
        }
      }

      const voterHash = await generateHash(
        formData.username + formData.mobile + formData.email
      );
      const mobileHash = await generateHash(formData.mobile);
      const emailHash = await generateHash(formData.email);
      const usernameHash = await generateHash(formData.username);

      // Check for duplicates
      const { data: existing } = await supabase
        .from("voter")
        .select("id")
        .or(
          `email.eq.${formData.email},mobile.eq.${formData.mobile},username.eq.${formData.username}`
        )
        .limit(1);

      if (existing && existing.length > 0) {
        setMessage("Email, mobile, or username already registered.");
        setLoading(false);
        return;
      }

      const otp = generateOTP();

      const payload = {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
        voter_hash: voterHash,
        mobile_hash: mobileHash,
        email_hash: emailHash,
        username_hash: usernameHash,
        status: "pending",
      };

      const { error } = await supabase.from("voter").insert([payload]);

      if (!error) {
        await sendEmailOTP(formData.email, formData.username, otp);
        setOtpSent(true);
        setMessage("✅ OTP sent to your email.");
      } else {
        console.error(error);
        setMessage("Failed to register. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>Register Voter</h2>
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        name="mobile"
        placeholder="Mobile"
        value={formData.mobile}
        onChange={handleChange}
        style={styles.input}
      />

      <select name="county" onChange={handleChange} value={formData.county} style={styles.input}>
        <option value="">Select County</option>
        {counties.map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>

      <select name="subcounty" onChange={handleChange} value={formData.subcounty} style={styles.input}>
        <option value="">Select Subcounty</option>
        {subcounties.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>

      <select name="ward" onChange={handleChange} value={formData.ward} style={styles.input}>
        <option value="">Select Ward</option>
        {wards.map((w) => (
          <option key={w.code} value={w.code}>{w.name}</option>
        ))}
      </select>

      <select
        name="polling_centre"
        onChange={handleChange}
        value={formData.polling_centre}
        style={styles.input}
      >
        <option value="">Select Polling Centre</option>
        {pollingCentres.map((p) => (
          <option key={p.code} value={p.name}>{p.name}</option>
        ))}
      </select>

      <button onClick={handleSendOTP} disabled={loading} style={styles.button}>
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>

      {message && <p>{message}</p>}
      {otpSent && <p>✅ OTP Sent. Continue with verification.</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontFamily: "Arial",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  },
};
