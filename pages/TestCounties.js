import { useState, useEffect } from 'react';
import supabase from '../src/supabaseClient';

export default function TestCounties() {
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('counties')
        .select('county_code, county_name')
        .order('county_name', { ascending: true });
      console.log("Counties fetch:", data, error); // Debug log

      if (error) {
        setErrorMsg('Error fetching counties: ' + error.message);
      }
      if (data) {
        setCounties(data);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, background: "#fff", borderRadius: 8 }}>
      <h2>Counties List Test</h2>
      {errorMsg && <div style={{ color: "red", marginBottom: 12 }}>{errorMsg}</div>}
      {loading ? <div>Loading...</div> : (
        <select
          value={selectedCounty}
          onChange={e => setSelectedCounty(e.target.value)}
          style={{ width: "100%", padding: "0.6rem 0.8rem", marginBottom: 18, fontSize: "1rem" }}
        >
          <option value="">Select County</option>
          {counties.map(c => (
            <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
          ))}
        </select>
      )}
      <div>
        <b>Selected County Code:</b> {selectedCounty}
      </div>
    </div>
  );
}
