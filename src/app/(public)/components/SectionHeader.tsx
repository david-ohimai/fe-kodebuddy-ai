import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import AppPill from '@/components/ui/AppPill';
import cogIcon from '@/assets/images/landing/badges/cog.svg';
import lampDeskIcon from '@/assets/images/landing/badges/lamp-desk.svg';
import libraryBigIcon from '@/assets/images/landing/badges/library-big.svg';

type BadgeIconName = 'cog' | 'lampDesk' | 'libraryBig';

interface SectionHeaderProps {
  badge: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  badgeIcon?: BadgeIconName;
  className?: string;
}

const BADGE_ICON_BY_LABEL: Record<string, BadgeIconName> = {
  'explore courses': 'libraryBig',
  'how it works': 'cog',
  'your learn space': 'lampDesk',
  'your learning space': 'cog',
  'part of the kodecamp ecosystem': 'cog',
};

const BADGE_ICON_SRC: Record<BadgeIconName, StaticImageData> = {
  cog: cogIcon,
  lampDesk: lampDeskIcon,
  libraryBig: libraryBigIcon,
};

function BadgeIcon({
  className,
  name,
}: {
  className?: string;
  name: BadgeIconName;
}) {
  return (
    <Image
      aria-hidden="true"
      alt=""
      className={className}
      height={18}
      src={BADGE_ICON_SRC[name]}
      width={18}
    />
  );
}

export default function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
  badgeIcon,
  className,
}: SectionHeaderProps) {
  const isCentered = align === 'center';
  const badgeIconName = badgeIcon ?? BADGE_ICON_BY_LABEL[badge.toLowerCase()];

  return (
    <div
      className={[isCentered ? 'mx-auto text-center' : 'text-left', className]
        .filter(Boolean)
        .join(' ')}
    >
      <AppPill
        label={badge}
        icon={badgeIconName ? <BadgeIcon name={badgeIconName} /> : undefined}
        color="primary"
        border
        size="small"
        shape="pill"
        sx={{
          backgroundColor: '#f4fbff',
          borderColor: '#99cef2',
          borderWidth: 2,
          boxShadow: 'none',
          color: 'var(--primary)',
          fontSize: 12,
          fontWeight: 700,
          height: 34,
          letterSpacing: 0,
          padding: '6px 12px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          '& .MuiChip-icon': {
            color: 'var(--primary)',
            height: 18,
            marginLeft: 0,
            marginRight: '-2px',
            width: 18,
          },
          '& .MuiChip-label': {
            paddingLeft: badgeIconName ? '8px' : '10px',
            paddingRight: '10px',
          },
        }}
      />
      <h2
        className={[
          'mt-4 text-[28px] font-bold leading-tight text-text sm:text-[40px]',
          isCentered ? 'mx-auto' : '',
          isCentered ? 'xl:whitespace-nowrap' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {title}
      </h2>
      {description && (
        <p
          className={[
            'b2-r mt-3 text-text-secondary',
            isCentered ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      )}
    </div>
  );
}
