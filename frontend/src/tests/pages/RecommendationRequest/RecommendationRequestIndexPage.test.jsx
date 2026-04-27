import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new MockAdapter(axios);

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Create RecommendationRequest/),
      ).toBeInTheDocument();
    });
    const button = screen.getByText(/Create RecommendationRequest/);
    expect(button).toHaveAttribute("href", "/recommendationrequest/create");
    expect(button).toHaveStyle("float: right");
  });

  test("renders three recommendationRequests correctly for regular user", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });
    expect(
      screen.getByTestId(`RecommendationRequestTable-cell-row-1-col-id`),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId(`RecommendationRequestTable-cell-row-2-col-id`),
    ).toHaveTextContent("4");
    expect(
      screen.queryByText(/Create RecommendationRequest/),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend returns empty list", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const table = screen.getByTestId("RecommendationRequestTable");
      expect(table).toBeInTheDocument();
    });

    const rows = screen.queryAllByTestId(
      /RecommendationRequestTable-cell-row-\d+-col-id/,
    );
    expect(rows.length).toBe(0);
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/recommendationrequest/all").timeout();

    const consoleSpy = vi.spyOn(console, "error");
    consoleSpy.mockImplementation(() => {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = consoleSpy.mock.calls[0][0];
    expect(errorMessage).toMatch(
      /Error communicating with backend via GET on \/api\/recommendationrequest\/all/,
    );
    consoleSpy.mockRestore();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, "RecommendationRequest with id 2 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`RecommendationRequestTable-cell-row-0-col-id`),
    ).toHaveTextContent("2");

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest with id 2 was deleted",
      );
    });
  });
});
