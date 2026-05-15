"use client";

import { HttpLink } from '@apollo/client'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import React from 'react'

function makeClient(url: string) {
  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: url,
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children, url }: {children: React.ReactNode, url: string}) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(url)}>
      {children}
    </ApolloNextAppProvider>
  );
}
