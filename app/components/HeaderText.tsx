import clsx from 'clsx';

export const HEADER_LEVEL_STYLES = {
  display:
    'font-extrabold text-[40px] md:text-[64px] leading-[44px] md:leading-[72px] mb-[16px] md:mb-[24px]',
  // '1': 'font-extrabold text-4xl md:text-5xl leading-[36px] md:leading-[48px] mb-[16px] md:mb-[24px]',
  '1': 'font-extrabold text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] mb-[16px]',
  '2': 'font-extrabold text-[28px] md:text-4xl leading-[36px] md:leading-[44px] mb-[16px] md:mb-[24px]',
  '3': 'font-extrabold text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] mb-[16px]',
  '4': 'text-base md:text-[18px] leading-[24px] md:leading-[28px] mb-[8px]',
  '5': 'font-extrabold text-sm md:text-base leading-[20px] md:leading-[24px] mb-[8px]',
  '6': 'font-bold text-xs leading-[16px] mb-[8px]',
} as const;

const BASE_STYLES = '';

export type HeaderTextLevel = keyof typeof HEADER_LEVEL_STYLES | 'display';

export type HeaderTextProps = React.ComponentPropsWithoutRef<'h1'> & {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  level?: keyof typeof HEADER_LEVEL_STYLES | 'display';
  underline?: boolean;
  // [key: string]: any;
};

export function HeaderText({
  // as: Component = 'h2',
  className,
  children,
  level = '2',
  underline,
  ...props
}: HeaderTextProps) {
  const styles = clsx(
    BASE_STYLES,
    HEADER_LEVEL_STYLES[level] || '',
    underline && 'underline',
    className,
  );

  const Component: React.ElementType = level === 'display' ? 'h1' : `h${level}`;

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
}
