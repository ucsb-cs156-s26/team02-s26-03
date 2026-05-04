import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "ARTS",
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBOrganizationEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBOrganization", { params: { orgCode: "ARTS" } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const queryClient = new QueryClient();
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit UCSBOrganization");
      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBOrganization", { params: { orgCode: "ARTS" } })
        .reply(200, ucsbOrganizationFixtures.oneOrganization);
      axiosMock.onPut("/api/UCSBOrganization").reply(200, {
        orgCode: "ARTS",
        orgTranslationShort: "Updated Arts",
        orgTranslation: "Updated Arts Organization",
        inactive: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("is populated with the data provided", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toBeInTheDocument();
      expect(orgCodeField).toHaveValue("ARTS");
      expect(orgCodeField).toBeDisabled();
      expect(orgTranslationShortField).toHaveValue("Arts");
      expect(orgTranslationField).toHaveValue(
        "College of Letters and Science - Arts and Humanities",
      );
      expect(inactiveField).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");
    });

    test("changes when you click Update", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      fireEvent.change(orgTranslationShortField, {
        target: { value: "Updated Arts" },
      });
      fireEvent.change(orgTranslationField, {
        target: { value: "Updated Arts Organization" },
      });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization Updated - orgCode: ARTS",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "ARTS" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgTranslationShort: "Updated Arts",
          orgTranslation: "Updated Arts Organization",
          inactive: true,
        }),
      );
    });

    test("on invalid submit, shows errors and does not call backend", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      fireEvent.change(
        screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
        {
          target: { value: "" },
        },
      );
      fireEvent.change(
        screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
        {
          target: { value: "" },
        },
      );
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

      expect(
        await screen.findByText("Org Translation Short is required."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Org Translation is required."),
      ).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
    });

    test("cancel routes back to the previous page", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      fireEvent.click(await screen.findByTestId("UCSBOrganizationForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
    });
  });
});
