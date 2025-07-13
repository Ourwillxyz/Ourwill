import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Adjust if path differs

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
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      const fetchSubcounties = async () => {
        const { data, error } = await supabase
          .from('subcounties')
          .select('*')
          .eq('county_code', selectedCounty)
          .order('name');
        if (!error) setSubcounties(data);
        setSelectedSubcounty('');
        setWards([]);
        setSelectedWard('');
        setPollingCentres([]);
        setSelectedPollingCentre('');
      };
      fetchSubcounties();
    } else {
      setSubcounties([]);
      setSelectedSubcounty('');
      setWards([]);
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      const fetchWa
