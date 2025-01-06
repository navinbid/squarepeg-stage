import {IconExternalLink} from './Icon';
import {Link} from './Link';

export function FooterLink({link, ...props}) {
  const isExternal = link._type === 'linkExternal';
  const linkProps = isExternal
    ? {target: '_blank', rel: 'noopener noreferrer'}
    : {};
  return (
    <Link
      className="font-semibold flex gap-1 items-center text-neutral-8"
      key={link.to}
      to={link.to}
      {...props}
      {...linkProps}
    >
      {link.title}
      {isExternal && <IconExternalLink color="#160E1B" />}
    </Link>
  );
}
