import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const LocationSelector = ({ pollingCentre, setPollingCentre }) => {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [centres, setCentres] = useState([]);

  const [county, setCounty] = useState('');
  const [subcounty, setSubcounty] = useState('');
  const [ward, setWard] = useState('');

  // Fetch counties on mount
  useEffect(() => {
    supabase.from('counties').select('id, name').then(({ data }) => setCounties(data));
  }, []);

  // Fetch subcounties when county changes
  useEffect(() => {
    if (county) {
      supabase.from('subcounties').select('id, name').eq('county_id', county).then(({ data }) => setSubcounties(data));
      setSubcounty('');
      setWard('');
      setCentres([]);
      setWards([]);
    }
  }, [county]);

  // Fetch wards when subcounty changes
  useEffect(() => {
    if (subcounty) {
      supabase.from('wards').select('id, name').eq('subcounty_id', subcounty).then(({ data }) => setWards(data));
      setWard('');
      setCentres([]);
    }
  }, [subcounty]);

  // Fetch polling centres when ward changes
  useEffect(() => {
    if (ward) {
      supabase.from('polling_centres').select('code, name').eq('ward_id', ward).then(({ data }) => setCentres(data));
      setPollingCentre('');
    }
  }, [ward, setPollingCentre]);

  return (
    <div>
      <label>County</label>
      <select value={county} onChange={e => setCounty(e.target.value)} required>
        <option value="">--Select County--</option>
        {counties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label>Subcounty</label>
      <select value={subcounty} onChange={e => setSubcounty(e.target.value)} disabled={!county} required>
        <option value="">--Select Subcounty--</option>
        {subcounties.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
      </select>

      <label>Ward</label>
      <select value={ward} onChange={e => setWard(e.target.value)} disabled={!subcounty} required>
        <option value="">--Select Ward--</option>
        {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>

      <label>Polling Centre</label>
      <select value={pollingCentre} onChange={e => setPollingCentre(e.target.value)} disabled={!ward} required>
        <option value="">--Select Polling Centre--</option>
        {centres.map(pc => <option key={pc.code} value={pc.code}>{pc.name}</option>)}
      </select>
    </div>
  );
};

export default LocationSelector;
