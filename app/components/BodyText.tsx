import clsx from 'clsx';

export const BODY_TEXT_STYLES = {
  body: 'text-base md:text-[18px] leading-6 md:leading-7 mb-6',
  'body-2': 'text-base leading-6 mb-6',
  lead: 'text-[28px] md:text-4xl leading-9 md:leading-[44px] mb-8 md:mb-12',
  'quote-1': 'italic text-2xl md:text-[40px] leading-6 md:leading-[48px]',
  // 'quote-2': 'italic',
  'subtitle-1': 'text-base text-neutral-8',
  'subtitle-2': 'text-neutral-8 text-sm',
  'subtitle-3': 'text-neutral-8 text-xs',
  stat: 'font-semibold text-[40px] md:text-[56px] leading-[48px] md:leading-[64px]',
  'nav-1': 'font-base font-semibold leading-5',
  'nav-2': 'font-base leading-5',
  'title-1': 'text-[18px] font-semibold text-neutral-8',
  'title-2': 'font-semibold text-[16px]',
  'title-3': 'text-neutral-8 font-sm font-semibold leading-[16px]',
} as const;

export type BodyTextLevel = keyof typeof BODY_TEXT_STYLES;

export function BodyText({
  className,
  children,
  level = 'body',
  decoration,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  decoration?: 'underline' | 'italic';
  level?: keyof typeof BODY_TEXT_STYLES;
}) {
  const styles = clsx(BODY_TEXT_STYLES[level], decoration, className);

  return (
    <p className={styles} {...props}>
      {children}
    </p>
  );
}
