// pages/RegisterUser.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const RegisterUser = () => {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (!selectedCounty) return;
    const fetch = async () => {
      const { data } = await supabase.from('subcounties').select('*').eq('county_code', selectedCounty).order('name');
      setSubcounties(data || []);
      setSelectedSubcounty('');
      setWards([]);
      setPollingCentres([]);
    };
    fetch();
  }, [selectedCounty]);

  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetch = async () => {
      const { data } = await supabase.from('wards').select('*').eq('subcounty_code', selectedSubcounty).order('name');
      setWards(data || []);
      setSelectedWard('');
      setPollingCentres([]);
    };
    fetch();
  }, [selectedSubcounty]);

  useEffect(() => {
    if (!selectedWard) return;
    const fetch = async () => {
