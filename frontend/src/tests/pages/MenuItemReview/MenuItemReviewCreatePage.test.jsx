import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

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

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testIdPrefix = "MenuItemReviewForm";

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Menu Item ID")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    axiosMock
      .onPost("/api/MenuItemReview/post")
      .reply(200, menuItemReviewFixtures.oneMenuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testIdPrefix}-itemId`)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "a@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-04-20T00:00" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "A" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 27,
      reviewerEmail: "a@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-20T00:00:00",
      comments: "A",
    });

    expect(mockToast).toBeCalledWith(
      "New MenuItemReview Created - id: 1 itemId: 27",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });

  test("storybook mode does not navigate after successful submit", async () => {
    axiosMock
      .onPost("/api/MenuItemReview/post")
      .reply(200, menuItemReviewFixtures.oneMenuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testIdPrefix}-itemId`)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "a@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-04-20T00:00" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "A" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("validation errors show and no POST when data is invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testIdPrefix}-submit`)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Menu item ID is required/),
    ).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });
});
