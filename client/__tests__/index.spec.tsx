import { RenderResult, render, screen, waitFor } from "@testing-library/react";
import { ApolloProvider } from "@apollo/client";
import { createMockClient, MockApolloClient } from "mock-apollo-client";
import Home from "@/pages";

describe("<Home />", () => {
  let renderResult: RenderResult;
  let mockedClient: MockApolloClient;
  beforeEach(async () => {
    await waitFor(() => {
      mockedClient = createMockClient();
      renderResult = render(
        <ApolloProvider client={mockedClient}>
          <Home />
        </ApolloProvider>
      );
    });
  });
  it("should render OK", async () => {
    await waitFor(() => {
      expect(document.title).toBe("Home | Project Name");
      expect(renderResult).toMatchSnapshot();
    });
  });
});
