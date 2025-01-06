import {Link, TextLink} from './Link';
import {Heading} from './Text';

export function ShopMoreSection() {
  return (
    <div className="flex flex-col items-center text-center justify-center py-24 bg-[#EAEAEA]">
      <div className="max-w-2xl">
        <Heading as="h3">
          Shop More Supplies and Accessories from SquarePeg
        </Heading>
        <p className="max-w-2xl mt-6 mb-8">
          Join our community to access more resources and the latest updates.
          Our mission is to provide you with the best solutions for your
          professional and personal projects.
        </p>
      </div>
      <div className="flex space-x-4">
        <TextLink to="/collections/safety-and-security">
          Safety & Security
        </TextLink>
        <TextLink to="/collections/hardware">Hardware</TextLink>
      </div>
    </div>
  );
}
