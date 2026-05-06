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
public class RestaurantWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_restaurant() throws Exception {
    setupUser(true);

    page.navigate(URI.create(page.url()).resolve("/restaurants").toString());
    page.waitForURL("**/restaurants");

    Locator createRestaurant = page.getByTestId("restaurant-index-create-button");
    createRestaurant.click(new Locator.ClickOptions().setTimeout(180_000));
    assertThat(page.getByText("Create New Restaurant")).isVisible();
    page.getByTestId("RestaurantForm-name").fill("Freebirds");
    page.getByTestId("RestaurantForm-description").fill("Build your own burrito chain");
    page.getByTestId("RestaurantForm-submit").click();

    assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-description"))
        .hasText("Build your own burrito chain");

    page.getByTestId("RestaurantTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Restaurant")).isVisible();
    page.getByTestId("RestaurantForm-description").fill("THE BEST");
    page.getByTestId("RestaurantForm-submit").click();

    assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-description")).hasText("THE BEST");

    page.getByTestId("RestaurantTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_restaurant() throws Exception {
    setupUser(false);

    page.navigate(URI.create(page.url()).resolve("/restaurants").toString());
    page.waitForURL("**/restaurants");

    assertThat(page.getByTestId("restaurant-index-create-button")).not().isVisible();
    assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-name")).not().isVisible();
  }
}
