import { render, screen } from "@testing-library/react";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("RecommendationRequestEditPage tests", () => {
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
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const header = screen.getByText("Edit Page Placeholder");
    expect(header).toBeInTheDocument();
  });
});
