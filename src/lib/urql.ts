import {
  CombinedError,
  cacheExchange,
  createClient,
  fetchExchange,
} from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

export const makeClient = (access_token?: string) => {
  return createClient({
    url: `https://ijhzkrbxahlhpkcextwl.supabase.co/graphql/v1`,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const headers = {
        apiKey: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaHprcmJ4YWhsaHBrY2V4dHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODE3NTYsImV4cCI6MjA5NTk1Nzc1Nn0.kR8iHK6eBjss02pwdqA_AO4D6qow_leCMsLlmvOSuAM`,
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
