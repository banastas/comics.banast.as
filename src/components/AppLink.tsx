import React from 'react';

type AppLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  href: string;
  onNavigate: () => void;
};

// A real link (crawlable, middle-click and cmd-click open a new tab, "Copy link" works)
// that keeps plain clicks inside the single-page app.
const isPlainLeftClick = (event: React.MouseEvent): boolean =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

export const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(({ href, onNavigate, children, ...rest }, ref) => (
  <a
    {...rest}
    ref={ref}
    href={href}
    onClick={(event) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();
      onNavigate();
    }}
  >
    {children}
  </a>
));

AppLink.displayName = 'AppLink';
