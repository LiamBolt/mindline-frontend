
import * as Icons from '@mui/icons-material';
import { cn } from '../../utils/cn';

interface QuestionStepProps {
  question: {
    id: string;
    icon: string;
    prompt: string;
    options: readonly string[];
  };
  selectedValue?: number;
  onSelect: (value: number) => void;
}

export default function QuestionStep({ question, selectedValue, onSelect }: QuestionStepProps) {
  // Dynamically resolve the icon from MUI
  const IconComponent = (Icons as any)[question.icon] || Icons.HelpRounded;

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto w-full pt-4 pb-20">
      <div className="flex-1 mb-8">
        <div className="w-16 h-16 mx-auto bg-ice-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full flex items-center justify-center mb-8">
          <IconComponent fontSize="large" />
        </div>
        
        <h2 className="text-3xl font-semibold text-fg-heading text-center leading-tight">
          {question.prompt}
        </h2>
      </div>

      <div className="space-y-3 mt-auto">
        {question.options.map((option, index) => {
          const isSelected = selectedValue === index;
          
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "w-full text-left py-5 px-6 rounded-2xl text-lg font-medium transition-all focus-ring",
                isSelected
                  ? "bg-mint-100 dark:bg-mint-900 border-2 border-mint-600 text-teal-900 dark:text-white"
                  : "bg-bg-secondary hover:bg-bg-primary border-2 border-transparent text-fg-primary shadow-sm hover:shadow-md"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
