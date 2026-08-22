import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCheckinDraftStore } from '../../stores/checkinDraftStore';
import { useConsentStore } from '../../stores/consentStore';
import { useIdentityStore } from '../../stores/identityStore';
import { checkinService } from '../../services/checkinService';
import { CHECKIN_QUESTIONS } from '../../config/checkinQuestions';

import StepProgressBar from '../../components/checkin/StepProgressBar';
import ConsentStep from '../../components/checkin/ConsentStep';
import QuestionStep from '../../components/checkin/QuestionStep';
import ConfirmationScreen from '../../components/checkin/ConfirmationScreen';

import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';


export default function CheckinFlow() {
  const navigate = useNavigate();
  const { initializeIdentity, anonId } = useIdentityStore();
  const { hasBeenAsked, setConsent } = useConsentStore();
  const { 
    currentStepIndex, answers, 
    nextStep, prevStep, setAnswer, clearDraft 
  } = useCheckinDraftStore();

  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Initialize identity if not present
  useEffect(() => {
    initializeIdentity();
  }, [initializeIdentity]);

  // Total steps = consent (if needed) + questions
  const showConsentStep = !hasBeenAsked && currentStepIndex === 0;
  
  // Calculate question index (adjusting for consent step if it exists and hasn't been asked)
  const questionIndex = hasBeenAsked ? currentStepIndex : currentStepIndex - 1;
  const isQuestionStep = questionIndex >= 0 && questionIndex < CHECKIN_QUESTIONS.length;
  const isConfirmation = questionIndex >= CHECKIN_QUESTIONS.length;

  useEffect(() => {
    if (isConfirmation && !isDone && !isSubmitting) {
      submitCheckin();
    }
  }, [isConfirmation, isDone, isSubmitting]);

  const submitCheckin = async () => {
    if (!anonId) return;
    setIsSubmitting(true);
    try {
      await checkinService.submitCheckin({
        anonId,
        answers,
      });
      setIsDone(true);
      clearDraft();
    } catch (error) {
      console.error('Failed to submit check-in', error);
      // In a real app, handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handlePrev = () => {
    setDirection(-1);
    if (currentStepIndex === 0) {
      navigate('/');
    } else {
      prevStep();
    }
  };

  const handleConsent = (optedIn: boolean) => {
    setConsent(optedIn);
    handleNext();
  };

  const handleAnswerSelect = (value: number) => {
    const qId = CHECKIN_QUESTIONS[questionIndex].id;
    setAnswer(qId, value);
    // Auto-advance after a short delay for better UX
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (isConfirmation) {
    if (isSubmitting) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 bg-ice-100 dark:bg-mint-900/50 rounded-full animate-pulse" />
        </div>
      );
    }
    return <ConfirmationScreen />;
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 overflow-hidden relative max-w-3xl mx-auto w-full">
      {/* Top Bar Area */}
      <div className="flex items-center justify-between mb-2 z-10 bg-bg-primary">
        <button
          onClick={handlePrev}
          className="p-3 -ml-3 text-fg-secondary hover:text-fg-primary focus-ring rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </button>
        
        <div className="flex-1 px-4">
          {isQuestionStep && (
            <StepProgressBar 
              currentStep={questionIndex + 1} 
              totalSteps={CHECKIN_QUESTIONS.length} 
              label={`Question ${questionIndex + 1} of ${CHECKIN_QUESTIONS.length}`}
            />
          )}
        </div>
        
        {/* Placeholder to balance the flex container if we want something on the right */}
        <div className="w-10"></div>
      </div>

      {/* Main Content Area with AnimatePresence */}
      <div className="flex-1 relative w-full overflow-y-auto overflow-x-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStepIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // var(--ease-calm)
            className="absolute inset-0 w-full"
          >
            {showConsentStep ? (
              <ConsentStep onSelect={handleConsent} />
            ) : isQuestionStep ? (
              <QuestionStep
                question={CHECKIN_QUESTIONS[questionIndex]}
                selectedValue={answers[CHECKIN_QUESTIONS[questionIndex].id]}
                onSelect={handleAnswerSelect}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
