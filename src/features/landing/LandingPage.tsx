
import { Link } from 'react-router-dom';
import landingImage from '../../assets/landing-image.jpg';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 text-center overflow-hidden h-[calc(100vh-8rem)] min-h-[500px]">
      {/* Landing Image */}
      <div className="w-48 h-48 md:w-80 md:h-80 relative mb-8 rounded-full overflow-hidden shadow-xl border-4 border-white dark:border-bg-secondary flex-shrink-0">
        <img src={landingImage} alt="MindLine Check-in" className="object-cover w-full h-full" />
      </div>

      <h1 className="text-3xl md:text-5xl font-semibold text-fg-heading mb-4 max-w-2xl flex-shrink-0">
        Check in. Stay ahead.
      </h1>

      <p className="text-base md:text-lg text-fg-secondary mb-8 max-w-xl flex-shrink-0">
        A short, anonymous check-in for MUST students. No account needed.
      </p>

      <Link
        to="/check-in"
        className="px-8 py-4 btn-brand text-white text-lg font-medium rounded-full shadow-md transition-all hover:shadow-lg focus-ring mb-4 flex-shrink-0"
      >
        Start your check-in
      </Link>

      <Link
        to="/how-it-works"
        className="text-teal-700 dark:text-teal-300 font-medium hover:underline focus-ring rounded p-1 flex-shrink-0"
      >
        See how it works
      </Link>
    </div>
  );
}
