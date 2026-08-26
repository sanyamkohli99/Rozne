import {
  CombinedError,
  cacheExchange,
  createClient,
  fetchExchange,
} from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

// Supabase pg_graphql rejects GET requests (PGRST202), so force all GraphQL requests to POST.
export const forcePostFetch: typeof fetch = (input, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    return fetch(input, init);
  }
  const url = new URL(input.toString());
  const query = url.searchParams.get("query") ?? "";
  let variables: unknown = {};
  try {
    variables = JSON.parse(url.searchParams.get("variables") ?? "{}");
  } catch {
    variables = {};
  }
  const operationName = url.searchParams.get("operationName") ?? undefined;
  url.search = "";
  return fetch(url.toString(), {
    ...init,
    method: "POST",
    headers: {
      ...init?.headers,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
      ...(operationName ? { operationName } : {}),
    }),
  });
};

export const makeClient = (access_token?: string) => {
  return createClient({
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    fetch: forcePostFetch,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const headers: Record<string, string> = {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      };

      if (access_token) {
        headers["Authorization"] = `Bearer ${access_token}`;
      }

      return { headers };
    },
  });
};

export type ExpectedErrorsHandlerType = {
  error?: CombinedError | undefined;
  expectedErrors?: { [key: string]: string };
  unexpectedErrorMessage?: string;
  networkErrorMessage?: string;
};

export function expectedErrorsHandler({
  error,
  expectedErrors = {},
  unexpectedErrorMessage = "An unexpected error occurred.",
  networkErrorMessage = "There was a problem with the network connection.",
}: ExpectedErrorsHandlerType): null | string {
  if (error === undefined) {
    return null;
  } else if (error.networkError) {
    return networkErrorMessage;
  }

  let foundExpectedError = false;

  for (const graphQLError of error.graphQLErrors) {
    for (const [errorKey, errorMessage] of Object.entries(expectedErrors)) {
      if (graphQLError.message.includes(errorKey)) {
        return errorMessage;
      }
    }
    foundExpectedError = true;
  }

  return foundExpectedError ? unexpectedErrorMessage : null;
}

export const createUrqlClient = (access_token?: string) =>
  registerUrql(() => makeClient(access_token)).getClient();

export const { getClient } = registerUrql(makeClient);
