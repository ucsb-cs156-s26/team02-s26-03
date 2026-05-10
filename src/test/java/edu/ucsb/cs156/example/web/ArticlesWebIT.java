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
public class ArticlesWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {
    setupUser(true);

    page.navigate(URI.create(page.url()).resolve("/articles").toString());
    page.waitForURL("**/articles");

    Locator createArticle = page.getByTestId("articles-index-create-button");
    createArticle.click(new Locator.ClickOptions().setTimeout(180_000));
    assertThat(page.getByText("Create New Article")).isVisible();

    page.getByTestId("ArticlesForm-title").fill("Test Article");
    page.getByTestId("ArticlesForm-url").fill("https://example.com/test");
    page.getByTestId("ArticlesForm-explanation").fill("This is a test article");
    page.getByTestId("ArticlesForm-email").fill("test@example.com");
    page.getByTestId("ArticlesForm-dateAdded").fill("2022-01-03T00:00");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Test Article");

    page.getByTestId("ArticlesTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Article")).isVisible();
    page.getByTestId("ArticlesForm-title").fill("Updated Article");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Updated Article");

    page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_article() throws Exception {
    setupUser(false);

    page.navigate(URI.create(page.url()).resolve("/articles").toString());
    page.waitForURL("**/articles");

    assertThat(page.getByTestId("articles-index-create-button")).not().isVisible();
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }
}
