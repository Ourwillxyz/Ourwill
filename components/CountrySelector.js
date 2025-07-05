import { useRouter } from 'next/router';
import { useState } from 'react';

const countries = [
  { name: 'Kenya', code: 'ke' },
  { name: 'Ethiopia', code: 'et' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Ghana', code: 'gh' },
  { name: 'Uganda', code: 'ug' },
  { name: 'Tanzania', code: 'tz' },
  { name: 'South Africa', code: 'za' },
  { name: 'Rwanda', code: 'rw' },
  { name: 'Coming Soon...', code: 'xx' },
];

export default function CountrySelector() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleChange = (e) => {
    const code = e.target.value;
    setSelected(code);
    if (code === 'xx') return;
    router.push(`/${code}/otp`);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label>Select Your Country:</label><br />
      <select value={selected} onChange={handleChange}>
        <option value="">-- Choose a Country --</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>{country.name}</option>
        ))}
      </select>
    </div>
  );
}
