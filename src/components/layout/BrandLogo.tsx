import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import logo from '../../assets/mindline-logo.jpeg';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  to?: string | null;
  className?: string;
};

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
};

export default function BrandLogo({ size = 'md', showWordmark = true, to = '/', className }: BrandLogoProps) {
  const mark = (
    <span className={cn('inline-flex items-center gap-2.5 min-w-0', className)}>
      <span
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white dark:ring-bg-secondary',
          sizes[size]
        )}
      >
        <img
          src={logo}
          alt=""
          className="h-full w-full object-contain scale-[1.12] object-center p-0.5"
        />
      </span>
      {showWordmark && (
        <span className="nav-wordmark text-xl leading-none tracking-tight">
          <span className="text-fg-heading">Mind</span>
          <span className="brand-text-gradient">Line</span>
        </span>
      )}
    </span>
  );

  if (!to) return mark;
  return (
    <Link to={to} className="focus-ring rounded-full inline-flex" aria-label="MindLine home">
      {mark}
    </Link>
  );
}
