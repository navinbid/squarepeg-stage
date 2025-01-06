import clsx from 'clsx';

export type LoadingSkeletonProps = {
  className?: string;
  height?: number | string;
  width?: number | string;
};

export const LoadingSkeleton = ({
  className,
  height = 20,
  width = 100,
}: LoadingSkeletonProps) => {
  return (
    <div
      className={clsx('animate-pulse bg-[#F3F3F3]', className)}
      style={{height, width}}
    />
  );
};

export const ProductCardSkeleton = ({count = 1}) => {
  return (
    <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({length: count}).map((_, index) => (
        <div key={index} className="bg-white rounded-sm space-y-4">
          <LoadingSkeleton className="rounded-xl" width="100%" height={250} />
          <LoadingSkeleton width="100%" height={72} />
          <LoadingSkeleton width="100%" height={30} />
        </div>
      ))}
    </div>
  );
};
