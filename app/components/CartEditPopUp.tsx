import {
    Form,
    useFetcher,
    useSearchParams,
    useTransition,
} from '@remix-run/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Listbox, RadioGroup } from '@headlessui/react';

import { OkendoStarRating } from '@okendo/shopify-hydrogen';
import { CartForm, Money, ShopifyAnalyticsProduct, useMoney } from '@shopify/hydrogen';
import {
    ProductGallery,
    Section,
    Text,
    Link,
    AddToCartButton,
    Button,
    Input,
    IconMinus,
    IconPlus,
    IconStockIndicator,
    IconWarning,
    IconClose,
    Heading,
    IconCheck,
} from '~/components';
import type {
    ProductVariant,
    Product as ProductType,
} from '@shopify/hydrogen/storefront-api-types';

import { HeaderText } from '~/components/HeaderText';
import { BodyText } from '~/components/BodyText';
import { parseMetafields } from '~/lib/metafields';
import { ProductQuantitySection } from '~/components/ProductCard';
import {
    DiscountDetails,
    quantityButtonStyles,
} from '~/routes/($lang)/productdetails/$productHandle';
import OutOfStockModal from './OutOfStockModal';
import loader_image from "../assets/load.gif"

export default function QuickViewModal({ handle, lineID, merchandiseVariant, isOpen, setIsOpen }) {

    const { load, data } = useFetcher();

    useEffect(() => {
        load(`/productdetails/${handle}`);
    }, [load, handle]);

    const category = data?.sanityProduct?.subcollection?.parentCollection?.slug?.current || 'product';

    let cartVariantColor = merchandiseVariant?.selectedOptions?.filter((item) => item?.name == 'Color')
    let cartVariantSize = merchandiseVariant?.selectedOptions?.filter((item) => item?.name == 'Size')

    // Initialize defaultVariant with an initial value, or null if data is initially undefined
    let [defaultVariant, setDefaultVariant] = useState(null);
    let [selectedColor, setSelectedColor] = useState(null);
    let [variantColors, setVariantColors] = useState([]);
    let [selectedSize, setSelectedSize] = useState(null);
    let [variantSizes, setVariantSizes] = useState([]);

    console.log("Quick view data cartVariant color", selectedColor)
    // console.log("Quick view data cartVariant size", cartVariantSize)

    // List box referance
    const closeRef = useRef<HTMLButtonElement>(null);

    // Update defaultVariant when data changes
    useEffect(() => {

        data?.filteredVariants.map((variant, key) => {
            if (merchandiseVariant.id == variant.id) {

                setDefaultVariant(variant)
            }
        })

    }, [data]);

    // Manufactioring part number filtering
    const parsedMetafields = parseMetafields(data?.product?.metafields);
    const manufacturerPartNumber = parsedMetafields?.manufacturerPartNumber;

    if (defaultVariant) {
        // Price Destructuring
        var [priceDollars, priceCents] = defaultVariant?.price?.amount.split(".");
    }

    useEffect(() => {
        if (data) {

            // Color filteration of variants
            var colorOptions = [];
            // Size filteration of variants
            var sizeOptions = [];

            data?.filteredVariants.forEach((option) => {
                option?.selectedOptions.filter((option) => option?.name === "Color").forEach((option) => {
                    colorOptions.push(option.value || null);
                });
            });

            data?.filteredVariants.map((option) => {
                option?.selectedOptions.filter((option) => option?.name == "Size").map((option) => {
                    sizeOptions.push(option.value || null)
                });
            })

            // Filter duplicate values
            let variantColors = colorOptions.filter((el, index) => colorOptions.indexOf(el) === index);
            // Filter duplicate values
            let variantSizes = sizeOptions.filter((el, index) => sizeOptions.indexOf(el) === index)

            // Set selectedColor with variantColors
            setSelectedColor(cartVariantColor[0]?.value);

            // Set selectedColor with variantSize
            setSelectedSize(cartVariantSize[0]?.value);

            // Set all colors
            setVariantColors(variantColors)

            // Set all sizes
            setVariantSizes(variantSizes)
        }
    }, [data]);

    // Setting the selected variant
    async function variantSelectColor(color) {
        setSelectedColor(color)
        let v = await data?.filteredVariants.filter((variant) => variant?.selectedOptions[1]?.value === color && variant?.selectedOptions[2]?.value === selectedSize)
        setDefaultVariant(v[0])
    }

    async function variantSelectSize(size) {
        setSelectedSize(size)
        let v = await data?.filteredVariants.filter((variant) => variant?.selectedOptions[1]?.value === selectedColor && variant?.selectedOptions[2]?.value === size)
        setDefaultVariant(v[0])
    }

    // Product quantity settings
    const minimumQuantity = Number(parsedMetafields?.minimumQuantity) || 1;
    const quantityInterval = Number(parsedMetafields?.quantityInterval) || 1;

    const [itemQuantity, setItemQuantity] = useState<number | any>(
        Number(minimumQuantity) || 1,
    );

    const handleQuantityChange = (e: any) => {
        const { name } = e.target;
        let newQuantity = itemQuantity;
        if (name === 'increment') {
            newQuantity = itemQuantity + quantityInterval;
        } else if (name === 'decrement') {
            newQuantity = itemQuantity - quantityInterval;
        }

        setItemQuantity(
            Math.min(Math.max(minimumQuantity, newQuantity), defaultVariant.quantityAvailable),
        );
    };

    // Out of stock indication
    const isOutOfStock = !defaultVariant?.availableForSale || minimumQuantity > defaultVariant?.quantityAvailable;

    const removeref = useRef(null);

    const lineIds = lineID

    function removeItem() {

        if (selectedColor !== undefined && selectedSize !== undefined) {

            setTimeout(() => {
                removeref.current.click()
            }, 3000);
        }

    }

    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className='fixed inset-0 w-screen overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center px-4 md:p-16'>
                    <Dialog.Panel className="mx-auto rounded bg-white relative p-10 max-w-[1088px]">

                        {/* Modal close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="z-10 w-8 h-8 rounded-full border border-neutral-8 absolute top-7 right-7 flex justify-center items-center"
                        >
                            <IconClose />
                        </button>
                        {/* Modal close button */}

                        {/* Preloader start */}
                        {
                            data == undefined &&
                            <div className="grid p-8 pre-loader">
                                <img src={loader_image} alt="Pre-loader" />
                            </div>
                        }
                        {/* Preloader end */}

                        {
                            data &&
                            <div className='grid items-start md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3'>
                                <ProductGallery
                                    // @ts-ignore
                                    media={data?.product?.media.nodes}
                                    className="w-full lg:col-span-2 h-full"
                                    product={
                                        data?.product as ProductType & { selectedVariant?: ProductVariant }
                                    }
                                    // selectedVariant={defaultVariant}
                                    disableZoom={true}
                                />
                                <div className='sticky md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll'>
                                    <section className='flex flex-col w-full max-w-xl gap-3 md:max-w-sm'>
                                        <div className="grid gap-3">
                                            {data?.sanityProduct?.vendor && (
                                                <div className="-mb-1">
                                                    <Link
                                                        to={`/search?vendor=${data?.sanityProduct?.vendor}`}
                                                        className="font-extrabold leading-6 text-brand"
                                                    >
                                                        {data?.sanityProduct?.vendor}
                                                    </Link>
                                                </div>
                                            )}
                                            <HeaderText level="3" className="font-extrabold !mb-0">
                                                {data?.sanityProduct?.title}
                                            </HeaderText>
                                            <div className="flex divide-x divide-neutral-72 gap-2">
                                                <BodyText level="subtitle-2">
                                                    Part #{defaultVariant?.sku}
                                                </BodyText>
                                                {Boolean(manufacturerPartNumber) && (
                                                    <BodyText level="subtitle-2" className="pl-2">
                                                        MFG #{manufacturerPartNumber}
                                                    </BodyText>
                                                )}
                                            </div>
                                            {data?.product?.okendoReviewsSnippet &&
                                                data?.product?.okendoStarRatingSnippet ? (
                                                <OkendoStarRating
                                                    productId={data?.product.id}
                                                    // @ts-ignore
                                                    okendoStarRatingSnippet={
                                                        data?.product.okendoStarRatingSnippet
                                                    }
                                                />
                                            ) : (
                                                <Text color="subtle">No reviews</Text>
                                            )}
                                        </div>
                                        <div className='grid gap-10'>
                                            <div className='grid gap-3'>
                                                <div className='flex gap-2'>
                                                    {/* Variant Price */}
                                                    <div className='flex'>
                                                        <h2 className='font-extrabold text-[28px] md:text-4xl leading-[36px] md:leading-[44px] mb-[16px] md:mb-[24px] !mb-0'>${priceDollars}</h2>
                                                        <h5 className='font-extrabold text-sm md:text-base leading-[20px] md:leading-[24px] mb-[8px] !mb-0 pt-[3.5px]'>.{priceCents}</h5>
                                                    </div>
                                                    {/* Variant Price */}
                                                    {/* Price per unit start */}
                                                    {
                                                        parsedMetafields?.unit_of_measure
                                                            ?
                                                            <p className='ml-2.5 text-lg text-black/75 font-bold !h-auto'>{parsedMetafields?.unit_of_measure}</p>
                                                            :
                                                            <p className='ml-2.5 text-lg text-black/75 font-bold'>each</p>
                                                    }
                                                    {/* Price per unit end */}
                                                </div>

                                                {/* Variant Options */}
                                                <div className='flex flex-col flex-wrap mb-2 gap-y-2 last:mb-0'>
                                                    {defaultVariant && !isOutOfStock && (
                                                        <div className='grid items-stretch gap-4'>
                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    name="decrement"
                                                                    className={quantityButtonStyles}
                                                                    onClick={handleQuantityChange}
                                                                    disabled={itemQuantity === 1 || itemQuantity === minimumQuantity}
                                                                >
                                                                    <IconMinus className="pointer-events-none" />
                                                                    <div className="sr-only">Decrease Quantity</div>
                                                                </button>
                                                                <Input
                                                                    value={parseInt(itemQuantity)}
                                                                    min={1}
                                                                    max={defaultVariant.quantityAvailable}
                                                                    className="max-w-[60px] text-center"
                                                                />
                                                                <button
                                                                    name="increment"
                                                                    className={quantityButtonStyles}
                                                                    onClick={handleQuantityChange}
                                                                    disabled={itemQuantity === defaultVariant.quantityAvailable}
                                                                >
                                                                    <IconPlus className="pointer-events-none !hover:text-red-500" />
                                                                    <div className="sr-only">Increase Quantity</div>
                                                                </button>
                                                            </div>
                                                            <ProductQuantitySection
                                                                minimumQuantity={parsedMetafields?.minimumQuantity}
                                                                quantityInterval={parsedMetafields?.quantityInterval}
                                                            />
                                                            <div className="hidden">
                                                                <CartForm
                                                                    route="/cart"
                                                                    action={CartForm.ACTIONS.LinesRemove}
                                                                    inputs={{
                                                                        lineIds,
                                                                    }}
                                                                >
                                                                    <button type="submit" ref={removeref}>
                                                                        Delete
                                                                    </button>
                                                                </CartForm>
                                                            </div>
                                                            {!isOutOfStock && (
                                                                <AddToCartButton
                                                                    lines={[
                                                                        {
                                                                            merchandiseId: defaultVariant?.id,
                                                                            quantity: parseInt(itemQuantity),
                                                                        },
                                                                    ]}
                                                                    product={{
                                                                        title: data?.product?.title,
                                                                        handle: data?.product?.handle,
                                                                    }}
                                                                    variant={isOutOfStock ? 'secondary' : 'primary'}
                                                                    data-test="add-to-cart"
                                                                    onClick={() => removeItem()}
                                                                >
                                                                    {!isOutOfStock && (
                                                                        <Text
                                                                            as="span"
                                                                            className="flex items-center justify-center gap-2 font-extrabold"
                                                                        >
                                                                            Update
                                                                        </Text>
                                                                    )}
                                                                </AddToCartButton>
                                                            )}
                                                            <Link to={`/${category}/${data?.product?.handle}`}>
                                                                <Button variant="secondary" className="w-full">
                                                                    View Full Details
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                    {defaultVariant && isOutOfStock && (
                                                        <OutOfStockModal product={data?.product} variant={defaultVariant?.id} />
                                                    )}
                                                    <div className='flex items-center gap-1'>
                                                        <IconStockIndicator
                                                            className={isOutOfStock ? 'text-error' : 'text-success'}
                                                        />
                                                        <BodyText level="subtitle-2">
                                                            {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                                                        </BodyText>
                                                    </div>
                                                    {/* free shipping section */}
                                                    <BodyText level="subtitle-2">
                                                        <Link className="underline" to="/pages/shipping-returns">
                                                            See Shipping Details
                                                        </Link>
                                                    </BodyText>
                                                </div>
                                                {/* Variant Options */}

                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        }

                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}