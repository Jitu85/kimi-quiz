import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { ChevronRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export default function LandingPage() {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    if (titleRef.current) {
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      );
    }
    if (inputRef.current) {
      tl.fromTo(inputRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      );
    }
    if (sliderContainerRef.current) {
      tl.fromTo(sliderContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }
    return () => { tl.kill(); };
  }, []);

  const handleSlideStart = (clientX: number) => {
    if (!name.trim()) return;
    setIsSliding(true);
    slideStartX.current = clientX;
  };

  const handleSlideMove = (clientX: number) => {
    if (!isSliding || !sliderRef.current) return;
    const sliderWidth = sliderRef.current.parentElement!.offsetWidth - sliderRef.current.offsetWidth - 8;
    const delta = clientX - slideStartX.current;
    const progress = Math.max(0, Math.min(1, delta / sliderWidth));
    setSlideProgress(progress);
  };

  const handleSlideEnd = () => {
    if (slideProgress > 0.85) {
      setSlideProgress(1);
      setTimeout(() => {
        dispatch({ type: 'SET_PROFILE', profile: {
          name: name.trim(),
          age: 0,
          gender: '',
          classLevel: 0,
          phone: '',
          email: '',
          isVerified: false,
        }});
      }, 300);
    } else {
      gsap.to(sliderRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
      setSlideProgress(0);
    }
    setIsSliding(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => handleSlideStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleSlideMove(e.clientX);
  const handleMouseUp = () => handleSlideEnd();

  const handleTouchStart = (e: React.TouchEvent) => handleSlideStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleSlideMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleSlideEnd();

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050A0F 0%, #0A1628 50%, #0D1F35 100%)' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(48, 176, 208, ${0.2 + Math.random() * 0.4})`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero background image overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-lg w-full">
        {/* Icon */}
        <div className="mb-6">
          <Sparkles className="w-12 h-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(48,176,208,0.5))' }} />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-center mb-3 font-serif"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 300,
            color: '#EDE8E4',
            letterSpacing: '0.02em',
            textShadow: '0 2px 24px rgba(0,0,0,0.6)',
            opacity: 0,
          }}
        >
          Olympiad Quiz
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-center mb-10 font-sans"
          style={{
            fontSize: '14px',
            color: '#9BA3A8',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0,
          }}
        >
          Challenge yourself. Learn. Excel.
        </p>

        {/* Name Input */}
        <div
          ref={inputRef}
          className="w-full mb-8"
          style={{ opacity: 0 }}
        >
          <label
            className="block mb-2 font-sans"
            style={{ fontSize: '13px', color: '#9BA3A8', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Enter your name to begin
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full font-sans outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px 20px',
              color: '#EDE8E4',
              fontSize: '16px',
              backdropFilter: 'blur(10px)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(48, 176, 208, 0.6)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
          />
        </div>

        {/* Slider Button */}
        <div
          ref={sliderContainerRef}
          className="w-full"
          style={{ opacity: 0 }}
        >
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: '56px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '28px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background text */}
            <div
              className="absolute inset-0 flex items-center justify-center font-sans pointer-events-none"
              style={{
                fontSize: '13px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: name.trim() ? 'rgba(237, 232, 228, 0.4)' : 'rgba(237, 232, 228, 0.15)',
              }}
            >
              {slideProgress > 0.9 ? 'Starting...' : name.trim() ? 'Slide to Start' : 'Enter your name first'}
            </div>

            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 pointer-events-none transition-all"
              style={{
                width: `${slideProgress * 100}%`,
                background: 'linear-gradient(90deg, rgba(48,176,208,0.15), rgba(48,176,208,0.3))',
                borderRadius: '28px',
              }}
            />

            {/* Slider knob */}
            <div
              ref={sliderRef}
              className="absolute top-1 cursor-pointer transition-transform"
              style={{
                left: '4px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: name.trim()
                  ? slideProgress > 0.9
                    ? 'linear-gradient(135deg, #30B0D0, #1A8FA8)'
                    : 'linear-gradient(135deg, rgba(48,176,208,0.8), rgba(26,111,128,0.9))'
                  : 'rgba(255,255,255,0.1)',
                transform: `translateX(${slideProgress * (sliderRef.current?.parentElement?.offsetWidth ? sliderRef.current.parentElement.offsetWidth - 60 : 0)}px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: slideProgress > 0.5
                  ? '0 0 20px rgba(48,176,208,0.4)'
                  : 'none',
              }}
              onMouseDown={handleMouseDown}
            >
              <ChevronRight className="w-5 h-5" style={{ color: slideProgress > 0.9 ? '#fff' : 'rgba(237,232,228,0.8)' }} />
            </div>
          </div>
        </div>

        {/* Footer tagline */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <p
            className="font-mono text-center"
            style={{ fontSize: '11px', color: 'rgba(155,163,168,0.5)', letterSpacing: '0.1em' }}
          >
            FOR STUDENTS OF CLASSES 2 - 6
          </p>
          <p
            className="font-sans text-center font-light"
            style={{ fontSize: '11px', color: 'rgba(237, 232, 228, 0.45)', letterSpacing: '0.05em' }}
          >
            Designed & Developed by <span className="font-medium text-cyan-400/90" style={{ textShadow: '0 0 10px rgba(34,211,238,0.2)' }}>Abhijit Kumar Misra</span>
          </p>
        </div>
      </div>
    </div>
  );
}
