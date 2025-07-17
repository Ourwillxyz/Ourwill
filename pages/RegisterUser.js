import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import emailjs from 'emailjs-com';

export default function RegisterUser() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: ''
  });
  const [info, setInfo] = useState('');
  const [resendWarning, setResendWarning] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (form.county) fetchSubcounties(form.county);
    setForm(prev => ({ ...prev, subcounty: '', ward: '', polling_centre: '' }));
  }, [form.county]);

  useEffect(() => {
    if (form.subcounty) fetchWards(form.subcounty);
    setForm(prev => ({ ...prev, ward: '', polling_centre: '' }));
  }, [form.subcounty]);

  useEffect(() => {
    if (form.ward) fetchPollingCentres(form.ward);
    setForm(prev => ({ ...prev, polling_centre: '' }));
  }, [form.ward]);

  const fetchCounties = async () => {
    const { data } = await supabase.from('counties').select('name');
    setCounties(data || []);
  };

  const fetchSubcounties = async (county) => {
    const { data } = await supabase
      .from('subcounties')
      .select('name')
      .eq('county_name', county);
    setSubcounties(data || []);
  };

  const fetchWards = async (subcounty) => {
    const { data } = await supabase
      .from('wards')
      .select('name')
      .eq('subcounty_name', subcounty);
    setWards(data || []);
  };

  const fetchPollingCentres = async (ward) => {
    const { data } = await supabase
      .from('polling_centres')
      .select('name')
      .eq('ward_name', ward);
    setPollingCentres(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkDuplicate = async () => {
    const { data } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${form.email},mobile.eq.${form.mobile}`);
    return data?.length > 0;
  };

  const checkResendLimit = async (userEmail) => {
    const { data } = await supabase
      .from('resend_logs')
      .select('id')
      .eq('email', userEmail)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (data?.length >= 3) {
      setResendDisabled(true);
      setResendWarning('⛔ You have reached the maximum OTP resends (3 in 10 minutes). Please try later.');
      return false;
    } else if (data?.length === 2) {
      setResendWarning('⚠️ Warning: Only one more OTP resend allowed in 10 minutes.');
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo('');
    setResendWarning('');
    setResendDisabled(false);

    const duplicate = await checkDuplicate();
    if (duplicate) {
      return setInfo('❌ Email or mobile already registered.');
    }

    const otpAllowed = await checkResendLimit(form.email);
    if (!otpAllowed) return;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: voterError } = await supabase.from('voter').insert([form]);
    if (voterError) {
      return setInfo('❌ Failed to register voter.');
    }

    const { error: otpError } = await supabase.from('otp_verification').insert([
      { email: form.email, otp, used: false }
    ]);
    if (otpError) {
      return setInfo('❌ Failed to save OTP.');
    }

    const emailResult = await emailjs.send(
      'service_21itetw',
        'template_ks69v69',
        {
          email,
          passcode: otp,
          time: now,
        },
        'OrOyy74P28MfrgPhr'

    );

    if (emailResult.status !== 200) {
      return setInfo('❌ Failed to send OTP email.');
    }

    await supabase.from('resend_logs').insert([{ email: form.email }]);
    localStorage.setItem('voterEmail', form.email);
    router.push('/verify');
  };

  return (
    <div className="container">
      <h2>Register to Vote</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="tel" name="mobile" placeholder="Mobile (e.g. 712345678)" value={form.mobile} onChange={handleChange} required />

        <select name="county" value={form.county} onChange={handleChange} required>
          <option value="">Select County</option>
          {counties.map((c, i) => (
            <option key={i} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select name="subcounty" value={form.subcounty} onChange={handleChange} required>
          <option value="">Select Subcounty</option>
          {subcounties.map((sc, i) => (
            <option key={i} value={sc.name}>{sc.name}</option>
          ))}
        </select>

        <select name="ward" value={form.ward} onChange={handleChange} required>
          <option value="">Select Ward</option>
          {wards.map((w, i) => (
            <option key={i} value={w.name}>{w.name}</option>
          ))}
        </select>

        <select name="polling_centre" value={form.polling_centre} onChange={handleChange} required>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((p, i) => (
            <option key={i} value={p.name}>{p.name}</option>
          ))}
        </select>

        <button type="submit" disabled={resendDisabled}>Register & Send OTP</button>
      </form>

      {resendWarning && <p style={{ color: 'orange' }}>{resendWarning}</p>}
      {info && <p>{info}</p>}
    </div>
  );
}
