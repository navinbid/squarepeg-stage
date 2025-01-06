import {HeaderText} from './HeaderText';
import {BodyText} from './BodyText';
import {Button} from './Button';
import {Link} from './Link';
import {useEffect, useRef, useState} from 'react';
import {SanityHomepageSlideType} from '~/lib/sanity-types';
import {urlFor} from '~/lib/sanity';

export function ImageSlider({slides}: {slides: SanityHomepageSlideType[]}) {
  if (!slides) {
    throw new Error('No slides found in loader for component ImageSlider');
  }

  const [activeSlide, setActiveSlide] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoScroll) {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, autoScroll]);

  useEffect(() => {
    scrollToSlide(activeSlide);
  }, [activeSlide]);

  function scrollToSlide(index: number) {
    if (slideContainerRef.current) {
      slideContainerRef.current.scrollTo({
        left: slideContainerRef.current.clientWidth * index,
        behavior: 'smooth',
      });
    }
  }

  return (
    <div
      className="flex snap-x snap-mandatory lg:w-full overflow-x-auto rounded-3xl no-scrollbar relative"
      ref={slideContainerRef}
    >
      {slides?.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          className="flex flex-col lg:flex-row justify-between snap-center w-full lg:w-full shrink-0 bg-neutral-96"
        >
          <img
            src={urlFor(slide.image).url()}
            alt={slide.title}
            className="w-full"
          />
          <div className="flex flex-col items-center w-full px-5 pt-5 lg:pt-12 lg:px-6 xl:px-20 xl:pt-20 lg:pb-12 relative">
            <HeaderText level="2" className="text-center">
              {slide.title}
            </HeaderText>
            <BodyText className="text-center">{slide.description}</BodyText>
            <Link to={slide.linkUrl} className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto" variant="large">
                {slide.linkText}
              </Button>
            </Link>
            <div className="mt-6 mb-8 lg:my-0 lg:absolute z-10 flex items-center gap-2 lg:bottom-8 xl:bottom-12 lg:right-[50%] lg:translate-x-[50%]">
              {/* show grayed out dot for each slide */}
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  onClick={() => {
                    setActiveSlide(index);
                    setAutoScroll(false);
                  }}
                  className={`w-2 h-2 rounded-full ${
                    activeSlide === index ? 'bg-brand' : 'bg-neutral-80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
