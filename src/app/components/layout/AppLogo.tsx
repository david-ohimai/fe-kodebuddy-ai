'use client';
import Link from 'next/link';
import Image from 'next/image';
import LogoWithTitle from '@/assets/images/logo-with-title.svg';
import Logo from '@/assets/images/logo.svg';

interface AppLogoProps {
  width?: number;
  height?: number;
  href?: string;
  withTitle?: boolean;
  className?: string;
}

const DEFAULT_SIZE = {
  full: { width: 209, height: 40 },
  mark: { width: 56, height: 49 },
};

const AppLogo = ({
  width,
  height,
  href = '/',
  withTitle = true,
  className,
}: AppLogoProps) => {
  const logoSrc = withTitle ? LogoWithTitle : Logo;
  const defaults = withTitle ? DEFAULT_SIZE.full : DEFAULT_SIZE.mark;

  return (
    <div className={className}>
      <Link href={href}>
        <Image
          src={logoSrc}
          alt="KodeBuddy Logo"
          width={width ?? defaults.width}
          height={height ?? defaults.height}
          className="block"
          priority
        />
      </Link>
    </div>
  );
};

export default AppLogo;
