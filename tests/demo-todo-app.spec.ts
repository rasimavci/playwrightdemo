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