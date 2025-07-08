import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const LocationSelector = ({ pollingCentre, setPollingCentre }) => {
  const [county, setCounty] = useState('');
  const [counties, setCounties] = useState([]);
  const [subcounty, setSubcounty] = useState('');
  const [subcounties, setSubcounties] = useState([]);
  const [ward, setWard] = useState('');
  const [wards, setWards] = useState([]);
  const [centres, setCentres] = useState([]);

  // Fetch counties on mount
  useEffect(() => {
    async function fetchCounties() {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    }
    fetchCounties();
  }, []);

  // Fetch subcounties when county changes
  useEffect(() => {
    if (!county) {
      setSubcounties([]);
      setSubcounty('');
      setWards([]);
      setWard('');
      setCentres([]);
      setPollingCentre('');
      return;
    }
    async function fetchSubcounties() {
      const { data, error } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', county)
        .order('name');
      if (!error) setSubcounties(data);
    }
    fetchSubcounties();
  }, [county, setPollingCentre]);

  // Fetch wards when subcounty changes
  useEffect(() => {
    if (!subcounty) {
      setWards([]);
      setWard('');
      setCentres([]);
      setPollingCentre('');
      return;
    }
    async function fetchWards() {
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', subcounty)
        .order('name');
      if (!error) setWards(data);
    }
    fetchWards();
  }, [subcounty, setPollingCentre]);

  // Fetch polling centres when ward changes
  useEffect(() => {
    if (!ward) {
      setCentres([]);
      setPollingCentre('');
      return;
    }
    async function fetchCentres() {
      const { data, error } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', ward)
        .order('name');
      if (!error) setCentres(data);
    }
    fetchCentres();
  }, [ward, setPollingCentre]);

  return (
    <div>
      <div className="form-group">
        <label>County</label>
        <select
          value={county}
          onChange={e => setCounty(e.target.value)}
          required
        >
          <option value="">--Select County--</option>
          {counties.map(c => (
            <option key={c.code || c.id} value={c.code || c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Subcounty</label>
        <select
          value={subcounty}
          onChange={e => setSubcounty(e.target.value)}
          disabled={!county}
          required
        >
          <option value="">--Select Subcounty--</option>
          {subcounties.map(sc => (
            <option key={sc.id} value={sc.code || sc.id}>
              {sc.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Ward</label>
        <select
          value={ward}
          onChange={e => setWard(e.target.value)}
          disabled={!subcounty}
          required
        >
          <option value="">--Select Ward--</option>
          {wards.map(w => (
            <option key={w.id} value={w.code || w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Polling Centre</label>
        <select
          value={pollingCentre}
          onChange={e => setPollingCentre(e.target.value)}
          disabled={!ward}
          required
        >
          <option value="">--Select Polling Centre--</option>
          {centres.map(pc => (
            <option key={pc.code} value={pc.code}>
              {pc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
