import { useState, useEffect } from "react";
import { supabase } from "../src/supabaseClient";

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedSubcounty, setSelectedSubcounty] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedPollingCentre, setSelectedPollingCentre] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      fetchSubcounties(selectedCounty);
    } else {
      setSubcounties([]);
      setWards([]);
      setPollingCentres([]);
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      fetchWards(selectedSubcounty);
    } else {
      setWards([]);
      setPollingCentres([]);
    }
  }, [selectedSubcounty]);

  useEffect(() => {
    if (selectedWard) {
      fetchPollingCentres(selectedWard);
    } else {
      setPollingCentres([]);
    }
  }, [selectedWard]);

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

  const handleRegister = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("voter").insert({
      name,
      email,
      phone,
      county_code: selectedCounty,
      subcounty_code: selectedSubcounty,
      ward_code: selectedWard,
      polling_centre_code: selectedPollingCentre,
    });

    if (error) {
      setMessage("❌ Failed to register. Please try again.");
      console.error(error.message);
    } else {
      setMessage("✅ Registered successfully.");
      setName("");
      setEmail("");
      setPhone("");
      setSelectedCounty("");
      setSelectedSubcounty("");
      setSelectedWard("");
      setSelectedPollingCentre("");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      {/* Logo and Flag */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src="/logo.png"
          alt="OurWill Logo"
          style={{ height: "80px", marginBottom: "0.5rem" }}
        />
        <img
          src="/flag.png"
          alt="Kenya Flag"
          style={{ height: "40px", opacity: 0.5 }}
        />
      </div>

      <h2>Register to OurWill</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        /><br />

        <select
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
          required
        >
          <option value="">-- Select County --</option>
          {counties.map((county) => (
            <option key={county.code} value={county.code}>
              {county.name}
            </option>
          ))}
        </select><br />

        <select
          value={selectedSubcounty}
          onChange={(e) => setSelectedSubcounty(e.target.value)}
          required
        >
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((sc) => (
            <option key={sc.code} value={sc.code}>
              {sc.name}
            </option>
          ))}
        </select><br />

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          required
        >
          <option value="">-- Select Ward --</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select><br />

        <select
          value={selectedPollingCentre}
          onChange={(e) => setSelectedPollingCentre(e.target.value)}
          required
        >
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((pc) => (
            <option key={pc.code} value={pc.code}>
              {pc.name}
            </option>
          ))}
        </select><br />

        <button type="submit">Register</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
