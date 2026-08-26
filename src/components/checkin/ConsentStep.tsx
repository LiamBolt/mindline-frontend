import PrivacyTipRoundedIcon from '@mui/icons-material/PrivacyTipRounded';


interface ConsentStepProps {
  onSelect: (optedIn: boolean) => void;
}

export default function ConsentStep({ onSelect }: ConsentStepProps) {
  return (
    <div className="flex flex-col h-full max-w-xl mx-auto w-full pt-8 pb-20">
      <div className="flex-1">
        <div className="w-12 h-12 bg-mint-100 text-mint-700 rounded-full flex items-center justify-center mb-6">
          <PrivacyTipRoundedIcon />
        </div>
        
        <h2 className="text-3xl font-semibold text-fg-heading mb-4 leading-tight">
          Before we begin, a quick note on privacy.
        </h2>
        
        <div className="space-y-4 text-lg text-fg-secondary mb-8">
          <p>
            Your check-in is strictly anonymous. We use a random ID on this device to look for patterns over time, but we don't know your name or student number.
          </p>
          <p>
            If things stay hard for a while, we can optionally have the MUST Counselling Unit reach out to check on you. 
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <button
          onClick={() => onSelect(true)}
          className="w-full py-4 px-6 btn-brand rounded-2xl text-lg font-medium transition-colors focus-ring shadow-sm"
        >
          Yes, you can contact me if needed
        </button>
        
        <button
          onClick={() => onSelect(false)}
          className="w-full py-4 px-6 bg-bg-secondary hover:bg-bg-primary text-fg-primary rounded-2xl text-lg font-medium transition-colors border border-border-subtle focus-ring"
        >
          No, I want to remain completely anonymous
        </button>
      </div>
    </div>
  );
}
