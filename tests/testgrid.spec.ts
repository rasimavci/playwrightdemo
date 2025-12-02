const { chromium, test, expect , userAgent} = require("@playwright/test");


// Fake UA list
const USER_AGENTS = {
  chromium: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  ]
};

test("Testgrid.io Scenario", async ({ browser }) => {

  const browserName = "chromium";
  // ✅ Sadece Windows UA’lerini filtrele
  const windowsUAs = USER_AGENTS[browserName].filter(ua => ua.includes("Windows"));

  // İlk Windows UA’yi seç
  const userAgent = windowsUAs[0];

  const context = await browser.newContext({
    userAgent: userAgent,
  });

  const page = await context.newPage();

  //await page.goto("https://example.com");


// 1. Visit the Site https://testgrid.io/
await page.goto("https://public.testgrid.io/");

// 2. Login into the site with valid credentials
await page.fill('input[name="email"]', "rasim.avci@gmail.com");
await page.fill('input[name="password"]', "Test@1234");
await page.click('button:has-text("Sign in")');
await page.waitForTimeout(7000);


 // 3. Verify user is logged in by verifying the text "Dashboard"
await expect(page.locator("text=Dashboard")).toBeVisible();

// 4. Click on 'Codeless' link under Automation section
await page.click("text=Codeless");

// 5. Verify the text "Let's get you started with codeless automation"
await expect(
  page.locator("text=Lets get you started with codeless automation")
).toBeVisible();
await page.click('[id="testcase_back_button"]');

// 6. Open the link 'Real Device Cloud' in a new tab and then back to the parent page
const [newPage] = await Promise.all([
  context.waitForEvent("page"),
  page.click("text=Real Device Cloud"),
]);
await newPage.waitForLoadState("domcontentloaded");
await newPage.close();
await page.bringToFront();

// 7. Verify the text "Selenium" to make sure the user is back on the parent page
await expect(page.locator("text=Selenium")).toBeVisible();

// 8. Logout from the application
await page.click('[data-toggle="dropdown"]');
page.click("text=Logout");
await expect(page.locator("text=ForgotPassword?")).toBeVisible();
await context.close();
});