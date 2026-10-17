import { createContext, useContext } from 'react';
import { destinationHref, type Destination } from '../utils/destinations';

type Navigate = (destination: Destination) => void;

// Outside the app shell (static rendering and isolated component tests) links fall back to
// ordinary full-page navigation.
const NavigationContext = createContext<Navigate | null>(null);

export const NavigationProvider = NavigationContext.Provider;

export const useNavigate = (): Navigate => {
  const navigate = useContext(NavigationContext);
  return navigate ?? ((destination) => { window.location.assign(destinationHref(destination)); });
};
