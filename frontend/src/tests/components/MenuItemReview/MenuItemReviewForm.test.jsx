import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();
  const testIdPrefix = "MenuItemReviewForm";

  const expectedLabels = [
    "Menu Item ID",
    "Reviewer Email",
    "Star Rating (1–5)",
    "Date Reviewed",
    "Comments",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedLabels.forEach((labelText) => {
      expect(screen.getByText(labelText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testIdPrefix}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneMenuItemReview}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expect(await screen.findByTestId(`${testIdPrefix}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();

    expect(screen.getByTestId(`${testIdPrefix}-itemId`)).toHaveValue(27);
    expect(screen.getByTestId(`${testIdPrefix}-reviewerEmail`)).toHaveValue(
      "a@ucsb.edu",
    );
    expect(screen.getByTestId(`${testIdPrefix}-stars`)).toHaveValue(3);
    expect(screen.getByTestId(`${testIdPrefix}-dateReviewed`)).toHaveValue(
      "2022-04-20T00:00",
    );
    expect(screen.getByTestId(`${testIdPrefix}-comments`)).toHaveValue("A");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByTestId(`${testIdPrefix}-cancel`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`${testIdPrefix}-cancel`));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows validation errors when required fields are empty", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Menu item ID is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reviewer email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Star rating is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date reviewed is required/)).toBeInTheDocument();
    expect(screen.getByText(/Comments are required/)).toBeInTheDocument();
  });

  test("validates reviewer email format", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-05-01T14:30" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "Nice" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Reviewer email must be a valid email address/),
    ).toBeInTheDocument();
  });

  test("validates star rating range", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "person@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-05-01T14:30" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "Too many stars" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Stars must be at most 5/),
    ).toBeInTheDocument();
  });

  test("validates comments max length", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "person@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-05-01T14:30" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "x".repeat(501) },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Comments may be at most 500 characters/),
    ).toBeInTheDocument();
  });

  test("validates menu item ID minimum value", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "person@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-05-01T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "Hi" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Menu item ID must be at least 1/),
    ).toBeInTheDocument();
  });

  test("validates stars minimum value", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "person@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-05-01T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "Too few stars" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText(/Stars must be at least 1/),
    ).toBeInTheDocument();
  });

  test("initialContents with non-string dateReviewed leaves field empty", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={{
              ...menuItemReviewFixtures.oneMenuItemReview,
              // exercise typeof !== "string" branch in toDateTimeLocalValue
              dateReviewed: 12345,
            }}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId(`${testIdPrefix}-dateReviewed`)).toHaveValue("");
  });

  test("calls submitAction when input is valid", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByTestId(`${testIdPrefix}-itemId`), {
      target: { value: "99" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-reviewerEmail`), {
      target: { value: "reviewer@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-dateReviewed`), {
      target: { value: "2022-06-15T09:45" },
    });
    fireEvent.change(screen.getByTestId(`${testIdPrefix}-comments`), {
      target: { value: "Excellent" },
    });

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    const submitted = mockSubmitAction.mock.calls[0][0];
    expect(typeof submitted.itemId).toBe("number");
    expect(typeof submitted.stars).toBe("number");
  });
});
