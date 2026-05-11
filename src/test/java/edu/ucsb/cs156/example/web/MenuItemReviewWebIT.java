package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Locator;
import edu.ucsb.cs156.example.WebTestCase;
import java.net.URI;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_menu_item_review() throws Exception {
    setupUser(true);

    page.navigate(URI.create(page.url()).resolve("/menuitemreview").toString());
    page.waitForURL("**/menuitemreview");

    Locator createButton = page.getByTestId("menuitemreview-index-create-button");
    createButton.click(new Locator.ClickOptions().setTimeout(180_000));
    assertThat(page.getByText("Create New MenuItemReview")).isVisible();

    page.getByTestId("MenuItemReviewForm-itemId").fill("77");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("e2e@ucsb.edu");
    page.getByTestId("MenuItemReviewForm-stars").fill("4");
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2022-08-10T09:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("E2E create");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("E2E create");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit MenuItemReview")).isVisible();
    page.getByTestId("MenuItemReviewForm-comments").fill("E2E updated");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("E2E updated");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_menu_item_review() throws Exception {
    setupUser(false);

    page.navigate(URI.create(page.url()).resolve("/menuitemreview").toString());
    page.waitForURL("**/menuitemreview");

    assertThat(page.getByTestId("menuitemreview-index-create-button")).not().isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button"))
        .not()
        .isVisible();
  }
}
