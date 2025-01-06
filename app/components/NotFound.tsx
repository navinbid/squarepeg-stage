import {Link, TextLink} from './Link';
import {Heading, Text} from './Text';
import TopBoxImage from '~/assets/404-box.png';
import BottomBoxImage from '~/assets/404-3d-logo.png';
import {Button} from './Button';

export function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center bg-lime-90 h-full min-h-screen text-neutral-8">
      <img
        src={TopBoxImage}
        alt=""
        className="my-16 lg:my-[72px] h-[118px] w-[121px] lg:h-[172px] lg:w-[167px]"
      />
      <div className="mx-5 flex flex-col justify-center items-center max-w-3xl">
        <Text className="font-extrabold text-xs tracking-widest">
          404 ERROR
        </Text>
        <h2 className="mt-2 mb-4 text-center font-extrabold text-4xl lg:text-5xl leading-[44px] lg:leading-[56px]">
          Uh oh, looks like you tried to fit a square peg into a round hole!
        </h2>
        <Text>Try checking these links out instead:</Text>
        <div className="flex gap-4 mt-5 lg:mt-8 mb-5">
          <Link to="/">
            <Button variant="tertiary">Go To Home</Button>
          </Link>
          <Link to="/contact">
            <Button variant="tertiary">Contact Us</Button>
          </Link>
        </div>
      </div>

      <img src={BottomBoxImage} alt="" className="mt-auto" />
    </div>
  );
}
