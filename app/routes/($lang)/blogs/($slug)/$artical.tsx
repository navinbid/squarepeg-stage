import React from 'react';
import bloglist1 from '~/assets/bloglist1.png';
import smalllogoicon from '~/assets/smalllogoicon.png';
import articlebannerpic from '~/assets/articlebannerpic.png';
import { LoaderArgs, defer } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request, context, params }: LoaderArgs) {
  const slug = params.slug;
  const artical = params.artical;

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');

  const Blog = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/articles.json?handle=${artical}`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });

  const category = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/blogs.json?handle=${slug}`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });
  const cid = JSON.parse(category).blogs[0]?.id || '';
  const Blogs = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/articles.json?blog_id=${cid}`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });
  const url = request.url;

  return defer({
    slug,
    artical,
    Blog,
    Blogs,
    url
    //  metafields
  });
}

function $artical() {
  const { artical, slug, Blog, Blogs, url } = useLoaderData<typeof loader>();
  const blog = JSON.parse(Blog).articles;
  const blogs = JSON.parse(Blogs).articles;

  const tags = blog[0]?.tags.split(',');

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
                    href={"/blogs/"}
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
                    href={'/blogs/tags/' + blog[0].tags}
                    className="text-sm font-bold text-gray-700 hover:text-gray-900"
                  >
                    Tag:{blog[0].tags}
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
                    Post
                  </a>
                </div>
              </li>
            </ol>
          </nav>
          {/* breadcrumb end */}
          {/* blog post header sec start */}
          <div className=" text-center sm:w-[860px] mt-10 m-auto">
            <p className="font-semibold text-sm text-neutral-8 pb-2">
              {slug}
              <span className="text-neutral-44 font-normal ml-1.5">
                4 min read
              </span>
            </p>
            <h1 className="font-extrabold sm:text-5xl text-neutral-8 pt-5 pb-8 sm:leading-tight">
              {blog[0].title}
            </h1>
            <p className="font-normal text-sm text-neutral-44 pb-2">
              SquarePeg
              <span className="text-neutral-44 font-normal mx-1.5">|</span>
              {new Date(blog[0].created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {/* blog post header sec end */}
          {/* article banner sec start */}
          <div className="sm:py-12">
            <img src={blog[0].image?.src || articlebannerpic} className="" alt="bloglistpicture" />
          </div>
          {/* article banner sec end */}
          {/* article contant sec start */}
          <div className="sm:w-2/3 m-auto">
            {/* <p className="font-normal text-lg text-neutral-8 pb-2">
              {blog[0].summary_html}
            </p> */}
            <div className="pt-10 pb-6">
              {blog[0] && (
                <div className='bloggap-para' dangerouslySetInnerHTML={{ __html: blog[0]?.body_html }} />
              )}
            </div>
            <div className="sm:flex sm:justify-between sm:items-center pt-10 pb-24">
              <div>
                <span className="block uppercase font-extrabold text-xs pb-2.5">
                  Tags
                </span>
                <ul className="space-x-6 text-base font-normal text-neutral-44 flex justify-start items-center">
                  {tags.map((tag) => (
                    <a href={"/blogs/tags/" + tag}>
                      <p>{tag}</p>
                    </a>
                  ))}
                </ul>
              </div>
              <div>
                <span className="block uppercase font-extrabold text-xs pb-2.5">
                  Share
                </span>
                <ul className="space-x-3 text-base font-normal text-neutral-44 flex justify-start items-center">
                  <li className="cursor-pointer">
                    <a href={"https://www.facebook.com/sharer/sharer.php?u=" + url} target='_blank'>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="47"
                          height="47"
                          rx="23.5"
                          stroke="#160E1B"
                        />
                        <path
                          d="M34 24.0611C34 18.5045 29.5229 14 24 14C18.4771 14 14 18.5045 14 24.0611C14 29.0828 17.6568 33.2452 22.4375 34V26.9694H19.8984V24.0611H22.4375V21.8445C22.4375 19.323 23.9305 17.9301 26.2146 17.9301C27.3084 17.9301 28.4531 18.1266 28.4531 18.1266V20.6026H27.1922C25.95 20.6026 25.5625 21.3782 25.5625 22.1747V24.0611H28.3359L27.8926 26.9694H25.5625V34C30.3432 33.2452 34 29.0828 34 24.0611Z"
                          fill="#160E1B"
                        />
                      </svg>
                    </a>
                  </li>
                  <li className="cursor-pointer">
                    <a href={"https://www.instagram.com/direct"} target='blank'>
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="#160E1B" />
                        <path d="M33.4 20.1C33.4 19.1 33.2 18.4 33 17.8C32.8 17.2 32.4 16.6 31.9 16.1C31.4 15.6 30.8 15.2 30.2 15C29.6 14.8 28.9 14.6 27.9 14.6C26.9 14.5 26.6 14.5 24 14.5C21.4 14.5 21.1 14.5 20.1 14.6C19.1 14.6 18.4 14.8 17.8 15C17.2 15.2 16.6 15.6 16.1 16.1C15.6 16.6 15.2 17.2 15 17.8C14.8 18.4 14.6 19.1 14.6 20.1C14.5 21.1 14.5 21.4 14.5 24C14.5 26.6 14.5 26.9 14.6 27.9C14.6 28.9 14.8 29.6 15 30.2C15.2 30.8 15.6 31.4 16.1 31.9C16.6 32.4 17.2 32.8 17.8 33C18.4 33.2 19.1 33.4 20.1 33.4C21.1 33.4 21.4 33.5 24 33.5C26.6 33.5 26.9 33.5 27.9 33.4C28.9 33.4 29.6 33.2 30.2 33C30.8 32.8 31.4 32.4 31.9 31.9C32.4 31.4 32.8 30.8 33 30.2C33.2 29.6 33.4 28.9 33.4 27.9C33.4 26.9 33.5 26.6 33.5 24C33.5 21.4 33.5 21.1 33.4 20.1ZM31.7 27.8C31.7 28.7 31.5 29.2 31.4 29.6C31.2 30 31 30.4 30.7 30.7C30.4 31 30.1 31.2 29.6 31.4C29.3 31.5 28.8 31.7 27.8 31.7C26.8 31.7 26.5 31.8 24 31.8C21.5 31.8 21.2 31.8 20.2 31.7C19.3 31.7 18.8 31.5 18.4 31.4C18 31.2 17.6 31 17.3 30.7C17 30.4 16.8 30.1 16.6 29.6C16.5 29.3 16.3 28.8 16.3 27.8C16.3 26.8 16.2 26.5 16.2 24C16.2 21.5 16.2 21.2 16.3 20.2C16.3 19.3 16.5 18.8 16.6 18.4C16.8 18 17 17.6 17.3 17.3C17.6 17 17.9 16.8 18.4 16.6C18.7 16.5 19.2 16.3 20.2 16.3C21.2 16.3 21.5 16.2 24 16.2C26.5 16.2 26.8 16.2 27.8 16.3C28.7 16.3 29.2 16.5 29.6 16.6C30 16.8 30.4 17 30.7 17.3C31 17.6 31.2 17.9 31.4 18.4C31.5 18.7 31.7 19.2 31.7 20.2C31.7 21.2 31.8 21.5 31.8 24C31.8 26.5 31.8 26.8 31.7 27.8ZM30.2 18.9C30.2 19.5 29.7 20 29.1 20C28.5 20 28 19.5 28 18.9C28 18.3 28.5 17.8 29.1 17.8C29.7 17.8 30.2 18.3 30.2 18.9ZM24 19.1C21.3 19.1 19.1 21.3 19.1 24C19.1 26.7 21.3 28.9 24 28.9C26.7 28.9 28.9 26.7 28.9 24C28.9 21.3 26.7 19.1 24 19.1ZM24 27.2C22.3 27.2 20.8 25.8 20.8 24C20.8 22.2 22.2 20.8 24 20.8C25.8 20.8 27.2 22.2 27.2 24C27.2 25.8 25.7 27.2 24 27.2Z" fill="#160E1B" />
                      </svg>
                    </a>
                  </li>
                  <li className="cursor-pointer">
                    <a href={"https://www.linkedin.com/shareArticle?mini=true&url=" + url} target='_blank'>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="47"
                          height="47"
                          rx="23.5"
                          stroke="#160E1B"
                        />
                        <path
                          d="M32.2154 14.5H15.879C15.1365 14.5 14.5 15.1333 14.5 15.8722V32.1278C14.5 32.8667 15.1365 33.5 15.879 33.5H32.1093C32.8519 33.5 33.4884 32.8667 33.4884 32.1278V15.8722C33.5945 15.1333 32.958 14.5 32.2154 14.5ZM20.1223 30.65H17.3642V21.5722H20.2283V30.65H20.1223ZM18.7432 20.4111C17.7885 20.4111 17.152 19.6722 17.152 18.7222C17.152 17.7722 17.8946 17.1389 18.7432 17.1389C19.6979 17.1389 20.3344 17.8778 20.3344 18.7222C20.4405 19.6722 19.6979 20.4111 18.7432 20.4111ZM30.7303 30.65H27.8661V26.2167C27.8661 25.1611 27.8661 23.7889 26.381 23.7889C24.8959 23.7889 24.6837 24.95 24.6837 26.1111V30.5444H21.9256V21.5722H24.6837V22.8389C25.108 22.1 25.9567 21.3611 27.3357 21.3611C30.1999 21.3611 30.7303 23.2611 30.7303 25.6889V30.65Z"
                          fill="#160E1B"
                        />
                      </svg>
                    </a>
                  </li>
                  <li className="cursor-pointer">
                    <a href={"mailto:?body=" + url}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_5342_2671)">
                          <rect
                            x="0.5"
                            y="0.5"
                            width="47"
                            height="47"
                            rx="23.5"
                            stroke="#160E1B"
                          />
                          <path
                            d="M23 27H19C17.35 27 16 25.65 16 24C16 22.35 17.35 21 19 21H23V19H19C16.24 19 14 21.24 14 24C14 26.76 16.24 29 19 29H23V27Z"
                            fill="#160E1B"
                          />
                          <path
                            d="M29 19H25V21H29C30.65 21 32 22.35 32 24C32 25.65 30.65 27 29 27H25V29H29C31.76 29 34 26.76 34 24C34 21.24 31.76 19 29 19Z"
                            fill="#160E1B"
                          />
                          <path d="M28 23H20V25H28V23Z" fill="#160E1B" />
                        </g>
                        <defs>
                          <clipPath id="clip0_5342_2671">
                            <rect width="48" height="48" rx="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* article contant sec start */}
        </div>
      </div >
      {/* Related Plumbing Resources sec start */}
      <div className="pt-24 pb-4" >
        <div className="content-wrapper !max-w-[1360px]">
          <div className="sm:flex sm:justify-between sm:items-center px-4">
            <h4 className="sm:text-4xl text-neutral-8 sm:font-extrabold sm:py-6">
              Related {slug} Resources
            </h4>
            <div className="flex justify-start items-center text-green-30 cursor-pointer">
              <span className="font-extrabold text-base mr-1.5">
                <a href={`/blogs/${slug}`}>View All</a>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10.0013" cy="9.99935" r="8.33333" fill="#446039" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 9.16602H14.1667V10.8327H5V9.16602Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.99882 4.6543L15.344 9.99948L9.99882 15.3447L8.82031 14.1661L12.987 9.99948L8.82031 5.83281L9.99882 4.6543Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-start items-start flex-wrap">
            {/* loop part start */}
            {blogs.map((blog, key) => (
              <div className="sm:w-1/3 py-7 sm:px-3" key={key}>
                <div className="w-full mb-6">
                  <img
                    src={blog?.image?.src || bloglist1}
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
                  href={'/blogs/' + slug + '/' + blogs[0]?.handle}
                  className="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
                >
                  View Resource
                </a>
              </div>
            ))}
            {/* loop part end */}
          </div>
          <div className="w-full text-center pt-7 pb-10"></div>
          {/* discover more pge sec start */}
          <div className="bg-green-30 rounded-3xl p-7 sm:p-20 mb-20 mt-6 discover">
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
      {/* Related Plumbing Resources sec start */}
    </>
  );
}

export default $artical;
