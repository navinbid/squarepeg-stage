import {PageHeader, Section} from '~/components';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {CopyPageSection} from '~/components/CopyPageSection';

export const handle = {
  seo: {
    title: 'Privacy Policy | Square Peg',
    description: 'View the SquarePeg website privacy policy.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-neutral-98 pb-4">
        <div className="content-wrapper pt-6">
          <Breadcrumbs />
        </div>
        <PageHeader
          heading="Privacy & Security Policies"
          className="content-wrapper pt-18 text-[#2d4027]"
        />
      </div>
      <Section className="max-w-4xl mx-auto grid grid-cols-1 justify-items-center !my-8">
        <HtmlContent />
      </Section>
    </>
  );
}

function HtmlContent() {
  return (
    <div>
      <h2 className="text-2xl leading-7 font-bold">
        Information Collection & Use
      </h2>
      <br />
      <p>
        SquarePeg Supply (&quot;SquarePeg&quot;) is the sole owner of the
        information collected on our website and our mobile website,
        applications and other sites on which these policies are posted
        (collectively, the &quot;Website&quot;). SquarePeg collects information
        from our customers at several different points on our Website including
        the order and quote pages. This information includes general data on
        each Website visitor as well as specific personal identifiable and
        transactional information provided by Website visitors that purchase
        products from the Website. This information is used for the sole purpose
        of providing you the best possible service when requesting information
        or ordering products. We will not sell, share or rent this information
        to others.
      </p>
      <br />
      <p>
        When you place an order, we request contact and credit card information.
        This information is used strictly for billing purposes and to
        successfully complete and fill orders. If we have trouble processing an
        order, we will use the contact information to get in touch with you.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Security</h2>
      <br />
      <p>
        Our Website uses industry-standard encryption technology to provide for
        the security of your credit card numbers. In addition, we have put in
        place reasonable procedural and technical standards to protect the
        security of our Website and information we maintain. However, we cannot
        guarantee that any electronic commerce is totally secure. We encourage
        you to take affirmative steps to protect yourself online, including
        ensuring that any online account information you have remains secure.
        Please call us at{' '}
        <a className="underline underline-offset-2" href="tel:+18554558446">
          (855) 455-8446
        </a>{' '}
        or email us at{' '}
        <a
          className="underline underline-offset-2"
          href="mailto:contact@squarepegsupply.com"
        >
          contact@squarepegsupply.com
        </a>
        . If you would like more information regarding our security precautions.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Tracking Tools</h2>
      <br />
      <p>
        Our website uses common tracking tools such as cookies, web beacons,
        pixel tags and similar technologies to collect personal information. The
        use of these tools allows us to provide you with an enhanced shopping
        experience. It may be possible for you to turn off one or more of these
        tools in your Web browser. If you do this, you can still browse our
        website, but we will not be able to provide you with a more personalized
        shopping experience or accept online orders from you. Please call us at{' '}
        <a className="underline underline-offset-2" href="tel:+18554558446">
          (855) 455-8446
        </a>{' '}
        if you would like more information.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Your Choices</h2>
      <br />
      <p>
        Recipients of our e-mail marketing messages can unsubscribe from
        receiving promotional e-mail by using the unsubscribe instructions
        located at the bottom of the message.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">
        Links and Third-Party Collection
      </h2>
      <br />
      <p>
        The Website contains links to other sites that are not owned,
        maintained, operated, or endorsed by or for SquarePeg and not subject to
        the same privacy and other policies. The inclusion of any link to such
        sites does not imply any recommendation or sponsorship of such sites.
        You should read the other site’s privacy policies to understand how
        personal information collected about you is used and protected. The
        Website also contains third party technologies that collect
        non-personally identifiable information from you. This includes third
        party social sharing buttons. These third parties might use passive
        tracking techniques such as cookies or web beacons to collect your
        information. SquarePeg does not control these third parties. To learn
        more about their activities, please visit their websites and privacy
        policies.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Non-US Users</h2>
      <br />
      <p>
        The Website is operated in the United States. If you are located outside
        of the United States, please be aware that any information you provide
        to us will be transferred to the United States and by using the
        Website/giving your information, you consent to such transfer, and
        understand that the U.S. may not provide the same level of protections
        as the laws of your country.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Policy Updates</h2>
      <br />
      <p>
        From time to time, we may change our privacy policies because of changes
        in the relevant and applicable legal or regulatory requirements, changes
        in our business or business practices, or in our attempts to better
        serve our customers. Notice of any material changes in the manner in
        which we handle personally identifiable information under this policy
        will be provided on the Website. Please check the Website periodically
        for updates. Policy updates shall be effective the date the change is
        posted on the Website. By continuing to use the Website after we post
        any changes, you agree to the terms of the updated policy.
      </p>
      <br />
      <p>
        If you have any questions about our privacy and security policies,
        please contact us by phone at{' '}
        <a className="underline underline-offset-2" href="tel:+18554558446">
          (855) 455-8446
        </a>{' '}
        or email us at{' '}
        <a
          className="underline underline-offset-2"
          href="mailto:contact@squarepegsupply.com"
        >
          contact@squarepegsupply.com
        </a>
        . Thank you for choosing SquarePeg.
      </p>
      <br />
      <p>REVISED: November 1, 2023</p>
      <br />
    </div>
  );
}

// <br />
// <h2 className="text-2xl leading-7 font-bold">Returns</h2>
// <br />
// <p>
//   At Square Peg, we stand behind what we deliver to you. If there is an
//   issue with your shipment, we offer free returns. Please note there is a
//   return label in the package for your convenience.All returns must be in
//   new/unused condition and received within 30 days of purchase. Buyer may
//   be responsible for all freight charges. Credit will not be granted after
//   60 days of receipt. Refunds will be made to the original payment method
//   for the order.
// </p>
// <br />
