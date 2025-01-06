import { PageHeader, Section } from '~/components';
import { Breadcrumbs } from '~/components/Breadcrumbs';

export const handle = {
  seo: {
    title: 'Shipping & Return Policy | Square Peg',
    descriptions: "View SquarePeg's shipping and returns policy.",
  },
};

export default function ShippingReturns() {
  return (
    <>
      <div className="bg-neutral-98 pb-4">
        <div className="content-wrapper pt-6">
          {/* <Breadcrumbs /> */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 py-6">
              <li>
                <div className="flex items-center">
                  <a
                    href="/"
                    className="text-sm font-bold text-gray-700 hover:text-gray-900"
                  >
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <a
                    href={"#"}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    Shipping and Returns Policy
                  </a>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <PageHeader
          heading="Shipping and Returns Policy"
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
      <h2 className="text-2xl leading-7 font-bold">Shipping</h2>
      <br />
      <p>
        We are pleased to offer free shipping (*exceptions may apply) on orders
        over $99! For orders under $99, the flat rate is $15 per order. For
        two-day shipping, our rate starts at $45. Please contact us if you wish
        to explore rates for other services. Once your order has shipped, you
        will receive an email with the FedEx tracking number(s) of your
        package(s).
      </p>
      <br />
      *Exceptions:
      <ol className="list-decimal list-inside">
        <li>
          Free shipping does not apply to orders which must be sent via LTL
          freight. These orders will have an additional shipping charge.
        </li>
        <li>Non-stock orders may have an additional surcharge.</li>
        <li>
          Orders shipping to the following states will have a shipping surcharge
          (subject to change without notice): Hawaii, Alaska, New York, Maine,
          Connecticut, Pennsylvania, California, Massachusetts, Washington, and
          Oregon.
        </li>
      </ol>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Returns</h2>
      <br />
      <p>
        At SquarePeg, we stand behind what we deliver to you. If there is an
        issue with your shipment, we offer free returns. Please note there is a
        return label in the package for your convenience. All returns must be in
        new/unused condition and received within 30 days of purchase. Buyer may
        be responsible for all freight charges. Credit will not be granted after
        60 days of receipt. Refunds will be made to the original payment method
        for the order.
      </p>
      <br />
      <p>
        Sourced or custom orders are final sale and we do not accept
        cancellations, returns, refunds, or credits. Non-stock items will be
        subject to prior authorization for return.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Return Details</h2>
      <br />
      <ol className="list-decimal list-inside">
        <li>
          Re-pack the item(s) to be returned AND the packing list in the original box (if available).
        </li>
        <li>
          Place your FedEx prepaid return label (provided in your package) on the outside of the box.  If you cannot locate your prepaid label, please email contact@squarepegsupply.com, call 855-455-8446, or chat with us via our website.
        </li>
      </ol>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Drop Off Details</h2>
      <br />
      <p>
        You may drop the package at any FedEx Ship Center or participating Walgreens Pharmacy: <a className="underline underline-offset-2" href="https://www.fedex.com/en-us/shipping/onsite/walgreens-package-pickup.html" target='_blank'>www.fedex.com/en-us/shipping/onsite/walgreens-package-pickup.html</a>
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Cancellations</h2>
      <br />
      <p>
        Cancellations may be made prior to shipping. To cancel, please contact
        us using the Contact Us page, call customer support at{' '}
        <a className="underline underline-offset-2" href="tel:+18554558446">
          (855) 455-8446
        </a>
        , or use the website chat option. Any cancellations requested after the
        item has shipped will be declined and the order will be subject to the
        returns policy. Sourced or custom orders are final sale and we do not
        accept cancellations, returns, refunds, or credits. Non-stock items will
        be subject to prior authorization for return.
      </p>
      <br />
      <h2 className="text-2xl leading-7 font-bold">Warranties</h2>
      <br />
      <p>Warranties are not provided by SquarePeg.</p>
      <br />
      <p>
        For more information, please review the{' '}
        <a className="underline underline-offset-2" href="/terms-conditions">
          Terms and Conditions
        </a>
      </p>
      <br />
      <p>Revised 3/8/24</p>
    </div>
  );
}
