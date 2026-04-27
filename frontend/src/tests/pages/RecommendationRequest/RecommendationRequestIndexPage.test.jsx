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
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);
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
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);
  };

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
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
  });

  test("renders three recommendationRequests correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);

    const queryClient = new QueryClient();
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
  });

  test("renders empty table when backend returns null", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, null);

    const queryClient = new QueryClient();
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
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, "RecommendationRequest with id 2 was deleted");

    const queryClient = new QueryClient();
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

    const deleteButton = screen.getByTestId(
      `RecommendationRequestTable-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest with id 2 was deleted",
      );
    });
  });
});
