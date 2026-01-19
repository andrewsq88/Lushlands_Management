import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeContextType {
  stripe: Promise<Stripe | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: ReactNode;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <StripeContext.Provider value={{ stripe: stripePromise }}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}