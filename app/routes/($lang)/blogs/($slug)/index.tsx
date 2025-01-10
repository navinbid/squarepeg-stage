import { useLoaderData } from '@remix-run/react';
import { AppLoadContext, LoaderArgs, defer } from '@shopify/remix-oxygen';
import { param } from 'cypress/types/jquery';
import { find } from 'isbot';
import React from 'react';
import blogbanner from '~/assets/blogbanner.png';
import bloglist1 from '~/assets/bloglist1.png';

interface FruitPageProps {
  categori: string;
}

export async function loader({ request, context, params }: LoaderArgs) {
  const slug = params.slug;

  const myHeaders = new Headers();
  myHeaders.append(
    'X-Shopify-Access-Token',
    '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',
  );
  myHeaders.append('Content-Type', 'application/json');
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
  const cid = JSON.parse(category)?.blogs[0]?.id || '';
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

  const metafields = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/blogs/${cid}/metafields.json`,
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

  const tags = await fetch(
    `https://${context.env.PUBLIC_STORE_DOMAIN}/admin/api/2022-07/articles/tags.json`,
    {
      headers: myHeaders,
    },
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    });

  return defer({
    category,
    slug,
    Blogs,
    metafields,
    categorys,
    tags
  });
}

export default function index() {
  const { category, Blogs, metafields, slug, categorys, tags } = useLoaderData<typeof loader>();
  const categories = JSON.parse(category).blogs;
  let blogs = JSON.parse(Blogs).articles;
  const metafilds = JSON.parse(metafields).metafields;
  const Categorys = JSON.parse(categorys).blogs;
  const tag = JSON.parse(tags).tags;
  // console.log(blogs)
  function changeCategoryFunction(e) {
    const selectedCategory = e.target.value;
    window.location.href = '/blogs/' + selectedCategory;
  }

  function changeSortbyFunction(e) {
    // console.log(e.target.value)
    const sortedBlogPostsAsc = blogs.sort((a, b) => a.title.localeCompare(b.title));
    const sortedBlogPostsDesc = [...sortedBlogPostsAsc].reverse();
    const shortedBlogPostOldest = [...blogs].reverse();
    const firstDiv = document.getElementById('default');
    const secondDiv = document.getElementById('filtered');


    if (e.target.value == "atoz") {
      firstDiv.style.display = 'none';

      const mappedBlogs = sortedBlogPostsAsc.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;

    } else if (e.target.value == "ztoa") {
      firstDiv.style.display = 'none';

      const mappedBlogs = sortedBlogPostsDesc.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;

    } else if ((e.target.value == "newtoold")) {
      firstDiv.style.display = 'none';

      const mappedBlogs = blogs.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;
    }
    else if ((e.target.value == "oldtonew")) {
      firstDiv.style.display = 'none';

      const mappedBlogs = shortedBlogPostOldest.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;
    }
    else {

      firstDiv.style.display = 'none';

      const mappedBlogs = blogs.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;



    }
  }

  function changeTopicFunction(e) {
    const filteredblogs = blogs.filter(item => item.tags && item.tags.includes(e.target.value));
    const firstDiv = document.getElementById('default');

    if (firstDiv) {
      firstDiv.style.display = 'none';
    }

    const secondDiv = document.getElementById('filtered');
    if (secondDiv) {
      // Map the elements outside the template string
      const mappedBlogs = filteredblogs.filter((blog) => blog.published_at !== null).map((blog, key) => `
        <div class="sm:w-1/3 py-7 sm:px-3" key=${key}>
          <div class="w-full mb-6 md:h-[276px]">
            <img
              src=${blog?.image?.src || bloglist1}
              class="rounded-lg w-full h-full object-cover"
              alt="bloglistpicture"
            />
          </div>
          <p class="font-normal text-sm text-neutral-8 pb-2">
            ${categories[0]?.title || ''}
            <span class="text-neutral-44 ml-1.5">4 min read</span>
          </p>
          <h3 class="font-bold text-lg text-neutral-8">
            ${blog.title}
          </h3>
          <a
            href={'/blogs/' + slug + '/' + blog.handle}
            class="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
          >
            View Resource
          </a>
        </div>
      `);

      // Include the mapped elements in the template string
      secondDiv.innerHTML = `${mappedBlogs.join('')}`;
    }
  }

  const getValidBlog = () => {
    let index = 0;
    while (index < blogs.length) {
      const currentBlog = blogs[index];
      if (currentBlog.published_at !== null) {
        return currentBlog;
      }
      index++;
    }
    return null; // No valid blog found
  };

  const validBlog = getValidBlog();

  // console.log(validBlog);

  console.log(blogs)

  function findHandleById(givenId) {
    const blog = Categorys.find((blog) => blog.id == givenId);

    if (blog) {
      return blog.handle;
    } else {
      return null; // or any default value you prefer when the ID is not found
    }
  }

  // console.log(findHandleById(107492606269))


  return (
    <>
      <div className=' bg-neutral-98'>
        <div className="content-wrapper pb-24">
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
                    className="ml-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    aria-current="page"
                  >
                    All Resources
                  </a>
                </div>
              </li>
            </ol>
          </nav>
          {/* breadcrumb end */}
          <h1 className="font-extrabold text-4xl text-neutral-8 pt-5 pb-8">
            Resources
          </h1>
          {/* blog header start */}
          {validBlog ? (
            <div className="rounded-lg bg-white md:flex md:justify-start md:items-center overflow-hidden">
              <div className="md:w-1/2 w-full">
                <img src={validBlog?.image?.src || bloglist1} alt="blogbanner" />
              </div>
              <div className="p-3 md:px-24 md:w-1/2 w-full">
                <p className="font-normal text-sm text-neutral-8 pb-3">
                  {categories[0]?.title || validBlog?.tags}{' '}
                  <span className="text-neutral-44">4 min read</span>
                </p>
                <h2 className="text-lg font-extrabold md:text-4xl text-neutral-8">
                  {validBlog?.title}
                </h2>
                {/* <p className="font-normal text-base text-neutral-8 leading-6 pt-10 pb-6">
              {blogs[0]?.body_html}

            </p> */}
                <div className="pt-10 pb-6">
                  {validBlog && (
                    <div dangerouslySetInnerHTML={{ __html: validBlog.summary_html }} />
                  )}
                </div>
                <a
                  href={'/blogs/' + findHandleById(validBlog.blog_id) + '/' + validBlog?.handle}
                  className="inline-block font-semibold text-base transition-colors text-green-30 text-green-30 w-auto mt-1 underline"
                >
                  View Resource
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-white md:flex md:justify-start md:items-center overflow-hidden">
                <div className="md:w-1/2 w-full">
                  <p>no blogs found</p>
                </div>
              </div>
            </>
          )}
          {/* blog header end */}

        </div>
      </div>
      {/* blog body sec start */}
      <div className="bg-white pt-12 pb-4">
        <div className="content-wrapper pt-4 pb-8">
          <div className="sm:flex sm:justify-between sm:items-center">
            <div className="flex justify-start items-center space-x-4">
              <select
                id="category"
                name="category"
                autoComplete="category"
                className="block w-60 rounded-full border-0 pl-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus: outline-offset-0 sm:max-w-xs sm:text-sm sm:leading-6 font-bold"
                onChange={changeCategoryFunction}
              >
                <option>Select Category</option>

                {Categorys.map((category) => (
                  <option selected={category.handle === slug ? true : false} key={category.id} value={category.handle}>{category.title}</option>
                ))}

              </select>

              <select
                id="topic"
                name="topic"
                autoComplete="topic-name"
                className="block w-60 rounded-full border-0 pl-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus: outline-offset-0 sm:max-w-xs sm:text-sm sm:leading-6 font-bold"
                onChange={changeTopicFunction}
              >
                <option>Select Topic</option>

                {tag.map((tag) => (
                  <option key={tag}>{tag}</option>
                ))}

              </select>
            </div>
            <div className="flex justify-start items-center">
              <p className="font-semibold text-sm text-neutral-8">Sort by:</p>
              <select
                id="Popularity"
                name="Popularity"
                autoComplete="Popularity"
                className="block border-none pl-1 text-gray-900 sm:max-w-xs sm:text-sm"
                onChange={changeSortbyFunction}
              >
                <option value="popularity"> Popularity </option>
                <option value="atoz"> A - Z </option>
                <option value="ztoa"> Z - A </option>
                <option value="newtoold">Newest-Oldest</option>
                <option value="oldtonew">Oldest-Newest</option>

              </select>
            </div>
          </div>
        </div>
        <div className="content-wrapper !max-w-[1360px]">
          <div className="flex justify-start items-start flex-wrap">
            {/* loop part start */}
            <div id='default' className="flex justify-start items-start flex-wrap w-full">
              {blogs.filter((blog) => blog.published_at !== null).map((blog, key) => (
                <div className="sm:w-1/3 py-7 sm:px-3" key={key}>
                  <div className="w-full mb-6 md:h-[276px]">
                    <img
                      src={blog?.image?.src || bloglist1}
                      className="rounded-lg w-full h-full object-cover"
                      alt="bloglistpicture"
                    />
                  </div>
                  <p className="font-normal text-sm text-neutral-8 pb-2">
                    {categories[0]?.title}{' '}
                    <span className="text-neutral-44 ml-1.5">4 min read</span>
                  </p>
                  <h3 className="font-bold text-lg text-neutral-8">
                    {blog.title}
                  </h3>
                  <a
                    href={'/blogs/' + findHandleById(blog.blog_id) + '/' + blog.handle}
                    className="inline-block font-semibold text-sm transition-colors text-green-30 w-auto mt-2 underline hover:no-underline"
                  >
                    View Resource
                  </a>
                </div>

              ))}
            </div>
            <div id='filtered' className="flex justify-start items-start flex-wrap w-full">

            </div>


          </div>
          {/* <div className="w-full text-center pt-7 pb-16">
            <button className="border-2 border-lightgreen rounded-3xl px-5 py-1.5 text-base text-green-30 font-semibold">
              Load More
            </button>
          </div> */}
        </div>
      </div>
      {/* blog body sec start */}
    </>
  );
};
