import {IconFacebook, IconInstagram, IconLinkedIn} from '~/components';

export const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/squarepegsupply/about/?viewAsMember=true',
    icon: IconLinkedIn,
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100091874960728',
    icon: IconFacebook,
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/shopsquarepeg/',
    icon: IconInstagram,
  },
] as const;
