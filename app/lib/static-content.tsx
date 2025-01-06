import {
  IconAccessibility,
  IconCommitment,
  IconHonesty,
  IconQuality,
  IconReorder,
  IconShipping,
  IconSupport,
} from '~/components';

const IconClasses = 'w-8 h-8 text-green-30';

export const VALUES = [
  {
    title: 'Honesty & Transparency',
    description:
      'We value customers as partners, not just buyers. You can trust our products and service for success.',
    icon: <IconHonesty className={IconClasses} />,
  },
  {
    title: 'Commitment',
    description:
      'We assist customers through the entire order process with a tailored solution for their projects.',
    icon: <IconCommitment className={IconClasses} />,
  },
  {
    title: 'Accessibility',
    description:
      'Everyone can create, build, and fix. Our user-friendly site and customer service support all.',
    icon: <IconAccessibility className={IconClasses} />,
  },
  {
    title: 'Quality',
    description:
      'We prioritize excellence in products and people, offering only top brands and friendly support with a smile.',
    icon: <IconQuality className={IconClasses} />,
  },
];

export const BENEFITS = [
  {
    title: 'Fast Delivery',
    description: 'Get your orders on your own timeline',
    icon: <IconShipping className={IconClasses} />,
  },
  {
    title: 'Easy Reorders & Returns',
    description: 'Enjoy a seamless checkout & simple returns',
    icon: <IconReorder className={IconClasses} />,
  },
  {
    title: 'Great Support',
    description: 'Friendly customer service, ready to help you',
    icon: <IconSupport className={IconClasses} />,
  },
];

export const BrandFilters = [
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export const ServicesOfInterest = [
  'Product Question',
  'Account Question',
  'Order Question',
  'Customer Support',
  'Other',
];

export const MethodsOfContact = ['Phone', 'Email'];

// Fallback Image this image is on Sanity
export const FallbackURL =
  'https://cdn.sanity.io/images/957wfnzb/production/c281a2d0b904f3b81254c64382970d170539a066-1248x1248.png';
