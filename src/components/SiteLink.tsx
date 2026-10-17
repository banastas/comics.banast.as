import React from 'react';
import { destinationHref, type Destination } from '../utils/destinations';
import { AppLink } from './AppLink';
import { useNavigate } from './navigation';

type SiteLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  to: Destination;
};

export const SiteLink: React.FC<SiteLinkProps> = ({ to, children, ...rest }) => {
  const navigate = useNavigate();
  return (
    <AppLink {...rest} href={destinationHref(to)} onNavigate={() => navigate(to)}>
      {children}
    </AppLink>
  );
};
