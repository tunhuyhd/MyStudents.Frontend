import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  iconOnly?: boolean;
}

/** Shared brand lockup; the standalone mark stays legible in compact navigation. */
export function BrandLogo({ className = '', size = 'md', theme = 'light', iconOnly = false }: BrandLogoProps) {
  const dimensions = { sm: 32, md: 40, lg: 64 };
  const dimension = dimensions[size];
  return (
    <span role="img" aria-label="My Student" className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/my-student-mark.svg"
        width={dimension}
        height={dimension}
        alt=""
        className={`shrink-0 object-contain ${theme === 'dark' ? 'rounded-xl bg-white p-1.5' : ''}`}
        style={{ width: dimension, height: dimension }}
        unoptimized
      />
      {!iconOnly && (
        <span className={`whitespace-nowrap font-extrabold tracking-[-0.03em] ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'} ${theme === 'dark' ? 'text-white' : 'text-surface-800'}`}>
          My Student
        </span>
      )}
    </span>
  );
}
