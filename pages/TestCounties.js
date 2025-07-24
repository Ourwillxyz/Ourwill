import { useState, useEffect } from 'react';
import supabase from '../src/supabaseClient';

export default function TestCounties() {
  const [counties, setCounties] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      console.log("supabase object:", supabase); // Should NOT be undefined
      if (!supabase) {
        setErrorMsg("Supabase client is undefined!");
        return;
      }
      const { data, error } = await supabase
        .from('counties')
        .select('county_code, county_name')
        .order('county_name', { ascending: true });
      console.log("Counties fetch:", data, error);
      if (error) setErrorMsg(error.message);
      if (data) setCounties(data);
    })();
  }, []);

  return (
    <div>
      <h2>Counties List Test</h2>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
      <select>
        <option value="">Select County</option>
        {counties.map(c => (
          <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
        ))}
      </select>
    </div>
  );
}
