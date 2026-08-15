import { createContext, useContext } from 'react';
import type { AppRoute } from './router';

export type { AppRoute };

interface NavigationContextType {
  currentRoute: AppRoute;
  activeSection?: string;
  navigateTo: (route: string, sectionId?: string) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  currentRoute: '/',
  activeSection: undefined,
  navigateTo: () => {},
});

export const useNavigation = () => useContext(NavigationContext);
