import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../store/AppContext';

import {
  Clock, SkipForward, ChevronLeft, ChevronRight, Flag,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import gsap from 'gsap';

export default function QuizPage() {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questions = state.activeQuestions;
  const difficulty = state.selectedDifficulty || 'Easy';
  const initialTime = questions.length * (difficulty === 'Hard' ? 4 : 5);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const subject = state.selectedSubject || 'science';
  const classLevel = state.selectedClassLevel || 2;

  // Timer
  useEffect(() => {
    if (!state.isQuizActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowTimeUp(true);
          return 0;
        }
        if (prev <= initialTime * 0.2) setIsTimeWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isQuizActive, initialTime]);

  // Update timer in store
  useEffect(() => {
    dispatch({ type: 'UPDATE_TIMER', timer: timeLeft });
  }, [timeLeft, dispatch]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => handleSubmit(), 1500);
    }
  }, [timeLeft]);

  // Animate question change
  useEffect(() => {
    if (questionRef.current) {
      gsap.fromTo(questionRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
    if (optionsRef.current) {
      gsap.fromTo(optionsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? state.answers[currentQuestion.id] : undefined;
  const isSkipped = currentQuestion ? state.skippedQuestions.includes(currentQuestion.id) : false;

  const handleSelectAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;
    dispatch({ type: 'ANSWER_QUESTION', questionId: currentQuestion.id, answerIndex });
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    dispatch({ type: 'SKIP_QUESTION', questionId: currentQuestion.id });
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = useCallback(() => {
    if (!state.isQuizActive) return;
    const timeTaken = initialTime - timeLeft;
    let correctCount = 0;
    questions.forEach((q) => {
      if (state.answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    dispatch({ type: 'FINISH_QUIZ', score: correctCount, correctAnswers: correctCount, timeTaken });
  }, [state.isQuizActive, state.answers, questions, timeLeft, dispatch, initialTime]);

  const answeredCount = questions.filter((q) => state.answers[q.id] !== undefined).length;
  const skippedCount = state.skippedQuestions.length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050A0F' }}>
        <p className="font-sans" style={{ color: '#9BA3A8' }}>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative" style={{ background: 'linear-gradient(180deg, #050A0F 0%, #0A1628 100%)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 relative"
        style={{
          background: 'rgba(5, 10, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono" style={{ fontSize: '12px', color: '#9BA3A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {subject.charAt(0).toUpperCase() + subject.slice(1)} &middot; Class {classLevel}
            </span>
          </div>

          {/* Timer */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: isTimeWarning ? 'rgba(224,112,80,0.15)' : 'rgba(48,176,208,0.08)',
              border: `1px solid ${isTimeWarning ? 'rgba(224,112,80,0.3)' : 'rgba(48,176,208,0.15)'}`,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: isTimeWarning ? '#E07050' : '#30B0D0' }} />
            <span
              className="font-mono"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isTimeWarning ? '#E07050' : '#30B0D0',
              }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="font-sans px-4 py-1.5 transition-all duration-300"
            style={{
              background: 'rgba(48,176,208,0.15)',
              border: '1px solid rgba(48,176,208,0.3)',
              borderRadius: '8px',
              color: '#30B0D0',
              fontSize: '12px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: isTimeWarning
                    ? 'linear-gradient(90deg, #E07050, #E8A838)'
                    : 'linear-gradient(90deg, #30B0D0, #1A8FA8)',
                }}
              />
            </div>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9BA3A8' }}>
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Question Navigation Grid */}
      <div
        className="px-4 py-3 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
          {questions.map((q, idx) => {
            const isAnswered = state.answers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;
            const isQSkipped = state.skippedQuestions.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => handleNavigate(idx)}
                className="font-mono transition-all duration-200"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: isCurrent
                    ? '2px solid #30B0D0'
                    : isAnswered
                      ? '1px solid rgba(48,176,208,0.3)'
                      : isQSkipped
                        ? '1px solid rgba(224,112,80,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                  background: isCurrent
                    ? 'rgba(48,176,208,0.2)'
                    : isAnswered
                      ? 'rgba(48,176,208,0.08)'
                      : isQSkipped
                        ? 'rgba(224,112,80,0.08)'
                        : 'rgba(255,255,255,0.02)',
                  color: isCurrent ? '#30B0D0' : isAnswered ? '#30B0D0' : isQSkipped ? '#E07050' : '#9BA3A8',
                  cursor: 'pointer',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Question Number & Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono" style={{ fontSize: '12px', color: '#9BA3A8', letterSpacing: '0.1em' }}>
              QUESTION {currentQuestionIndex + 1} OF {questions.length}
            </span>
            {isSkipped && (
              <span className="flex items-center gap-1 font-mono px-2 py-0.5" style={{ fontSize: '10px', color: '#E07050', background: 'rgba(224,112,80,0.1)', borderRadius: '4px' }}>
                <Flag className="w-3 h-3" /> Skipped
              </span>
            )}
          </div>

          {/* Question Text */}
          <div ref={questionRef} className="mb-6">
            <h2
              className="font-sans"
              style={{
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 500,
                color: '#EDE8E4',
                lineHeight: 1.5,
              }}
            >
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div ref={optionsRef} className="space-y-3 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const labels = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className="w-full flex items-center gap-4 transition-all duration-300 text-left"
                  style={{
                    padding: '16px 20px',
                    background: isSelected ? 'rgba(48,176,208,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? 'rgba(48,176,208,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(48,176,208,0.2)';
                      e.currentTarget.style.background = 'rgba(48,176,208,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                >
                  <span
                    className="flex-shrink-0 font-mono w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      background: isSelected ? 'rgba(48,176,208,0.2)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#30B0D0' : '#9BA3A8',
                    }}
                  >
                    {labels[idx]}
                  </span>
                  <span className="font-sans" style={{ fontSize: '15px', color: isSelected ? '#EDE8E4' : '#EDE8E4CC' }}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle className="ml-auto w-5 h-5 flex-shrink-0" style={{ color: '#30B0D0' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 font-sans transition-all duration-300"
              style={{
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: currentQuestionIndex === 0 ? '#9BA3A840' : '#EDE8E4',
                fontSize: '13px',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="flex items-center gap-2 font-sans transition-all duration-300"
              style={{
                padding: '12px 20px',
                background: 'rgba(224,112,80,0.08)',
                border: '1px solid rgba(224,112,80,0.2)',
                borderRadius: '10px',
                color: '#E07050',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <SkipForward className="w-4 h-4" />
              Pass / Skip
            </button>

            <button
              onClick={() => currentQuestionIndex < questions.length - 1 && setCurrentQuestionIndex((prev) => prev + 1)}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 font-sans transition-all duration-300"
              style={{
                padding: '12px 20px',
                background: currentQuestionIndex === questions.length - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(48,176,208,0.1)',
                border: `1px solid ${currentQuestionIndex === questions.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(48,176,208,0.25)'}`,
                borderRadius: '10px',
                color: currentQuestionIndex === questions.length - 1 ? '#9BA3A840' : '#30B0D0',
                fontSize: '13px',
                cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(5, 10, 15, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-sm"
            style={{
              background: 'rgba(17, 29, 37, 0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '32px',
            }}
          >
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#E8A838' }} />
              <h3 className="font-sans mb-2" style={{ fontSize: '18px', fontWeight: 600, color: '#EDE8E4' }}>
                Submit Exam?
              </h3>
              <p className="font-sans" style={{ fontSize: '14px', color: '#9BA3A8' }}>
                You have answered {answeredCount} out of {questions.length} questions.
                {skippedCount > 0 && ` ${skippedCount} questions were skipped.`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setShowSubmitConfirm(false); handleSubmit(); }}
                className="w-full font-sans transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(48,176,208,0.8), rgba(26,111,128,0.8))',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(48,176,208,0.25)',
                }}
              >
                Yes, Submit Exam
              </button>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="w-full font-sans transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#9BA3A8',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Continue Answering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time's Up Modal */}
      {showTimeUp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(5, 10, 15, 0.9)', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#E07050' }} />
            <h3 className="font-sans mb-2" style={{ fontSize: '24px', fontWeight: 600, color: '#EDE8E4' }}>
              Time's Up!
            </h3>
            <p className="font-sans" style={{ fontSize: '14px', color: '#9BA3A8' }}>
              Submitting your exam automatically...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
