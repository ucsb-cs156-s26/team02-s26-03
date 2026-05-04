import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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

  beforeEach(() => {
    vi.clearAllMocks();
    setupUserOnly();
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create New UCSBOrganization"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("UCSBOrganizationForm-orgCode"),
    ).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization", async () => {
    const queryClient = new QueryClient();
    const ucsbOrganization = {
      orgCode: "LIBR",
      orgTranslationShort: "Library",
      orgTranslation: "UCSB Library",
      inactive: true,
    };

    axiosMock.onPost("/api/UCSBOrganization/post").reply(202, ucsbOrganization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("UCSBOrganizationForm-orgCode");

    fireEvent.change(screen.getByTestId("UCSBOrganizationForm-orgCode"), {
      target: { value: "LIBR" },
    });
    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      {
        target: { value: "Library" },
      },
    );
    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      {
        target: { value: "UCSB Library" },
      },
    );
    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-inactive"));
    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "LIBR",
      orgTranslationShort: "Library",
      orgTranslation: "UCSB Library",
      inactive: true,
    });

    expect(mockToast).toBeCalledWith(
      "New UCSBOrganization Created - orgCode: LIBR",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("on invalid submit, shows errors and does not call backend", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("UCSBOrganizationForm-submit"));

    expect(
      await screen.findByText("Org Code is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Org Translation Short is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Org Translation is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });
});
