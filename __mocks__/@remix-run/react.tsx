export const useLocation = () => {
  return {
    pathname: '/',
  };
};

export const useMatches = () => {
  return [
    {
      data: {
        selectedLocale: {
          pathPrefix: '',
        },
      },
    },
  ];
};

export const useFetchers = () => {
  return {};
};

export const Await = () => {
  return <div />;
};

export const Form = () => {
  return <div />;
};

export const useParams = () => {
  return {};
};

export const useFetcher = () => {
  return {};
};

// @ts-ignore
export const Link = ({to, ...props}) => {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a href={to} {...props} />;
};

export const useLoaderData = () => {
  return {};
};

export const useNavigate = () => {
  return () => {};
};

export const useNavigation = () => {
  return () => {};
};

// @ts-ignore
export const NavLink = ({to, ...props}) => {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a href={to} {...props} />;
};

export const useSearchParams = () => {
  return {};
};

export const useTransition = () => {
  return {};
};
