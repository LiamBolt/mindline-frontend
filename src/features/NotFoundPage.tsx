
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-semibold mb-4 text-fg-heading">404</h1>
      <p className="text-lg text-fg-secondary mb-8">We couldn't find the page you were looking for.</p>
      <Link to="/" className="px-6 py-2 bg-mint-700 hover:bg-mint-800 text-white font-medium rounded-full transition-colors focus-ring">
        Return Home
      </Link>
    </div>
  );
}
