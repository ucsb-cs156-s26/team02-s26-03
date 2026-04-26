import { render, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("RecommendationRequestCreatePage tests", () => {
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
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const header = screen.getByText("Create Page Placeholder");
    expect(header).toBeInTheDocument();
  });
});
