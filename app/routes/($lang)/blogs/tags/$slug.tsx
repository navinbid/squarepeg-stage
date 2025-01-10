import { useLoaderData } from '@remix-run/react';
import { LoaderArgs, defer } from '@shopify/remix-oxygen';
import React from 'react';
import bloglist1 from '~/assets/bloglist1.png';
import smalllogoicon from '~/assets/smalllogoicon.png';

export async function loader({ request, context, params }: LoaderArgs) {
  const slug = params.slug;

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');

  const Blogs = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/articles.json?tag=${slug}`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });

  const categorys = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/blogs.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });

  return defer({
    slug,
    Blogs,
    categorys,

    //  metafields
  });
}

const $slug: React.FC = () => {
  const { Blogs, slug, categorys } = useLoaderData<typeof loader>();
  const blogs = JSON.parse(Blogs).articles;
  const Categorys = JSON.parse(categorys).blogs;

  function findHandleById(givenId) {
    const blog = Categorys.find((blog) => blog.id == givenId);

    if (blog) {
      return blog.handle;
    } else {
      return null; // or any default value you prefer when the ID is not found
    }
  }
  return (
    <>
      <div className="bg-white">
        <div className="content-wrapper">
          {/* breadcrumb start */}
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
                    href="/blogs"
                    className="text-sm font-bold text-gray-700 hover:text-gray-900"
                  >
                    All Resources
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
                    href="/"
                    className="ml-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    aria-current="page"
                  >
                    Tag: {slug}
                  </a>
                </div>
              </li>
            </ol>
          </nav>
          {/* breadcrumb end */}
          <h1 className="font-extrabold text-4xl text-neutral-8 pt-5 pb-8">
            <span className="block uppercase text-xs pb-2.5">Tagged as</span>
            {slug}
          </h1>
        </div>
      </div>
      {/* blog body sec start */}
      <div className="bg-white pt-8 pb-4">
        <div className="content-wrapper !max-w-[1360px]">
          <div className="flex justify-start items-start flex-wrap">
            {/* loop part start */}
            {blogs.map((blog, key) => (
              <div className="sm:w-1/3 py-7 sm:px-3" key={key}>
                <div className="w-full mb-6">
                  <img
                    src={blog.image?.src || bloglist1}
                    className=" rounded-lg"
                    alt="bloglistpicture"
                  />
                </div>
                <p className="font-normal text-sm text-neutral-8 pb-2">
                  {blog.tags}{' '}
                  <span className="text-neutral-44 ml-1.5">4 min read</span>
                </p>
                <h3 className="font-bold text-lg text-neutral-8">
                  {blog.title}
                </h3>
                <a
                  href={"/blogs/" + findHandleById(blog.blog_id) + '/' + blog.handle}
                  className="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
                >
                  View Resource
                </a>
              </div>
            ))}
            {/* loop part end */}
          </div>
          {/* <div className="w-full text-center pt-7 pb-16">
            <button className="border-2 border-lightgreen rounded-3xl px-5 py-1.5 text-base text-green-30 font-semibold">
              Load More
            </button>
          </div> */}
          {/* discover more pge sec start */}
          <div className="bg-green-30 rounded-3xl p-20 mb-20 mt-6 discover">
            <div className="sm:w-[55%]">
              <img
                src={smalllogoicon}
                className=" rounded-lg"
                alt="bloglistpicture"
              />
              <h4 className="sm:text-4xl text-white sm:font-extrabold sm:py-6">
                Discover More From SquarePeg
              </h4>
              <p className="font-normal sm:text-lg text-white pb-2">
                Join our community to access more resources and the latest
                updates. Our mission is to provide you with the best solutions
                for your professional and personal projects.
              </p>
              <div className="inline-block justify-start items-center space-x-5">
                <a
                  href="/"
                  className="inline-block font-bold text-sm transition-colors text-white w-auto mt-2 underline hover:no-underline"
                >
                  About Us
                </a>
                <a
                  href="/"
                  className="inline-block font-bold text-sm transition-colors text-white w-auto mt-2 underline hover:no-underline"
                >
                  Our Resources
                </a>
              </div>
            </div>
          </div>
          {/* discover more pge sec end */}
        </div>
      </div>
      {/* blog body sec start */}
    </>
  );
};

export default $slug;
