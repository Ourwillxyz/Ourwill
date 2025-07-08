const [county, setCounty] = useState('');

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const LocationSelector = ({ pollingCentre, setPollingCentre }) => {
  // ...state and useEffect as before...

  return (
    <div>
      <div className="form-group">
        <label>County</label>
        <select value={county} onChange={e => setCounty(e.target.value)} required>
          <option value="">--Select County--</option>
          {counties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Subcounty</label>
        <select value={subcounty} onChange={e => setSubcounty(e.target.value)} disabled={!county} required>
          <option value="">--Select Subcounty--</option>
          {subcounties.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Ward</label>
        <select value={ward} onChange={e => setWard(e.target.value)} disabled={!subcounty} required>
          <option value="">--Select Ward--</option>
          {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Polling Centre</label>
        <select value={pollingCentre} onChange={e => setPollingCentre(e.target.value)} disabled={!ward} required>
          <option value="">--Select Polling Centre--</option>
          {centres.map(pc => <option key={pc.code} value={pc.code}>{pc.name}</option>)}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
