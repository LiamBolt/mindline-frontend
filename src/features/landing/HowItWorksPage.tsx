

export default function HowItWorksPage() {
  return (
    <div className="flex-1 flex flex-col px-4 pt-12 lg:pt-24 max-w-4xl mx-auto w-full pb-24">
      <h1 className="text-3xl lg:text-4xl font-semibold text-fg-heading mb-12">
        How it works
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-bg-secondary p-8 rounded-3xl border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-mint-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-xl mb-6">
            1
          </div>
          <h3 className="text-xl font-medium text-teal-900 dark:text-teal-100 mb-3">Check in</h3>
          <p className="text-fg-secondary">
            Answer six simple questions about your week. The questions focus on things like your sleep, appetite, and energy levels. It takes less than a minute.
          </p>
        </div>
        
        <div className="bg-bg-secondary p-8 rounded-3xl border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-mint-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-xl mb-6">
            2
          </div>
          <h3 className="text-xl font-medium text-teal-900 dark:text-teal-100 mb-3">Stay anonymous</h3>
          <p className="text-fg-secondary">
            Everything is stored against a random ID generated on your device, not your name. You never need to enter your email or student number.
          </p>
        </div>
        
        <div className="bg-bg-secondary p-8 rounded-3xl border border-border-subtle shadow-sm">
          <div className="w-12 h-12 bg-mint-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-xl mb-6">
            3
          </div>
          <h3 className="text-xl font-medium text-teal-900 dark:text-teal-100 mb-3">We look for patterns</h3>
          <p className="text-fg-secondary">
            If things stay hard for a while (over several check-ins), we'll gently suggest support options or—if you've opted in—have someone reach out.
          </p>
        </div>
      </div>
    </div>
  );
}
