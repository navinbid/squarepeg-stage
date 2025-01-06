import { LoaderArgs } from '@shopify/remix-oxygen'
import { defer } from '@shopify/remix-oxygen';
import { json } from 'express';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { Heading } from './Text';
import { PRODUCTS_QUERY } from '~/routes/($lang)/api/products';
import { ProductConnection } from '@shopify/hydrogen/storefront-api-types';
import { useLoaderData } from '@remix-run/react';
import { ProductCard } from './ProductCard';
import { Product } from 'schema-dts';

const RecentlyViewedProducts = ({ heading, count }: { count: number; heading: string; }) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        const value = localStorage.getItem('recently_viewed');
        setData(JSON.parse(value))
    }, []);


    console.log("Recent Product Data", data)

    return (
        <>
            {
                data &&

                <h2 className="whitespace-pre-wrap max-w-prose font-extrabold text-heading text-xl lg:text-heading pb-8">{heading}</h2>


            }
            <div className='grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 sm:grid-col-4 recentpro'>
                {
                    data?.slice(0, count).map((product) => (
                        <>
                            <ProductCard
                                product={product}
                                key={product.id}
                                quickAdd
                            />
                        </>
                    ))
                }
            </div>
        </>
    )
}

export default RecentlyViewedProducts