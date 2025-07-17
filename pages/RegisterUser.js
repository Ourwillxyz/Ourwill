import { useState, useEffect } from "react";
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      fetchSubcounties(selectedCounty);
    } else {
      setSubcounties([]);
    }
    setSelectedSubcounty("");
    setSelectedWard("");
    setSelectedPollingCentre("");
    setWards([]);
    setPollingCentres([]);
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      fetchWards(selectedSubcounty);
    } else {
      setWards([]);
    }
    setSelectedWard("");
    setSelectedPollingCentre("");
    setPollingCentres([]);
  }, [selectedSubcounty]);

  useEffect(() => {
    if (selectedWard) {
      fetchPollingCentres(selectedWard);
    } else {
      setPollingCentres([]);
    }
    setSelectedPollingCentre("");
  }, [selectedWard]);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from("counties").select("code, name");
    if (!error) setCounties(data);
  };

  const fetchSubcounties = async (county_code) => {
    const { data, error } = await supabase
      .from("subcounties")
      .select("code, name")
      .eq("county_code", county_code);
    if (!error) setSubcounties(data);
  };

  const fetchWards = async (subcounty_code) => {
    const { data, error } = await supabase
      .from("wards")
      .select("code, name")
      .eq("subcounty_code", subcounty_code);
    if (!error) setWards(data);
  };

  const fetchPollingCentres = async (ward_code) => {
    const { data, error } = await supabase
      .from("polling_centres")
      .select("code, name")
      .eq("ward_code", ward_code);
    if (!error) setPollingCentres(data);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const { data, error } = await supabase.from("voter").insert([
      {
        name,
        email,
        mobile,
        county_code: selectedCounty,
        subcounty_code: selectedSubcounty,
        ward_code: selectedWard,
        polling_centre_code: selectedPollingCentre,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Failed to register. Please try again.");
    } else {
      setMessage("✅ Registration successful!");
      setName("");
      setEmail("");
      setMobile("");
      setSelectedCounty("");
      setSelectedSubcounty("");
      setSelectedWard("");
      setSelectedPollingCentre("");
    }
  };

  return (
    <div>
      <h2>Register User</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />

        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        /><br />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
          <option value="">-- Select County --</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select><br />

        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select><br />

        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select><br />

        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select><br />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
