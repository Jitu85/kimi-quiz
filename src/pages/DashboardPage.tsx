import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { SUBJECTS, EXAM_PRICES, getTimeBasedGreeting, getQuestionsForExam } from '../data/quizData';
import {
  FlaskConical, Calculator, BookOpen, Lock,
  Trophy, Star, CheckCircle, X
} from 'lucide-react';
import gsap from 'gsap';

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  science: FlaskConical,
  maths: Calculator,
  english: BookOpen,
};

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Hard' | null>(null);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentSubject, setPaymentSubject] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const name = state.userProfile?.name || '';
  const greeting = getTimeBasedGreeting(name);

  // Set default class on load based on profile class
  useEffect(() => {
    if (state.userProfile?.classLevel && selectedClass === null) {
      setSelectedClass(state.userProfile.classLevel);
    }
  }, [state.userProfile]);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    if (headerRef.current) {
      tl.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
    return () => { tl.kill(); };
  }, []);

  const isExamUnlocked = (subject: string, classLevel: number) => {
    return state.unlockedExams.some(
      (e) => e.subject === subject && e.classLevel === classLevel
    );
  };

  const getExamResult = (subject: string, classLevel: number, difficulty: 'Easy' | 'Hard') => {
    return state.examResults.find(
      (r) => r.subject === subject && r.classLevel === classLevel && r.difficulty === difficulty
    );
  };

  const handleUnlock = (subject: string) => {
    setPaymentSubject(subject);
    setShowPayment(true);
    setPaymentSuccess(false);
  };

  const handlePaymentConfirm = () => {
    if (paymentSubject && selectedClass !== null) {
      dispatch({ type: 'UNLOCK_EXAM', subject: paymentSubject, classLevel: selectedClass });
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayment(false);
        setPaymentSuccess(false);
      }, 1500);
    }
  };

  const handleStartExam = (subject: string, difficulty: 'Easy' | 'Hard') => {
    if (selectedClass === null) return;
    const alreadyTaken = getExamResult(subject, selectedClass, difficulty);
    const qs = getQuestionsForExam(subject, selectedClass, difficulty, 30);
    dispatch({ type: 'SELECT_EXAM', subject, classLevel: selectedClass, difficulty });
    dispatch({ type: 'START_QUIZ', questions: qs, isFirstAttempt: !alreadyTaken });
  };

  const selectedSubjectData = SUBJECTS.find((s) => s.id === selectedSubject);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: 'linear-gradient(180deg, #050A0F 0%, #0A1628 30%, #0D1F35 100%)' }}
    >

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div ref={headerRef} className="mb-8" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h1
              className="font-serif"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300, color: '#EDE8E4' }}
            >
              {greeting}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: 'rgba(48,176,208,0.1)', borderRadius: '20px', border: '1px solid rgba(48,176,208,0.2)' }}>
                <Star className="w-3.5 h-3.5" style={{ color: '#30B0D0' }} />
                <span className="font-mono" style={{ fontSize: '12px', color: '#30B0D0' }}>
                  {state.examResults.reduce((sum, r) => sum + r.score, 0)} pts
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: 'rgba(232,168,56,0.1)', borderRadius: '20px', border: '1px solid rgba(232,168,56,0.2)' }}>
                <Trophy className="w-3.5 h-3.5" style={{ color: '#E8A838' }} />
                <span className="font-mono" style={{ fontSize: '12px', color: '#E8A838' }}>
                  {state.examResults.length} exams
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'LOGOUT' })}
                className="font-sans px-3 py-1.5 hover:bg-white/10 transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  color: '#EDE8E4',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <p className="font-sans" style={{ fontSize: '14px', color: '#9BA3A8' }}>
            Follow the steps below to choose and start your Olympiad exam.
          </p>
        </div>

        {/* Succession Steps */}
        <div className="space-y-6 mb-8">
          
          {/* STEP 1: CLASS SELECTION */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <h2 className="font-sans mb-4 flex items-center gap-2" style={{ fontSize: '14px', color: '#EDE8E4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">1</span>
              Select Class
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[2, 3, 4, 5, 6].map((c) => {
                const isSelected = selectedClass === c;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedClass(c);
                      setSelectedSubject(null);
                      setSelectedDifficulty(null);
                    }}
                    className="py-3 px-4 rounded-xl border text-center transition-all duration-300 font-sans font-semibold text-sm cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(48,176,208,0.2)' : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? '#30B0D0' : 'rgba(255,255,255,0.08)',
                      color: isSelected ? '#30B0D0' : '#EDE8E4',
                    }}
                  >
                    Class {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SUBJECT SELECTION */}
          {selectedClass !== null && (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-500">
              <h2 className="font-sans mb-4 flex items-center gap-2" style={{ fontSize: '14px', color: '#EDE8E4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">2</span>
                Select Subject
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SUBJECTS.map((subject) => {
                  const Icon = SUBJECT_ICONS[subject.id];
                  const isSelected = selectedSubject === subject.id;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject.id);
                        setSelectedDifficulty(null);
                      }}
                      className="text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-3"
                      style={{
                        background: isSelected ? `${subject.color}15` : 'rgba(255,255,255,0.03)',
                        borderColor: isSelected ? subject.color : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${subject.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: subject.color }} />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-semibold text-white">{subject.name}</h3>
                        <p className="font-sans text-xs text-gray-400">
                          {subject.id === 'science' && 'Science Olympiad'}
                          {subject.id === 'maths' && 'Mathematics Olympiad'}
                          {subject.id === 'english' && 'English Olympiad'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DIFFICULTY LEVEL SELECTION */}
          {selectedClass !== null && selectedSubject !== null && (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-500">
              <h2 className="font-sans mb-4 flex items-center gap-2" style={{ fontSize: '14px', color: '#EDE8E4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">3</span>
                Select Difficulty Level
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Easy Card */}
                <button
                  onClick={() => setSelectedDifficulty('Easy')}
                  className="p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between"
                  style={{
                    background: selectedDifficulty === 'Easy' ? 'rgba(48,176,208,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: selectedDifficulty === 'Easy' ? '#30B0D0' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-cyan-400 uppercase tracking-wider">Easy Level</h3>
                    <p className="font-sans text-xs text-gray-400 mt-1">30 Questions &middot; 150 Seconds</p>
                  </div>
                  {getExamResult(selectedSubject, selectedClass, 'Easy') && (
                    <span className="font-mono text-xs text-green-400 font-semibold px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                      Best: {getExamResult(selectedSubject, selectedClass, 'Easy')?.score}/30
                    </span>
                  )}
                </button>

                {/* Hard Card */}
                <button
                  onClick={() => setSelectedDifficulty('Hard')}
                  className="p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between"
                  style={{
                    background: selectedDifficulty === 'Hard' ? 'rgba(232,168,56,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: selectedDifficulty === 'Hard' ? '#E8A838' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-yellow-500 uppercase tracking-wider">Hard Level</h3>
                    <p className="font-sans text-xs text-gray-400 mt-1">30 Questions &middot; 120 Seconds</p>
                  </div>
                  {getExamResult(selectedSubject, selectedClass, 'Hard') && (
                    <span className="font-mono text-xs text-green-400 font-semibold px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                      Best: {getExamResult(selectedSubject, selectedClass, 'Hard')?.score}/30
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BEGIN EXAM */}
          {selectedClass !== null && selectedSubject !== null && selectedDifficulty !== null && (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-500">
              <h2 className="font-sans mb-4 flex items-center gap-2" style={{ fontSize: '14px', color: '#EDE8E4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs">4</span>
                Begin Exam
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <h3 className="font-sans font-bold text-white text-lg">
                    {SUBJECTS.find(s => s.id === selectedSubject)?.name} Olympiad
                  </h3>
                  <p className="font-sans text-sm text-gray-400 mt-1">
                    Class {selectedClass} &middot; <span className={selectedDifficulty === 'Hard' ? 'text-yellow-500' : 'text-cyan-400'}>{selectedDifficulty} Level</span>
                  </p>
                </div>
                
                {isExamUnlocked(selectedSubject, selectedClass) ? (
                  <button
                    onClick={() => handleStartExam(selectedSubject, selectedDifficulty)}
                    className="py-3 px-8 font-sans font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${selectedSubjectData?.color || '#30B0D0'}, ${selectedSubjectData?.color || '#30B0D0'}bb)`,
                      border: 'none',
                    }}
                  >
                    {getExamResult(selectedSubject, selectedClass, selectedDifficulty) ? 'Retake Exam' : 'Begin Exam'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlock(selectedSubject)}
                    className="py-3 px-8 font-sans font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #E8A838, #be7f16)',
                      border: 'none',
                    }}
                  >
                    Unlock for ₹{EXAM_PRICES[selectedClass]}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Stats Section */}
        {state.examResults.length > 0 && (
          <div className="mt-10 mb-8">
            <h2 className="font-sans mb-4" style={{ fontSize: '12px', color: '#9BA3A8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Your Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Exams Taken', value: state.examResults.length, color: '#30B0D0' },
                { label: 'Total Score', value: state.examResults.reduce((s, r) => s + r.score, 0), color: '#E8A838' },
                { label: 'Avg Score', value: state.examResults.length > 0 ? Math.round(state.examResults.reduce((s, r) => s + (r.score / r.totalQuestions) * 100, 0) / state.examResults.length) + '%' : '0%', color: '#E07050' },
                { label: 'Perfect Scores', value: state.examResults.filter(r => r.score === r.totalQuestions && r.isFirstAttempt).length, color: '#30D080' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    background: 'rgba(17, 29, 37, 0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <p className="font-mono mb-1" style={{ fontSize: '24px', fontWeight: 600, color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="font-sans" style={{ fontSize: '11px', color: '#9BA3A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(5, 10, 15, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => !paymentSuccess && setShowPayment(false)}
        >
          <div
            className="w-full max-w-sm"
            style={{
              background: 'rgba(17, 29, 37, 0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!paymentSuccess ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-sans" style={{ fontSize: '18px', fontWeight: 600, color: '#EDE8E4' }}>
                    Unlock Exam
                  </h3>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="p-1 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: '#9BA3A8', cursor: 'pointer' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <Lock className="w-12 h-12 mx-auto mb-3" style={{ color: '#E8A838' }} />
                  <p className="font-sans mb-1" style={{ fontSize: '16px', color: '#EDE8E4' }}>
                    {selectedSubjectData?.name} - Class {selectedClass}
                  </p>
                  <p className="font-mono" style={{ fontSize: '28px', fontWeight: 600, color: '#E8A838' }}>
                    ₹{EXAM_PRICES[selectedClass || 3]}
                  </p>
                  <p className="font-sans mt-1" style={{ fontSize: '12px', color: '#9BA3A8' }}>
                    One-time payment &middot; Permanent access
                  </p>
                </div>

                {/* UPI Mock */}
                <div className="mb-6 p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-sans mb-3" style={{ fontSize: '12px', color: '#9BA3A8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Pay via UPI
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(48,176,208,0.1)' }}>
                      <span className="font-sans" style={{ fontSize: '14px', color: '#30B0D0', fontWeight: 600 }}>UPI</span>
                    </div>
                    <div>
                      <p className="font-sans" style={{ fontSize: '14px', color: '#EDE8E4' }}>olympiadquiz@upi</p>
                      <p className="font-sans" style={{ fontSize: '11px', color: '#9BA3A8' }}>Mock Payment</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePaymentConfirm}
                  className="w-full font-sans transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,168,56,0.9), rgba(200,140,40,0.9))',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(232,168,56,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 28px rgba(232,168,56,0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,168,56,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Pay ₹{EXAM_PRICES[selectedClass || 3]} & Unlock
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#30D080' }} />
                <h3 className="font-sans mb-2" style={{ fontSize: '20px', fontWeight: 600, color: '#EDE8E4' }}>
                  Payment Successful!
                </h3>
                <p className="font-sans" style={{ fontSize: '14px', color: '#9BA3A8' }}>
                  Your exam is now unlocked.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
