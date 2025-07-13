import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Adjust if supabaseClient is in another folder

const RegisterUser = () => {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [step, setStep] = useState(1);

  // Load counties
  useEffect(() => {
    supabase.from('counties').select('*').order('name').then(({ data, error }) => {
      if (!error) setCounties(data);
    });
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setSubcounties(data);
        });
      setSelectedSubcounty('');
      setWards([]);
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setWards(data);
        });
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedSubcounty]);

  useEffect(() => {
    if (selectedWard) {
      supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setPollingCentres(data);
        });
      setSelectedPollingCentre('');
    }
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('❌ Please complete your location selection.');
      return;
    }

    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('❌ Invalid mobile number. Format: 2547XXXXXXXX.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('❌ Enter a valid email address.');
      return;
    }

    setInfo('⏳ Sending login link...');

    try {
      const resp
