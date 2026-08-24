import { useEffect, useRef, useState } from 'react';
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
  const submitLock = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancingRef = useRef(false);

  useEffect(() => {
    initializeIdentity();
  }, [initializeIdentity]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Consent is step 0 only until it has been answered. After that, step 0 is question 0
  // (do not also call nextStep on consent — that skipped the first question).
  const showConsentStep = !hasBeenAsked && currentStepIndex === 0;
  const questionIndex = hasBeenAsked ? currentStepIndex : currentStepIndex - 1;
  const isQuestionStep = questionIndex >= 0 && questionIndex < CHECKIN_QUESTIONS.length;
  const isPastLastQuestion = hasBeenAsked && currentStepIndex >= CHECKIN_QUESTIONS.length;

  useEffect(() => {
    if (!isPastLastQuestion || isDone || isSubmitting || submitLock.current || !anonId) {
      return;
    }
    submitLock.current = true;
    void submitCheckin();
  }, [isPastLastQuestion, isDone, isSubmitting, anonId]);

  const submitCheckin = async () => {
    const id = useIdentityStore.getState().anonId;
    if (!id) {
      submitLock.current = false;
      return;
    }
    setIsSubmitting(true);
    try {
      const latestAnswers = useCheckinDraftStore.getState().answers;
      await checkinService.submitCheckin({
        anonId: id,
        answers: latestAnswers,
      });
      setIsDone(true);
      // Clear persisted draft so a refresh starts a new check-in, but keep isDone
      // so this session stays on the thank-you screen instead of looping questions.
      clearDraft();
    } catch (error) {
      console.error('Failed to submit check-in', error);
      submitLock.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setDirection(1);
    nextStep();
    advancingRef.current = false;
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
    setDirection(1);
    setConsent(optedIn);
  };

  const handleAnswerSelect = (value: number) => {
    if (advancingRef.current || questionIndex < 0 || questionIndex >= CHECKIN_QUESTIONS.length) {
      return;
    }
    advancingRef.current = true;
    const qId = CHECKIN_QUESTIONS[questionIndex].id;
    setAnswer(qId, value);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      handleNext();
    }, 400);
  };

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

  if (isDone) {
    return <ConfirmationScreen />;
  }

  if (isPastLastQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-16 h-16 bg-ice-100 dark:bg-mint-900/50 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 overflow-hidden relative max-w-3xl mx-auto w-full">
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
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative w-full overflow-y-auto overflow-x-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={showConsentStep ? 'consent' : `q-${questionIndex}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
