import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend is up", () => {
    const axiosMock = new MockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "cgaucho@ucsb.edu",
          professorEmail: "phtcon@ucsb.edu",
          explanation: "BS/MS program",
          dateRequested: "2022-04-20T00:00:00",
          dateNeeded: "2022-05-01T00:00:00",
          done: false,
        });
    });

    const queryClient = new QueryClient();

    test("renders header but table is not present", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      const header = await screen.findByText("Edit RecommendationRequest");
      expect(header).toBeInTheDocument();
    });

    test("is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const idField = await screen.findByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(professorEmailField).toHaveValue("phtcon@ucsb.edu");
      expect(explanationField).toHaveValue("BS/MS program");
      expect(dateRequestedField).toHaveValue("2022-04-20T00:00");
      expect(dateNeededField).toHaveValue("2022-05-01T00:00");
      expect(doneField).not.toBeChecked();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const requesterEmailField = await screen.findByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(professorEmailField).toHaveValue("phtcon@ucsb.edu");
      expect(explanationField).toHaveValue("BS/MS program");

      fireEvent.change(requesterEmailField, {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "alopez@ucsb.edu" },
      });
      fireEvent.change(explanationField, { target: { value: "REU" } });
      fireEvent.click(doneField);

      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: 17,
        requesterEmail: "ldelplaya@ucsb.edu",
        professorEmail: "alopez@ucsb.edu",
        explanation: "REU",
        dateRequested: "2022-04-20T00:00:00",
        dateNeeded: "2022-05-01T00:00:00",
        done: true,
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          professorEmail: "alopez@ucsb.edu",
          explanation: "REU",
          dateRequested: "2022-04-20T00:00:00",
          dateNeeded: "2022-05-01T00:00:00",
          done: true,
        }),
      );
    });
  });
});
