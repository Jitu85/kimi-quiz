import { useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { CheckCircle, XCircle, Trophy, Clock, Home, Download, RotateCcw, Star } from 'lucide-react';
import { getQuestionsForExam } from '../data/quizData';
import jsPDF from 'jspdf';
import gsap from 'gsap';

export default function ResultsPage() {
  const { state, dispatch } = useApp();
  const resultsRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const subject = state.selectedSubject || 'science';
  const classLevel = state.selectedClassLevel || 2;
  const latestResult = state.examResults[state.examResults.length - 1];

  const questions = state.activeQuestions.length > 0
    ? state.activeQuestions
    : getQuestionsForExam(subject, classLevel, state.selectedDifficulty || 'Easy', 30);
  const totalQuestions = questions.length;
  const correctAnswers = latestResult?.correctAnswers || 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPerfectScore = correctAnswers === totalQuestions;
  const isFirstAttempt = latestResult?.isFirstAttempt ?? false;
  const qualifiesForCertificate = isPerfectScore && isFirstAttempt;
  const timeTaken = latestResult?.timeTaken || 0;

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    if (scoreRef.current) {
      tl.fromTo(scoreRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      );
    }
    if (resultsRef.current) {
      tl.fromTo(resultsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }
    return () => { tl.kill(); };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#30D080', label: 'Outstanding' };
    if (pct >= 80) return { grade: 'A', color: '#30B0D0', label: 'Excellent' };
    if (pct >= 70) return { grade: 'B', color: '#E8A838', label: 'Good' };
    if (pct >= 60) return { grade: 'C', color: '#E07050', label: 'Satisfactory' };
    return { grade: 'D', color: '#E05050', label: 'Needs Improvement' };
  };

  const gradeInfo = getGrade(percentage);

  const handleDownloadCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // Background
    doc.setFillColor(5, 10, 15);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(48, 176, 208);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
    doc.setLineWidth(0.5);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28, 'S');

    // Header
    doc.setTextColor(48, 176, 208);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('OLYMPIAD QUIZ PLATFORM', centerX, 35, { align: 'center' });

    // Title
    doc.setTextColor(237, 232, 228);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Excellence', centerX, 60, { align: 'center' });

    // Decorative line
    doc.setDrawColor(48, 176, 208);
    doc.setLineWidth(0.5);
    doc.line(centerX - 60, 68, centerX + 60, 68);

    // Body text
    doc.setTextColor(155, 163, 168);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', centerX, 85, { align: 'center' });

    // Name
    doc.setTextColor(48, 176, 208);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(state.userProfile?.name || 'Student', centerX, 100, { align: 'center' });

    // Achievement
    doc.setTextColor(155, 163, 168);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `has achieved a perfect score of ${totalQuestions}/${totalQuestions} in the`,
      centerX, 115, { align: 'center' }
    );

    // Subject & Class
    doc.setTextColor(237, 232, 228);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${subject.charAt(0).toUpperCase() + subject.slice(1)} Olympiad - Class ${classLevel}`,
      centerX, 128, { align: 'center' }
    );

    // Performance
    doc.setTextColor(155, 163, 168);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Grade: ${gradeInfo.grade}  |  Accuracy: ${percentage}%  |  Time: ${formatTime(timeTaken)}`,
      centerX, 142, { align: 'center' }
    );

    // Date
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setTextColor(155, 163, 168);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, centerX, 162, { align: 'center' });

    // Footer
    doc.setTextColor(48, 176, 208);
    doc.setFontSize(11);
    doc.text('--- Olympiad Quiz Platform ---', centerX, 180, { align: 'center' });

    doc.save(`Certificate-${state.userProfile?.name || 'Student'}-${subject}-Class${classLevel}.pdf`);
  };

  const handleGoHome = () => {
    dispatch({ type: 'GO_HOME' });
  };

  const handleRetake = () => {
    const difficulty = state.selectedDifficulty || 'Easy';
    const qs = getQuestionsForExam(subject, classLevel, difficulty, 30);
    dispatch({ type: 'SELECT_EXAM', subject, classLevel, difficulty });
    dispatch({ type: 'START_QUIZ', questions: qs, isFirstAttempt: false });
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(180deg, #050A0F 0%, #0A1628 50%, #0D1F35 100%)' }}
    >
      <div className="w-full max-w-2xl">
        {/* Score Circle */}
        <div ref={scoreRef} className="text-center mb-8" style={{ opacity: 0 }}>
          <div
            className="inline-flex flex-col items-center justify-center mb-4"
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              border: `3px solid ${gradeInfo.color}40`,
              background: `${gradeInfo.color}10`,
              position: 'relative',
            }}
          >
            <span className="font-mono" style={{ fontSize: '42px', fontWeight: 700, color: gradeInfo.color }}>
              {percentage}%
            </span>
            <span className="font-sans" style={{ fontSize: '13px', color: '#9BA3A8' }}>
              {gradeInfo.grade} Grade
            </span>
            {qualifiesForCertificate && (
              <div
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: '#E8A838', boxShadow: '0 2px 12px rgba(232,168,56,0.4)' }}
              >
                <Trophy className="w-5 h-5" style={{ color: '#fff' }} />
              </div>
            )}
          </div>

          <h1
            className="font-serif mb-2"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: '#EDE8E4' }}
          >
            {qualifiesForCertificate ? 'Perfect Score!' : gradeInfo.label}
          </h1>
          <p className="font-sans" style={{ fontSize: '14px', color: '#9BA3A8' }}>
            You scored {correctAnswers} out of {totalQuestions} questions correctly
          </p>
        </div>

        {/* Results Card */}
        <div
          ref={resultsRef}
          style={{
            background: 'rgba(17, 29, 37, 0.85)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px',
            backdropFilter: 'blur(20px)',
            opacity: 0,
          }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: CheckCircle, label: 'Correct', value: `${correctAnswers}`, color: '#30D080' },
              { icon: XCircle, label: 'Incorrect', value: `${totalQuestions - correctAnswers}`, color: '#E07050' },
              { icon: Clock, label: 'Time Taken', value: formatTime(timeTaken), color: '#30B0D0' },
              { icon: Star, label: 'Grade', value: gradeInfo.grade, color: '#E8A838' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-3"
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                <p className="font-mono" style={{ fontSize: '18px', fontWeight: 600, color: stat.color }}>
                  {stat.value}
                </p>
                <p className="font-sans" style={{ fontSize: '10px', color: '#9BA3A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Question Review */}
          <div className="mb-6">
            <h3 className="font-sans mb-3" style={{ fontSize: '12px', color: '#9BA3A8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Question Review
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {questions.map((q, idx) => {
                const userAnswer = state.answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                const isAnswered = userAnswer !== undefined;
                const isSkipped = state.skippedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3"
                    style={{
                      background: isCorrect ? 'rgba(48,208,128,0.05)' : isAnswered ? 'rgba(224,112,80,0.05)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      border: `1px solid ${isCorrect ? 'rgba(48,208,128,0.1)' : isAnswered ? 'rgba(224,112,80,0.1)' : 'rgba(255,255,255,0.04)'}`,
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center mt-0.5"
                      style={{
                        background: isCorrect ? 'rgba(48,208,128,0.15)' : isAnswered ? 'rgba(224,112,80,0.15)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4" style={{ color: '#30D080' }} />
                      ) : isAnswered ? (
                        <XCircle className="w-4 h-4" style={{ color: '#E07050' }} />
                      ) : (
                        <span className="font-mono" style={{ fontSize: '10px', color: '#9BA3A8' }}>{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans mb-1" style={{ fontSize: '13px', color: '#EDE8E4' }}>
                        {q.question}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {isAnswered && (
                          <span className="font-sans" style={{ fontSize: '11px', color: '#E07050' }}>
                            Your: {q.options[userAnswer]}
                          </span>
                        )}
                        {isSkipped && (
                          <span className="font-sans" style={{ fontSize: '11px', color: '#E8A838' }}>
                            Skipped
                          </span>
                        )}
                        <span className="font-sans" style={{ fontSize: '11px', color: '#30D080' }}>
                          Correct: {q.options[q.correctAnswer]}
                        </span>
                      </div>
                      {q.explanation && (
                        <p className="font-sans mt-2 text-xs italic" style={{ color: '#9BA3A8', lineHeight: 1.4 }}>
                          <span className="font-semibold not-italic" style={{ color: '#30B0D0' }}>Explanation: </span>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate CTA */}
          {qualifiesForCertificate && (
            <div
              className="mb-6 p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(232,168,56,0.1), rgba(232,168,56,0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(232,168,56,0.2)',
              }}
            >
              <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: '#E8A838' }} />
              <h3 className="font-sans mb-1" style={{ fontSize: '16px', fontWeight: 600, color: '#E8A838' }}>
                Congratulations! You earned a certificate!
              </h3>
              <p className="font-sans mb-3" style={{ fontSize: '13px', color: '#9BA3A8' }}>
                Perfect score on your first attempt. Download your Certificate of Excellence.
              </p>
              <button
                onClick={handleDownloadCertificate}
                className="font-sans flex items-center gap-2 mx-auto transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(232,168,56,0.8), rgba(200,140,40,0.8))',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(232,168,56,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,168,56,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,168,56,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
            </div>
          )}

          {!qualifiesForCertificate && isFirstAttempt && (
            <div
              className="mb-6 p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="font-sans" style={{ fontSize: '13px', color: '#9BA3A8' }}>
                Score a perfect {totalQuestions}/{totalQuestions} on your first attempt to earn a Certificate of Excellence!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 font-sans flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '14px',
                color: '#EDE8E4',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button
              onClick={handleRetake}
              className="flex-1 font-sans flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: 'rgba(48,176,208,0.15)',
                border: '1px solid rgba(48,176,208,0.3)',
                borderRadius: '10px',
                padding: '14px',
                color: '#30B0D0',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Retake Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
