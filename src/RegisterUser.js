// ... imports and other code remain the same ...

// In your counties fetch, you want county_code for value
<select
  value={selectedCounty}
  onChange={e => setSelectedCounty(e.target.value)}
  required
  style={{ padding: 8, width: '90%', margin: '1rem 0' }}
>
  <option value="">--Select County--</option>
  {counties.map(c => (
    <option key={c.county_code} value={c.county_code}>{c.name}</option>
  ))}
</select>

// Subcounties use subcounty_code for value, filter on county_code
<select
  value={selectedSubcounty}
  onChange={e => setSelectedSubcounty(e.target.value)}
  required
  disabled={!selectedCounty}
  style={{ padding: 8, width: '90%', margin: '1rem 0' }}
>
  <option value="">--Select Subcounty--</option>
  {subcounties.map(s => (
    <option key={s.subcounty_code} value={s.subcounty_code}>{s.name}</option>
  ))}
</select>

// Wards use ward_code for value, filter on subcounty_code
<select
  value={selectedWard}
  onChange={e => setSelectedWard(e.target.value)}
  required
  disabled={!selectedSubcounty}
  style={{ padding: 8, width: '90%', margin: '1rem 0' }}
>
  <option value="">--Select Ward--</option>
  {wards.map(w => (
    <option key={w.ward_code} value={w.ward_code}>{w.name}</option>
  ))}
</select>

// Polling Centres can use id or code, but filter on ward_code
<select
  value={selectedPollingCentre}
  onChange={e => setSelectedPollingCentre(e.target.value)}
  required
  disabled={!selectedWard}
  style={{ padding: 8, width: '90%', margin: '1rem 0' }}
>
  <option value="">--Select Polling Centre--</option>
  {pollingCentres.map(p => (
    <option key={p.id} value={p.id}>{p.name}</option>
  ))}
</select>
