import type {MediaEdge} from '@shopify/hydrogen/storefront-api-types';
import {ATTR_LOADING_EAGER} from '~/lib/const';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useRef, useState} from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import {
  IconArrowLeft,
  IconCaret,
  IconCloseModal,
  IconZoomIn,
  IconZoomOut,
} from './Icon';
import type {
  ProductVariant,
  Product as ProductType,
} from '@shopify/hydrogen/storefront-api-types';
import {FavoriteButton} from './FavoriteButton';
import {Container} from 'postcss';
import {useScrollStopListener} from '~/hooks/useScrollStop';
import {useRouteLoaderData} from '@remix-run/react';
import {FallbackURL} from '~/lib/static-content';
import clsx from 'clsx';
import {handle} from '~/root';

export function ImageZoom({src, alt}) {
  const sourceRef = useRef(null);
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  const [opacity, setOpacity] = useState(0);
  const [offset, setOffset] = useState({left: 0, top: 0});

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const handleMouseMove = (e) => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const sourceRect = sourceRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const xRatio = (targetRect.width - containerRect.width) / sourceRect.width;
    const yRatio =
      (targetRect.height - containerRect.height) / sourceRect.height;

    const left = Math.max(
      Math.min(e.pageX - sourceRect.left, sourceRect.width),
      0,
    );
    const top = Math.max(
      Math.min(e.pageY - sourceRect.top, sourceRect.height),
      0,
    );

    setOffset({
      left: left * -xRatio,
      top: top * -yRatio,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        zIndex: 0,
        maxWidth: 'initial',
        height: 'initial',
      }}
    >
      <img ref={sourceRef} src={src} alt={alt} />
      <img
        ref={targetRef}
        style={{
          position: 'absolute',
          opacity,
          top: `${offset.top}px`,
          left: `${offset.left}px`,
          zIndex: 50,
          maxWidth: 'initial',
          height: 'initial',
          backgroundColor: '#fff',
        }}
        src={src}
        alt={alt}
      />
    </div>
  );
}
/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
  product,
  disableZoom,
}: {
  media: MediaEdge['node'][];
  className?: string;
  product: ProductType & {selectedVariant?: ProductVariant};
  disableZoom?: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  // const slideContainerRef = useRef<HTMLDivElement>(null);

  const slideContainerRef = useScrollStopListener(() => {
    const element = document.getElementById('product-gallery-slider');
    const scrollLeft = element.scrollLeft;
    const clientWidth = element.clientWidth;
    const scrollWidth = element.scrollWidth;
    const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    const slideIndex = Math.round(
      (scrollPercentage / 100) * (media.length - 1),
    );
    setActiveSlide(slideIndex);
  });

  function scrollToSlide(index: number) {
    if (slideContainerRef.current) {
      slideContainerRef.current.scrollTo({
        left: slideContainerRef.current.clientWidth * index,
        behavior: 'smooth',
      });
    }
  }

  useEffect(() => {
    scrollToSlide(activeSlide);
  }, [activeSlide]);

  function nextImage() {
    if (activeImage < media.length - 1) {
      setActiveImage(activeImage + 1);
    } else {
      setActiveImage(0);
    }
  }

  function prevImage() {
    if (activeImage > 0) {
      setActiveImage(activeImage - 1);
    } else {
      setActiveImage(media.length - 1);
    }
  }
  const handleShowPopup = () => {
    console.log('clicked');
  };
  return (
    <div className={`${className}`}>
      <div className="h-full flex gap-8">
        <div className="hidden lg:grid gap-4 w-[80px] max-h-[642px] shrink-0 overflow-y-auto content-start">
          {media.length === 0 && (
            <button
              // disabled
              className="border-2 border-neutral-8 md:col-span-2 aspect-square snap-center bg-white dark:bg-contrast/10 rounded"
              onClick={handleShowPopup}
            >
              <img
                src={FallbackURL}
                alt="Fallback placeholder of product."
                className="w-[80px] h-[80px] aspect-square fadeIn object-cover"
              />
            </button>
          )}
          {media.map((med, i) => {
            let mediaProps: Record<string, any> = {};
            const isActiveImage = i === activeImage;
            const isFirst = i === 0;
            const isFourth = i === 3;
            const isFullWidth = i % 3 === 0;

            const data = {
              ...med,
              image: {
                // @ts-ignore
                ...med.image,
                altText: med.alt || 'Product image',
              },
            } as MediaImage;

            switch (med.mediaContentType) {
              case 'IMAGE':
                mediaProps = {
                  width: 800,
                  widths: [400, 800, 1200, 1600, 2000, 2400],
                };
                break;
              case 'VIDEO':
                mediaProps = {
                  width: '100%',
                  autoPlay: true,
                  controls: false,
                  muted: true,
                  loop: true,
                  preload: 'auto',
                };
                break;
              case 'EXTERNAL_VIDEO':
                mediaProps = {width: '100%'};
                break;
              case 'MODEL_3D':
                mediaProps = {
                  width: '100%',
                  interactionPromptThreshold: '0',
                  ar: true,
                  loading: ATTR_LOADING_EAGER,
                };
                break;
            }

            if (i === 0 && med.mediaContentType === 'IMAGE') {
              mediaProps.loading = ATTR_LOADING_EAGER;
            }

            return (
              <button
                className={clsx(
                  'md:col-span-2 w-[80px] h-[80px] aspect-square snap-center bg-white p-1 rounded',
                  isActiveImage && 'border-2 border-neutral-8',
                )}
                // @ts-ignore
                key={med.id || med.image.id}
                onClick={() => setActiveImage(i)}
              >
                {(med as MediaImage).image && (
                  <img
                    src={data.image!.url}
                    alt={data.image!.altText!}
                    className="w-[72px] h-[72px] aspect-square fadeIn"
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* active image */}
        <div className="hidden lg:flex flex-col w-full h-full overflow-hidden relative bg-white">
          <button
            // disabled={media.length === 0}
            className="flex items-center justify-center h-full"
            onClick={() => setLightboxOpen(true)}
          >
            {media[activeImage]?.mediaContentType === 'IMAGE' && (
              <>
                {disableZoom ? (
                  <img
                    // @ts-ignore
                    src={media[activeImage].image!.url}
                    alt={media[activeImage].alt || 'Product image'}
                  />
                ) : (
                  <ImageZoom
                    // @ts-ignore
                    src={media[activeImage].image!.url}
                    alt={media[activeImage].alt || 'Product image'}
                  />
                )}
              </>
            )}
            {media.length === 0 && (
              <img
                // @ts-ignore
                src={FallbackURL}
                alt="Fallback of product"
                className="w-full h-full aspect-square fadeIn object-cover"
              />
            )}
          </button>
          <div className="absolute top-4 right-4 z-20">
            <FavoriteButton product={product} />
          </div>
          {media.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 -translate-y-1/2 left-3 z-20 bg-white rounded-full h-8 w-8 flex justify-center items-center shadow-lg"
              >
                <span className="sr-only">Previous Image</span>
                <IconCaret direction="right" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 -translate-y-1/2 right-3 z-20 bg-white rounded-full h-8 w-8 flex justify-center items-center shadow-lg"
              >
                <span className="sr-only">Next Image</span>
                <IconCaret direction="left" />
              </button>
            </>
          )}
          {!disableZoom && (
            <div className="flex items-center gap-1">
              <IconZoomIn />
              Hover image to zoom
            </div>
          )}
        </div>
        {/* mobile image slider using snap scroll */}
        <div className="lg:hidden relative">
          <div className="absolute top-4 right-4 z-20">
            <FavoriteButton product={product} />
          </div>
          <div
            className="snap-x snap-mandatory overflow-x-auto flex no-scrollbar"
            ref={slideContainerRef}
            id="product-gallery-slider"
          >
            {media.length === 0 && (
              <img
                src={FallbackURL}
                alt="Fallback placeholder of product."
                className="snap-center aspect-square fadeIn object-cover"
              />
            )}
            {media.map((med, i) => {
              const data = {
                ...med,
                image: {
                  // @ts-ignore
                  ...med.image,
                  altText: med.alt || 'Product image',
                },
              } as MediaImage;

              return (
                <img
                  key={med.id}
                  src={data.image!.url}
                  alt={data.image!.altText!}
                  className="snap-center aspect-square fadeIn object-cover"
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-4 p-4 flex-wrap">
            {/* show grayed out dot for each slide */}
            {media.map((med, index) => (
              <button
                key={med.id}
                onClick={() => {
                  setActiveSlide(index);
                }}
                className={`w-2 h-2 rounded-full ${
                  activeSlide === index ? 'bg-brand' : 'bg-neutral-80'
                }`}
              />
            ))}
          </div>
        </div>
        <Lightbox
          carousel={{finite: true}}
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          controller={
            {
              // closeOnBackdropClick: true,
            }
          }
          thumbnails={{
            position: 'start',
          }}
          plugins={[Thumbnails, Zoom]}
          render={{
            iconClose: () => (
              <div className="p-[10px] rounded-full border border-[#160E1B] mt-3 mr-3">
                <IconCloseModal />
              </div>
            ),
            iconZoomIn: () => <IconZoomIn />,
            iconZoomOut: () => <IconZoomOut />,
            iconPrev: () =>
              media.length > 1 && (
                <div className="p-3 rounded-full bg-white">
                  <IconArrowLeft className="fill-neutral-8" />
                  <div className="sr-only">Previous Slide</div>
                </div>
              ),
            iconNext: () =>
              media.length > 1 && (
                <div className="p-3 rounded-full bg-white">
                  <IconArrowLeft className="rotate-180 fill-neutral-8" />
                  <div className="sr-only">Next Slide</div>
                </div>
              ),
          }}
          slides={media.map((media) => {
            const data = {
              ...media,
              image: {
                // @ts-ignore
                ...media.image,
                altText: media.alt || 'Product image',
              },
            } as MediaImage;
            return {
              src: data.image!.url,
              alt: data.image!.altText!,
            };
          })}
        />
      </div>
    </div>
  );
}
