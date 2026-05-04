import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("UCSBOrganizationIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UCSBOrganizationTable";

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with Create button for admin user", async () => {
    const queryClient = new QueryClient();
    setupAdminUser();
    axiosMock.onGet("/api/UCSBOrganization/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Create UCSBOrganization")).toBeInTheDocument();
    });
    const button = screen.getByText("Create UCSBOrganization");
    expect(button).toHaveAttribute("href", "/ucsborganization/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three organizations correctly for regular user", async () => {
    const queryClient = new QueryClient();
    setupUserOnly();
    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toHaveTextContent("ARTS");
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("ENGR");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("EXT");

    expect(
      screen.queryByText("Create UCSBOrganization"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("College of Letters and Science - Arts and Humanities"),
    ).toBeInTheDocument();
    expect(screen.getByText("College of Engineering")).toBeInTheDocument();
    expect(screen.getByText("UCSB Extension")).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    const queryClient = new QueryClient();
    setupUserOnly();
    axiosMock.onGet("/api/UCSBOrganization/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/UCSBOrganization/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    const queryClient = new QueryClient();
    setupAdminUser();

    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);
    axiosMock
      .onDelete("/api/UCSBOrganization")
      .reply(200, "UCSBOrganization with orgCode ARTS was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ARTS");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization with orgCode ARTS was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/UCSBOrganization");
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "ARTS" });
  });
});
