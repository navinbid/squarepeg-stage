import {PageHeader, Section} from '~/components';
import {Breadcrumbs} from '~/components/Breadcrumbs';

export const handle = {
  seo: {
    title: 'Square Peg Accessibility Policy',
    description: 'View the SquarePeg website accessibility policy',
  },
};

export default function AccessibilityPolicy() {
  return (
    <>
      <div className="bg-neutral-98 pb-4">
        <div className="content-wrapper pt-6">
          <Breadcrumbs />
        </div>
        <PageHeader
          heading="Accessibility Policy"
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
      <h2 className="text-2xl leading-7 font-bold">Accessibility Policy</h2>
      <br />
      <p>
        <strong>Compliance status</strong>
      </p>
      <br />
      <p>
        We firmly believe that the internet should be available and accessible
        to anyone and are committed to providing a website that is accessible to
        the broadest possible audience, regardless of ability.
      </p>
      <br />
      <p>
        To fulfill this, we aim to adhere as strictly as possible to the World
        Wide Web Consortium&apos;s (W3C) Web Content Accessibility Guidelines
        2.1 (WCAG 2.1) at the AA level. These guidelines explain how to make web
        content accessible to people with a wide array of disabilities.
        Complying with those guidelines helps us ensure that the website is
        accessible to blind people, people with motor impairments, visual
        impairment, cognitive disabilities, and more.
      </p>
      <br />
      <p>
        This website utilizes various technologies that are meant to make it as
        accessible as possible at all times. We utilize an accessibility
        interface that allows persons with specific disabilities to adjust the
        website&apos;s UI (user interface) and design it to their personal
        needs.
      </p>
      <br />
      <p>
        Additionally, the website utilizes an Al-based application that runs in
        the background and optimizes its accessibility level constantly. This
        application remediates the website&apos;s HTML, adapts its functionality
        and behavior for screen-readers used by blind users, and for keyboard
        functions used by individuals with motor impairments.
      </p>
      <br />
      <p>
        If you wish to contact the website&apos;s owner, please use the
        following email:{' '}
        <a
          className="underline underline-offset-2"
          href="mailto:contact@squarepegsupply.com"
        >
          contact@squarepegsupply.com
        </a>
      </p>
      <br />
      <p>
        <strong>Screen-reader and keyboard navigation</strong>
      </p>
      <br />
      <p>
        Our website implements the ARIA attributes (Accessible Rich Internet
        Applications) technique, alongside various behavioral changes, to ensure
        blind users visiting with screen-readers can read, comprehend, and enjoy
        the website&apos;s functions. As soon as a user with a screen-reader
        enters your site, they immediately receive a prompt to enter the
        Screen-Reader Profile so they can browse and operate your site
        effectively. Here&apos;s how our website covers some of the most
        important screen-reader requirements:
      </p>
      <br />
      <p>
        <strong>1. Screen-reader optimization:</strong> we run a process that
        learns the website&apos;s components from top to bottom, to ensure
        ongoing compliance even when updating the website. In this process, we
        provide screen-readers with meaningful data using the ARIA set of
        attributes. For example, we provide accurate form labels; descriptions
        tor actionable icons (social media icons, search icons, cart icons,
        etc.); validation guidance for form inputs; element roles such as
        buttons, menus, modal dialogues (popups), and others.
      </p>
      <br />
      <p>
        Additionally, the background process scans al of the website&apos;s
        images. It provides an accurate and meaningful
        image-object-recognition-based description as an ALT (alternate text)
        tag for images that are not described. It will also extract texts
        embedded within the image using an OCR (optical character recognition)
        technology. lo turn on screen-reader adjustments at any time, users need
        only to press the Alt+1 keyboard combination. Screen- reader users also
        get automatic announcements to turn the Screen-reader mode on as soon as
        they enter the website.
      </p>
      <br />
      <p>
        These adjustments are compatible with popular screen readers such as
        JAWS, NDA, VoiceOver, and TalkBack.
      </p>
      <br />
      <p>
        <strong>2. Keyboard navigation optimization:</strong> The background
        process also adjusts the website&apos;s HTML and adds various behaviors
        using Javascript code to navigate the website using the tab and shift
        tab keys, operate dropdowns with the arrow keys, close them with Esc,
        trigger buttons and links using the Enter key, navigate between radio
        and checkbox elements using the arrow keys, and till them in with the
        Spacebar or Enter key.
      </p>
      <br />
      <p>
        Additionally, keyboard users will rind content-skip menus available at
        any time by clicking Alt+2, or as the first element of the site while
        navigating with the keyboard. The background process also handles
        triggered popups by moving the keyboard focus towards them as soon as
        they appear, not allowing the focus to drift outside.
      </p>
      <br />
      <p>
        Users can also use shortcuts such as &quot;M&quot; (menus),
        &quot;H&quot; (headings), &quot;F&quot; (forms), &quot;B&quot;
        (buttons), and &quot;G&quot; (graphics) to jump to specific elements.
      </p>
      <br />
      <p>
        <strong>Disability profiles supported on our website</strong>
      </p>
      <br />
      <ul className="list-disc list-outside ml-6">
        <li>
          <strong>Epilepsy Safe Profile:</strong> this profile enables people
          with epilepsy to safely use the website by eliminating the risk of
          seizures resulting from flashing or blinking animations and risky
          color combinations.
        </li>
        <li>
          <strong>Vision Impaired Profile:</strong> this profile adjusts the
          website so that it is accessible to the majority of visual impairments
          such as Degrading Eyesight, tunnel vision, cataract, Glaucoma, and
          others.
        </li>
        <li>
          <strong>Cognitive Disability Profile:</strong> this profile provides
          various assistive features to help users with cognitive disabilities
          such as Autism, Dyslexia, CVA, and others, to focus on the essential
          elements more easily.
        </li>
        <li>
          <strong>ADHD Friendly Profile:</strong> this profile significantly
          reduces distractions and noise to help people with ADHD, and
          Neurodevelopmental disorders browse, read, and focus on the essential
          elements more easily.
        </li>
        <li>
          <strong>Blind Users Profile (Screen-readers):</strong> this profile
          adjusts the website to be compatible with screen-readers such as JAWS,
          NVDA, VoiceOver, and Talkback. A screen reader is installed on the
          blind user’s computer, and this site is compatible with it.
        </li>
        <li>
          <strong>Keyboard Navigation Profile (Motor-Impaired):</strong> this
          profile enables motor-impaired persons to operate the website using
          the keyboard lab, Shift+Tab, and the Enter keys. Users can also use
          shortcuts such as &quot;M&quot; (menus), &quot;H&quot; (headings),
          &quot;F&quot; (forms), &quot;B&quot; (buttons), and &quot;G&quot;
          (graphics) to jump to specific elements.
        </li>
      </ul>
      <br />
      <p>
        <strong>Additional UI, design, and readability adjustments</strong>
      </p>
      <br />
      <ol className="list-decimal list-outside ml-6">
        <li>
          <strong>Font adjustments</strong> - users can increase and decrease
          its size, change its family (type), adjust the spacing, alignment,
          line height, and more.
        </li>
        <li>
          <strong>Color adjustments</strong> - users can select various color
          contrast profiles such as light, dark, inverted, and monochrome.
          Additionally, users can swap color schemes of titles, texts, and
          backgrounds with over seven different coloring options.
        </li>
        <li>
          <strong>Animations</strong> - epileptic users can stop all running
          animations with the click of a button. Animations controlled by the
          interface include videos, Gilts, and CSS flashing transitions.
        </li>
        <li>
          <strong>Content highlighting</strong> - users can choose to emphasize
          essential elements such as links and titles. They can also choose to
          highlight focused or hovered elements only.
        </li>
        <li>
          <strong>Audio muting</strong> - users with hearing devices may
          experience headaches or other issues due to automatic audio playing.
          This option lets users mute the entire website instantly.
        </li>
        <li>
          <strong>Cognitive disorders</strong> - we utilize a search engine
          linked to Wikipedia and Wiktionary, allowing people with cognitive
          disorders to decipher meanings of phrases, initials, slang, and
          others.
        </li>
        <li>
          <strong>Additional functions</strong> – We allow users to change
          cursor color and size, use a printing mode, enable a virtual keyboard,
          and many other functions.
        </li>
      </ol>
      <br />
      <p>
        <strong>Assistive technology and browser compatibility</strong>
      </p>
      <br />
      <p>
        We aim to support as many browsers and assistive technologies as
        possible, so our users can choose the best fitting tools for them, with
        as few limitations as possible. Therefore, we have worked very hard to
        be able to support all major systems that comprise over 95% of the user
        market share, including Google Chrome, Mozilla Firefox, Apple Satari,
        Opera and Microsoft Edge, JAWS, and NVDA (screen readers), both for
        Windows and MAC users.
      </p>
      <br />
      <p>
        <strong>Notes, comments, and feedback</strong>
      </p>
      <br />
      <p>
        Despite our very best efforts to allow anybody to adjust the website to
        their needs, there may still be pages or sections that are not fully
        accessible, are in the process of becoming accessible, or are lacking an
        adequate technological solution to make them accessible. Still, we are
        continually improving our accessibility, adding, updating, improving its
        options and features, and developing and adopting new technologies. All
        this is meant to reach the optimal level of accessibility following
        technological advancements. If you wish ton contact the website&apos;s
        owner, please use the following email:{' '}
        <a
          className="underline underline-offset-2"
          href="mailto:contact@squarepegsupply.com"
        >
          contact@squarepegsupply.com
        </a>
      </p>
      <br />
      <p>Revised 10/25/2023</p>
      <br />
    </div>
  );
}
