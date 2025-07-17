import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import emailjs from "emailjs-com";

export default function RegisterUser() {
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
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  // Fetch counties on mount
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from("counties").select("*");
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties based on selected county
  useEffect(() => {
    if (formData.county) {
      const fetchSubcounties = async () => {
        const { data, error } = await supabase
          .from("subcounties")
          .select("*")
          .eq("county_code", formData.county);
        if (!error) setSubcounties(data);
      };
      fetchSubcounties();
    }
  }, [formData.county]);

  // Fetch wards based on selected subcounty
  useEffect(() => {
    if (formData.subcounty) {
      const fetchWards = async () => {
        const { data, error } = await supabase
          .from("wards")
          .select("*")
          .eq("subcounty_code", formData.subcounty);
        if (!error) setWards(data);
      };
      fetchWards();
    }
  }, [formData.subcounty]);

  // Fetch polling centres based on selected ward
  useEffect(() => {
    if (formData.ward) {
      const fetchPollingCentres = async () => {
        const { data, error } = await supabase
          .from("polling_centres")
          .select("*")
          .eq("ward_code", formData.ward);
        if (!error) setPollingCentres(data);
      };
      fetchPollingCentres();
    }
  }, [formData.ward]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleRegister = async (e) => {
    e.preventDefault();
    const generatedOtp = generateOTP();
    setOtp(generatedOtp);

    const voter_hash = crypto.randomUUID();
    const mobile_hash = btoa(formData.mobile);
    const username_hash = btoa(formData.username);
    const email_hash = btoa(formData.email);

    // Insert voter data
    const { error } = await supabase.from("voter").insert([
      {
        mobile: formData.mobile,
        email: formData.email,
        username: formData.username,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
        voter_hash,
        mobile_hash,
        username_hash,
        email_hash,
        status: "pending",
      },
    ]);

    if (error) {
      alert("Registration failed. Possibly already registered.");
      return;
    }

    // Send OTP by email via EmailJS
    try {
      await emailjs.send(
        "your_service_id",        // Replace with your EmailJS service ID
        "your_template_id",       // Replace with your EmailJS template ID
        {
          to_email: formData.email,
          otp_code: generatedOtp,
          username: formData.username,
        },
        "your_public_key"         // Replace with your EmailJS public key
      );
      alert("OTP sent successfully to your email.");
    } catch (err) {
      console.error("EmailJS error:", err);
      alert("Failed to send OTP email.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="mobile"
        placeholder="Mobile"
        value={formData.mobile}
        onChange={handleChange}
        required
      />

      {/* Dropdowns */}
      <select name="county" value={formData.county} onChange={handleChange} required>
        <option value="">Select County</option>
        {counties.map((county) => (
          <option key={county.code} value={county.code}>
            {county.name}
          </option>
        ))}
      </select>

      <select name="subcounty" value={formData.subcounty} onChange={handleChange} required>
        <option value="">Select Subcounty</option>
        {subcounties.map((sub) => (
          <option key={sub.code} value={sub.code}>
            {sub.name}
          </option>
        ))}
      </select>

      <select name="ward" value={formData.ward} onChange={handleChange} required>
        <option value="">Select Ward</option>
        {wards.map((ward) => (
          <option key={ward.code} value={ward.code}>
            {ward.name}
          </option>
        ))}
      </select>

      <select
        name="polling_centre"
        value={formData.polling_centre}
        onChange={handleChange}
        required
      >
        <option value="">Select Polling Centre</option>
        {pollingCentres.map((pc) => (
          <option key={pc.code} value={pc.code}>
            {pc.name}
          </option>
        ))}
      </select>

      <button type="submit">Register</button>
    </form>
  );
}
