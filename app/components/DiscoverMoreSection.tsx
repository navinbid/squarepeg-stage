import {BodyText} from './BodyText';
import {Button} from './Button';
import {HeaderText} from './HeaderText';
import {
  IconDiscoverMorePattern,
  IconDiscoverMorePatternMobile,
  IconLogo,
} from './Icon';
import {Link} from './Link';

export default function DiscoverMoreSection({
  title,
  body,
  links,
}: {
  title: string;
  body?: string;
  links: {to: string; label: string}[];
}) {
  return (
    <div className="content-wrapper my-32">
      <div className="z-10 mt-32 mb-30 pb-[181px] bg-brand text-white py-12 px-5 lg:px-28 lg:py-24 lg:pb-[120px] rounded-3xl relative overflow-hidden">
        <IconLogo className="mb-8 h-10 w-10" />
        <h2 className="pr-[34px] text-[28px] lg:text-[36px] font-extrabold leading-9 lg:leading-10 mb-4 max-w-[640px]">
          {title}
        </h2>
        <p className="max-w-[640px] text-lg leading-7 mb-9">{body}</p>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link to={link.to} key={link.to}>
              {/* overides weren't working here for button tertiary */}
              <button className="font-extrabold inline-block border-b-2 leading-none pb-1 text-white border-[#8FA088] underline-offset-[3px] hover:border-primary-lime">
                {link.label}
              </button>
            </Link>
          ))}
        </div>
        <IconDiscoverMorePattern className="absolute hidden lg:block lg:right-28 lg:top-0 -z-10 lg:h-full" />
        <div className="flex gap-4 lg:hidden absolute bottom-12 -left-2 -z-10">
          <IconDiscoverMorePatternMobile />
          <IconDiscoverMorePatternMobile />
        </div>
      </div>
    </div>
  );
}
