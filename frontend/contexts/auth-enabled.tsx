'use client';

import { createContext, useContext } from 'react';

const AuthEnabledContext = createContext<boolean>(true);

export function AuthEnabledProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthEnabledContext.Provider value={value}>
      {children}
    </AuthEnabledContext.Provider>
  );
}

export function useAuthEnabled(): boolean {
  return useContext(AuthEnabledContext);
}
