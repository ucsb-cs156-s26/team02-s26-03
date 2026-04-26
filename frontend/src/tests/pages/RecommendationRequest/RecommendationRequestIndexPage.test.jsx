import { render, screen } from "@testing-library/react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("RecommendationRequestIndexPage tests", () => {
  const queryClient = new QueryClient();
  test("renders without crashing", () => {
    const mockAdapter = new MockAdapter(axios);
    mockAdapter
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    mockAdapter
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const header = screen.getByText("Index Page Placeholder");
    expect(header).toBeInTheDocument();
  });
});
