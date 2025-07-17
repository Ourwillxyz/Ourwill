// src/pages/RegisterUser.js
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedSubcounty, setSelectedSubcounty] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedPollingCentre, setSelectedPollingCentre] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [statusMessage, setStatusMessage] = useState("");

  // Load counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from("counties").select("*");
      if (error) console.error("Error fetching counties:", error);
      else setCounties(data);
    };
    fetchCounties();
  }, []);

  // Load subcounties
  useEffect(() => {
    if (!selectedCounty) return;
    const fetchSubcounties = async () => {
      const { data, error } = await supabase
        .from("subcounties")
        .select("*")
        .eq("county_code", selectedCounty);
      if (error) console.error("Error fetching subcounties:", error);
      else setSubcounties(data);
    };
    fetchSubcounties();
  }, [selectedCounty]);

  // Load wards
  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetchWards = async () => {
      const { data, error } = await supabase
        .from("wards")
        .select("*")
        .eq("subcounty_code", selectedSubcounty);
      if (error) console.error("Error fetching wards:", error);
      else setWards(data);
    };
    fetchWards();
  }, [selectedSubcounty]);

  // Load polling centres
  useEffect(() => {
    if (!selectedWard) return;
    const fetchPollingCentres = async () => {
      const { data, error } = await supabase
        .from("polling_centres")
        .select("*")
        .eq("ward_code", selectedWard);
      if (error) console.error("Error fetching polling centres:", error);
      else setPollingCentres(data);
    };
    fetchPollingCentres();
  }, [selectedWard]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMessage("Registering...");

    const { name, email, phone } = formData;

    const { error } = await supabase.from("voter").insert([
      {
        name,
        email,
        phone,
        county_code: selectedCounty,
        subcounty_code: selectedSubcounty,
        ward_code: selectedWard,
        polling_centre_code: selectedPollingCentre,
      },
    ]);

    if (error) {
      console.error("Registration error:", error);
      setStatusMessage("❌ Failed to register. Please try again.");
    } else {
      setStatusMessage("✅ Successfully registered!");
      setFormData({ name: "", email: "", phone: "" });
      setSelectedCounty("");
      setSelectedSubcounty("");
      setSelectedWard("");
      setSelectedPollingCentre("");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: "1rem" }}>
      {/* App Logo and Flag */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img src="/logo.png" alt="OurWill Logo" style={{ height: 60 }} />
        <img src="/flag.png" alt="Kenya Flag" style={{ height: 40, opacity: 0.6, marginTop: 10 }} />
      </div>

      <h2 style={{ textAlign: "center" }}>Register as a Voter</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <select required value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <select required value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)}>
          <option value="">Select Subcounty</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>

        <select required value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>

        <select required value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)}>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <button type="submit" style={{ width: "100%", marginTop: 10 }}>
          Register
        </button>
      </form>
      {statusMessage && <p style={{ textAlign: "center", marginTop: 10 }}>{statusMessage}</p>}
    </div>
  );
}
