import {
  Product,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard} from './ProductCard';
import {Grid} from './Grid';

export function ProductSlider({
  products,
  title,
}: {
  products: ProductConnection['nodes'];
  title?: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-4xl mb-12">{title}</h3>
      <Grid layout="products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </Grid>
    </div>
  );
}
