import { Form, useLocation, useNavigate, useParams } from '@remix-run/react';
import { Combobox } from '@headlessui/react';

import { IconLoading, IconSearch } from './Icon';
import { useDeferredValue, useEffect, useState } from 'react';
import { HeaderText } from './HeaderText';
import { BodyText } from './BodyText';
import { FallbackURL } from '~/lib/static-content';

function useSearch(query: string) {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function search() {
    if (!query) {
      setResults(null);
      return;
    }

    setIsLoading(true);

    const response = await fetch(`/typeahead?q=${query}`);
    const json = await response.json();
    setResults(json);
    setIsLoading(false);
  }

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query]);

  return { results, isLoading, search };
}

export function HeaderSearch() {
  // get current route
  const location = useLocation();
  const params = useParams();
  // get default query from url
  const initialQueryValue = new URLSearchParams(location.search).get('q') || '';
  const [query, setQuery] = useState(initialQueryValue);
  const deferredQuery = useDeferredValue(query);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { results: searchResults, isLoading } = useSearch(deferredQuery);

  function handleTypeaheadSubmit(url: string) {
    navigate(url);
  }

  useEffect(() => {
    // clear query when navigating to a non-search page
    if (!location.pathname.includes('/search') && query) {
      setQuery('');
    } else {
      // update query when navigating to a search page
      setQuery(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  const noResults =
    !searchResults?.collections?.length && !searchResults?.products?.length;

  return (
    <Combobox
      value={query}
      onChange={handleTypeaheadSubmit}
      key={`${location.pathname}${location.search}${isSubmitting}`}
      nullable
    >
      <div className="flex gap-10 order-last basis-full md:order-2 md:flex-1 md:basis-auto">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex w-full relative"
        >
          <Combobox.Input
            className="bg-neutral-98 pt-3 pl-6 pr-3 rounded-l-[32px] border-[#CCC] w-full inline-flex flex-1"
            placeholder="What can we help you find today?"
            type="search"
            name="q"
            onKeyDown={(event) => {
              if (event.nativeEvent.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
                // handleTypeaheadSubmit(`/search?q=${query}`);
                setIsSubmitting(true);
                navigate(`/search?q=${query}`);
              }
            }}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          <Combobox.Options className="absolute mt-2 top-full z-50 max-h-72 w-full md:w-[calc(100%-64px)] overflow-auto rounded-md bg-white pt-4 pb-5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* This option prevents first option from being selected by default */}
            <Combobox.Option value="" />
            {noResults && !isLoading && (
              <HeaderText level="6" className="py-1 px-3">
                No Results
              </HeaderText>
            )}
            {isLoading && !noResults && (
              <div>
                <IconLoading />
              </div>
            )}
            {searchResults?.collections?.length > 0 && (
              <HeaderText level="5" className="pl-3">
                Suggestions
              </HeaderText>
            )}
            {searchResults?.collections?.map((collection) => (
              <Combobox.Option
                key={collection.id}
                value={`/collections/${collection.handle}`}
                className={({ active }) =>
                  `relative cursor-default select-none py-1 px-3 ${active ? 'bg-gray-100 ' : 'bg-white text-gray-900'
                  }`
                }
              >
                {collection.title}
              </Combobox.Option>
            ))}
            {searchResults?.products?.length > 0 && (
              <>
                <HeaderText level="5" className="pl-3 my-2 mt-6">
                  Products
                </HeaderText>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {searchResults?.products?.map((product) => (
                    <Combobox.Option
                      key={product.id}
                      value={`/products/${product.handle}`}
                      className={({ active }) =>
                        `relative cursor-default select-none py-1 px-3 ${active ? 'bg-gray-100 ' : 'bg-white text-gray-900'
                        }`
                      }
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16" style={{ flex: '0 0 64px' }}>
                          <img
                            src={product?.featuredImage?.url || FallbackURL}
                            className="w-16 h-16 rounded-sm"
                            alt={product.title}
                          />
                        </div>
                        <div className="flex flex-col">
                          <BodyText level="title-3">{product.title}</BodyText>
                          <BodyText
                            level="subtitle-3"
                            className="text-sm text-gray-500"
                          >
                            Part #{product?.handle}
                          </BodyText>
                        </div>
                      </div>
                    </Combobox.Option>
                  ))}
                </div>
              </>
            )}
          </Combobox.Options>
          <button
            type="submit"
            className="bg-brand relative flex items-center justify-center h-full w-16 rounded-r-[32px] text-white"
          >
            <IconSearch />
          </button>
        </Form>
      </div>
    </Combobox>
  );
}
