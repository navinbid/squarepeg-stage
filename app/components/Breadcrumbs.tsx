import {Fragment} from 'react';
import {Link, useLocation} from '@remix-run/react';
import React from 'react';

// to title case except for "and"
export function toTitleCase(str: string) {
  return str
    .trim()
    .split(' ')
    .map((word) => {
      // handle special cases for specific words
      if (word.toLowerCase() === 'and') {
        return word?.toLowerCase();
      }

      if (word.toLowerCase() === 'hvac') {
        return word?.toUpperCase();
      }

      return word[0]?.toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// ignore URL segments that include these words
const IGNORED_SEGMENTS = ['collections'];

export function Breadcrumbs() {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <div>
      <Link className="text-neutral-8 font-semibold" to="/">
        Home
      </Link>{' '}
      /{' '}
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLastSegment = index === segments.length - 1;

        const displayText = toTitleCase(segment.replace(/-/g, ' '));

        if (IGNORED_SEGMENTS.includes(segment)) {
          return null;
        }

        if (isLastSegment) {
          return (
            <span key={segment} className="font-normal">
              {displayText}
            </span>
          );
        }

        return (
          <Fragment key={segment}>
            <Link to={href} className="text-neutral-8 font-semibold">
              {displayText}
            </Link>
            {!isLastSegment && ' / '}
          </Fragment>
        );
      })}
    </div>
  );
}

export type CustomBreadcrumbsProps = {
  segments: {
    href: string;
    text: string;
  }[];
};

export function CustomBreadcrumbs({segments}: CustomBreadcrumbsProps) {
  return (
    <div>
      <Link className="font-semibold" to="/">
        Home
      </Link>{' '}
      /{' '}
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLastSegment = index === segments.length - 1;

        if (!segment.href || !segment.text) {
          return null;
        }
        if (isLastSegment) {
          return (
            <span key={segment.text} className="capitalize font-normal">
              {segment.text}
            </span>
          );
        }

        return (
          <React.Fragment key={segment.text}>
            <Link
              key={segment.text}
              to={segment.href}
              className="text-neutral-8 capitalize font-semibold"
            >
              {segment.text}
            </Link>
            {!isLastSegment && ' / '}
          </React.Fragment>
        );
      })}
    </div>
  );
}
