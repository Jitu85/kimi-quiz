import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { getTimeBasedGreeting } from '../data/quizData';
import { User, Phone, Mail, GraduationCap, ChevronDown, ShieldCheck, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (greetingRef.current) {
      gsap.fromTo(greetingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  const name = state.userProfile?.name || '';
  const greeting = getTimeBasedGreeting(name);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!age || parseInt(age) < 6 || parseInt(age) > 14) newErrors.age = 'Age must be between 6 and 14';
    if (!gender) newErrors.gender = 'Please select gender';
    if (!classLevel) newErrors.classLevel = 'Please select class';
    if (!phone || phone.length < 10) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!email || !email.includes('@')) newErrors.email = 'Enter a valid email';
    if (!otpVerified) newErrors.otp = 'Please verify your phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrors({ ...errors, phone: 'Enter a valid 10-digit phone number' });
      return;
    }
    setOtpSent(true);
    setErrors({ ...errors, phone: '' });
    // Simulate OTP sent
    setTimeout(() => {
      setOtp('1234'); // Auto-fill for demo
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otp === '1234') {
      setOtpVerified(true);
      setErrors({ ...errors, otp: '' });
    } else {
      setErrors({ ...errors, otp: 'Invalid OTP. Try 1234' });
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    dispatch({
      type: 'SET_PROFILE',
      profile: {
        name,
        age: parseInt(age),
        gender,
        classLevel: parseInt(classLevel),
        phone,
        email,
        isVerified: true,
      },
    });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#EDE8E4',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#9BA3A8',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    display: 'block',
    fontWeight: 500,
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #050A0F 0%, #0A1628 50%, #0D1F35 100%)' }}
    >
      {/* Back to Login */}
      <button
        onClick={() => dispatch({ type: 'LOGOUT' })}
        className="mb-6 font-sans px-4 py-2 hover:bg-white/10 transition-colors"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          color: '#EDE8E4',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        &larr; Change Name
      </button>

      {/* Greeting */}
      <h2
        ref={greetingRef}
        className="font-serif mb-2 text-center"
        style={{
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 300,
          color: '#EDE8E4',
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
          opacity: 0,
        }}
      >
        {greeting}
      </h2>
      <p
        className="font-sans mb-8 text-center"
        style={{ fontSize: '14px', color: '#9BA3A8', letterSpacing: '0.05em' }}
      >
        Complete your profile to continue
      </p>

      {/* Profile Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md"
        style={{
          background: 'rgba(17, 29, 37, 0.85)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          opacity: 0,
        }}
      >
        {/* Age & Gender Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Age */}
          <div>
            <label style={labelStyle}>Age</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA3A8' }} />
              <input
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); setErrors({ ...errors, age: '' }); }}
                placeholder="e.g. 10"
                min={6}
                max={14}
                className="font-sans"
                style={{ ...inputStyle, paddingLeft: '40px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>
            {errors.age && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>Gender</label>
            <div className="relative">
              <button
                className="w-full font-sans flex items-center justify-between"
                style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer' }}
                onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.5)'; }}
                onBlur={() => setTimeout(() => setShowGenderDropdown(false), 150)}
              >
                <span style={{ color: gender ? '#EDE8E4' : 'rgba(155,163,168,0.5)' }}>
                  {gender || 'Select'}
                </span>
                <ChevronDown className="w-4 h-4" style={{ color: '#9BA3A8' }} />
              </button>
              {showGenderDropdown && (
                <div
                  className="absolute z-20 w-full mt-1 overflow-hidden"
                  style={{
                    background: 'rgba(17, 29, 37, 0.95)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {['Male', 'Female', 'Other'].map((g) => (
                    <div
                      key={g}
                      className="px-4 py-3 font-sans cursor-pointer transition-colors hover:bg-white/5"
                      style={{ fontSize: '14px', color: '#EDE8E4' }}
                      onClick={() => { setGender(g); setShowGenderDropdown(false); setErrors({ ...errors, gender: '' }); }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.gender && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.gender}</p>}
          </div>
        </div>

        {/* Class */}
        <div className="mb-4">
          <label style={labelStyle}>Class</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA3A8' }} />
            <button
              className="w-full font-sans flex items-center justify-between"
              style={{ ...inputStyle, paddingLeft: '40px', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setShowClassDropdown(!showClassDropdown)}
            >
              <span style={{ color: classLevel ? '#EDE8E4' : 'rgba(155,163,168,0.5)' }}>
                {classLevel ? `Class ${classLevel}` : 'Select your class'}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: '#9BA3A8' }} />
            </button>
            {showClassDropdown && (
              <div
                className="absolute z-20 w-full mt-1 overflow-hidden"
                style={{
                  background: 'rgba(17, 29, 37, 0.95)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {[2, 3, 4, 5, 6].map((c) => (
                  <div
                    key={c}
                    className="px-4 py-3 font-sans cursor-pointer transition-colors hover:bg-white/5"
                    style={{ fontSize: '14px', color: '#EDE8E4' }}
                    onClick={() => { setClassLevel(c.toString()); setShowClassDropdown(false); setErrors({ ...errors, classLevel: '' }); }}
                  >
                    Class {c}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.classLevel && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.classLevel}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label style={labelStyle}>Phone Number</label>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA3A8' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({ ...errors, phone: '' }); }}
                placeholder="10-digit number"
                className="font-sans"
                style={{ ...inputStyle, paddingLeft: '40px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                disabled={otpVerified}
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={otpVerified}
              className="font-sans px-4 transition-all duration-300"
              style={{
                background: otpVerified ? 'rgba(48, 176, 208, 0.15)' : 'rgba(48, 176, 208, 0.2)',
                border: `1px solid ${otpVerified ? 'rgba(48, 176, 208, 0.3)' : 'rgba(48, 176, 208, 0.4)'}`,
                borderRadius: '10px',
                color: otpVerified ? '#30B0D0' : '#EDE8E4',
                fontSize: '12px',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
                cursor: otpVerified ? 'default' : 'pointer',
              }}
            >
              {otpVerified ? 'Verified' : otpSent ? 'Resend' : 'Get OTP'}
            </button>
          </div>
          {errors.phone && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.phone}</p>}
        </div>

        {/* OTP */}
        {otpSent && !otpVerified && (
          <div className="mb-4">
            <label style={labelStyle}>Enter OTP</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors({ ...errors, otp: '' }); }}
                placeholder="4-digit OTP (try 1234)"
                className="font-sans flex-1"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <button
                onClick={handleVerifyOtp}
                className="font-sans px-4 transition-all duration-300 hover:bg-cyan-500/30"
                style={{
                  background: 'rgba(48, 176, 208, 0.2)',
                  border: '1px solid rgba(48, 176, 208, 0.4)',
                  borderRadius: '10px',
                  color: '#EDE8E4',
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                Verify
              </button>
            </div>
            {errors.otp && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.otp}</p>}
          </div>
        )}

        {otpVerified && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2" style={{ background: 'rgba(48, 176, 208, 0.08)', borderRadius: '8px', border: '1px solid rgba(48, 176, 208, 0.2)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#30B0D0' }} />
            <span className="font-sans" style={{ fontSize: '13px', color: '#30B0D0' }}>Phone verified successfully</span>
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label style={labelStyle}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA3A8' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
              placeholder="your@email.com"
              className="font-sans"
              style={{ ...inputStyle, paddingLeft: '40px' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />
          </div>
          {errors.email && <p className="mt-1 font-sans" style={{ fontSize: '11px', color: '#E07050' }}>{errors.email}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full font-sans flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(48,176,208,0.8), rgba(26,111,128,0.9))',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(48, 176, 208, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(48, 176, 208, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(48, 176, 208, 0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Continue to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
