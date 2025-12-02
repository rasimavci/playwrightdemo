import {test, expect} from '@playwright/test';

    test.beforeEach(async ({page}) => {
        await page.goto('https://demo.playwright.dev/todomvc/');
    });


const TODO_ITEMS = [
    'buy some cheese',
    'feed the cat',
    'book a doctors appointment'
];

test.describe('New Todo', () => {
    
    test('should allow me to add todo items', async ({page}) => {

        const newTodo = page.getByPlaceholder('What needs to be done?');

        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');
        await page.waitForTimeout(3000);

        //make sure only one todo item is added
        await expect(page.getByTestId('todo-item')).toHaveText('buy some cheese');
        await expect(page.getByTestId('todo-item')).toHaveCount(1);
})



});




const TODO_URL = 'https://demo.playwright.dev/todomvc/';

test.describe('TodoMVC basic flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TODO_URL);
  });

  test('should add a single todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.click();
    await input.fill('Buy milk');
    await input.press('Enter');

    // Expect the new todo item to appear
    await expect(page.getByText('Buy milk')).toBeVisible();
    // Expect count
    await expect(page.getByTestId('todo-count')).toContainText('1 item');
  });

  test('should add multiple todos and mark first completed', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    const items = ['Task A', 'Task B', 'Task C'];

    for (const item of items) {
      await input.fill(item);
      await input.press('Enter');
    }

    // Expect 3 items
    await expect(page.locator('.todo-list li')).toHaveCount(3);

    // Mark first as completed
    const firstToggle = page.locator('.todo-list li').first().locator('.toggle');
    await firstToggle.check();

    // Filter completed
    await page.getByRole('link', { name: 'Completed' }).click();

    // Expect only one item visible and its text
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText('Task A');
  });

  test('should delete a todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('Temp task');
    await input.press('Enter');
    await expect(page.getByText('Temp task')).toBeVisible();

    // Hover to show delete button and click it
    const todo = page.locator('.todo-list li').filter({ hasText: 'Temp task' });
    await todo.hover();
    await todo.getByLabel('Delete').click();

    // Expect it gone
    await expect(page.getByText('Temp task')).toHaveCount(0);
    // Expect count shows 0 items left
    // Depending on app UI, maybe there is no count; adapt if needed
  });

  test('should cross check persistence after reload', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Persisted task');
    await input.press('Enter');
    await expect(page.getByText('Persisted task')).toBeVisible();

    // Reload page
    await page.reload();

    // Expect task still present
    await expect(page.getByText('Persisted task')).toBeVisible();


  });

});

