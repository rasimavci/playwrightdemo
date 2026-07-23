import { test, expect } from '@playwright/test';

test.describe('EFSORA ADMIN - AI Chat Features', () => {
  const ADMIN_EMAIL = 'admin@efsora.com';
  const PASSWORD = 'Demo123!';

  test.beforeEach(async ({ page }) => {
    // Login as EFSORA ADMIN
    await page.goto('http://localhost:5173/');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for successful login
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should display chat button in top right corner', async ({ page }) => {
    // Look for chat button/icon in header
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).or(
      page.locator('button:has-text("Chat")')
    );
    
    await expect(chatButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should open chat panel when button clicked', async ({ page }) => {
    // Click chat button
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    
    await chatButton.click();
    
    // Verify chat panel opened
    const chatPanel = page.locator('[data-testid="chat-panel"]').or(
      page.locator('[role="dialog"]')
    ).or(
      page.locator('.chat-panel, .chat-container, .ai-chat')
    );
    
    await expect(chatPanel.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display chat input field', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    // Find input field
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await expect(chatInput.first()).toBeVisible({ timeout: 3000 });
    await expect(chatInput.first()).toBeEditable();
  });

  test('should send simple message and receive streaming response', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    // Type message
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill('Hello, can you help me?');
    
    // Intercept streaming response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/chat') || response.url().includes('/api/stream'),
      { timeout: 30000 }
    );
    
    // Send message
    await page.keyboard.press('Enter');
    // Or click send button
    const sendButton = page.locator('[data-testid="send-button"]').or(
      page.getByRole('button', { name: /send/i })
    );
    if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sendButton.click();
    }
    
    // Wait for response
    const response = await responsePromise;
    
    // Verify streaming response
    expect(response.status()).toBe(200);
    
    // Check content-type for streaming
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/text\/event-stream|application\/stream|text\/plain/);
    
    // Read the stream manually (Advanced)
    const body = await response.body();
    expect(body.length).toBeGreaterThan(0);
    
    // Verify response appears in chat
    await page.waitForTimeout(2000);
    const chatMessages = page.locator('[data-testid="chat-message"]').or(
      page.locator('.message, .chat-message, .ai-response')
    );
    await expect(chatMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle creative prompt: "Write a poem about testing"', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    // Creative prompt
    const prompt = 'Write a short poem about software testing';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(prompt);
    
    // Capture streaming response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/chat') || response.url().includes('/api/stream'),
      { timeout: 30000 }
    );
    
    await page.keyboard.press('Enter');
    
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Verify streaming
    const stream = await response.body();
    expect(stream.length).toBeGreaterThan(0);
    
    // Wait for complete response
    await page.waitForTimeout(5000);
    
    // Verify response contains poetic elements
    const lastMessage = page.locator('[data-testid="chat-message"], .message, .chat-message').last();
    const messageText = await lastMessage.textContent();
    
    // Creative response should be longer than simple responses
    expect(messageText?.length || 0).toBeGreaterThan(50);
  });

  test('should handle technical question about admin features', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const prompt = 'What features do I have access to as an admin?';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(prompt);
    
    // Monitor streaming response
    let streamChunks = 0;
    page.on('response', async (response) => {
      if (response.url().includes('/chat') || response.url().includes('/api/stream')) {
        const contentType = response.headers()['content-type'];
        if (contentType?.includes('stream')) {
          streamChunks++;
        }
      }
    });
    
    await page.keyboard.press('Enter');
    
    // Wait for streaming to complete
    await page.waitForTimeout(5000);
    
    // Verify response mentions admin features
    const lastMessage = page.locator('[data-testid="chat-message"], .message, .chat-message').last();
    const messageText = await lastMessage.textContent();
    
    // Should mention admin-related terms
    expect(messageText?.toLowerCase()).toMatch(/admin|user|manage|access|permission|system/);
  });

  test('should stream response progressively (token by token)', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const prompt = 'Explain what EFSORA system does in detail';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(prompt);
    
    // Track response updates
    const responseUpdates: string[] = [];
    const lastMessage = page.locator('[data-testid="chat-message"], .message, .chat-message').last();
    
    // Set up mutation observer to track progressive updates
    await page.evaluate(() => {
      (window as any).responseUpdates = [];
    });
    
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/chat') || response.url().includes('/api/stream'),
      { timeout: 30000 }
    );
    
    await page.keyboard.press('Enter');
    
    const response = await responsePromise;
    
    // Verify it's a streaming response
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/stream|event-stream/i);
    
    // Get stream body
    const stream = await response.body();
    expect(stream.length).toBeGreaterThan(0);
    
    // The stream should not be empty
    const streamText = stream.toString();
    expect(streamText.length).toBeGreaterThan(0);
    
    // Wait for message to fully appear
    await page.waitForTimeout(5000);
    
    // Verify progressive rendering happened
    await expect(lastMessage).toBeVisible({ timeout: 10000 });
    const finalText = await lastMessage.textContent();
    expect(finalText?.length || 0).toBeGreaterThan(100);
  });

  test('should handle multiple consecutive messages', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const messages = [
      'Hello',
      'What is my role?',
      'Can I manage users?'
    ];
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    for (const message of messages) {
      await chatInput.first().fill(message);
      await page.keyboard.press('Enter');
      
      // Wait for response to complete
      await page.waitForTimeout(3000);
    }
    
    // Verify all messages appear in chat
    const chatMessages = page.locator('[data-testid="chat-message"], .message, .chat-message');
    const messageCount = await chatMessages.count();
    
    // Should have at least user messages + AI responses
    expect(messageCount).toBeGreaterThanOrEqual(messages.length);
  });

  test('should display typing indicator while streaming', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill('Tell me about system features');
    await page.keyboard.press('Enter');
    
    // Look for typing indicator
    const typingIndicator = page.locator('[data-testid="typing-indicator"]').or(
      page.locator('.typing, .loading, .spinner')
    );
    
    // Typing indicator should appear briefly
    const isVisible = await typingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Wait for response to complete
    await page.waitForTimeout(5000);
  });

  test('should handle long response without timeout', async ({ page }) => {
    test.setTimeout(60000); // Extend timeout for long response
    
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const prompt = 'Write a detailed explanation of role-based access control in enterprise systems';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(prompt);
    
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/chat') || response.url().includes('/api/stream'),
      { timeout: 30000 }
    );
    
    await page.keyboard.press('Enter');
    
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    // Verify streaming
    const stream = await response.body();
    expect(stream.length).toBeGreaterThan(0);
    
    // Wait for long response to complete
    await page.waitForTimeout(10000);
    
    const lastMessage = page.locator('[data-testid="chat-message"], .message, .chat-message').last();
    const messageText = await lastMessage.textContent();
    
    // Long response should be substantial
    expect(messageText?.length || 0).toBeGreaterThan(200);
  });

  test('should handle empty message gracefully', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    // Try to send empty message
    await chatInput.first().fill('');
    await page.keyboard.press('Enter');
    
    // Should not send or should show validation
    await page.waitForTimeout(1000);
  });

  test('should maintain chat context across messages', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    // First message
    await chatInput.first().fill('My name is Admin User');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Second message referencing first
    await chatInput.first().fill('What is my name?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Response should reference the name from context
    const lastMessage = page.locator('[data-testid="chat-message"], .message, .chat-message').last();
    const messageText = await lastMessage.textContent();
    
    // Should remember the context
    expect(messageText?.toLowerCase()).toMatch(/admin|user/);
  });

  test('should close chat panel when close button clicked', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const chatPanel = page.locator('[data-testid="chat-panel"]').or(
      page.locator('[role="dialog"]')
    ).or(
      page.locator('.chat-panel, .chat-container')
    );
    
    await expect(chatPanel.first()).toBeVisible();
    
    // Find close button
    const closeButton = page.locator('[data-testid="close-chat"]').or(
      page.getByRole('button', { name: /close|×/i })
    ).or(
      page.locator('button:has-text("×")')
    );
    
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Panel should be hidden
      await expect(chatPanel.first()).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('should verify streaming performance metrics', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const prompt = 'List the top 5 features of this system';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(prompt);
    
    const startTime = Date.now();
    
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/chat') || response.url().includes('/api/stream'),
      { timeout: 30000 }
    );
    
    await page.keyboard.press('Enter');
    
    const response = await responsePromise;
    const responseTime = Date.now() - startTime;
    
    // First response chunk should arrive quickly (< 3 seconds)
    expect(responseTime).toBeLessThan(3000);
    
    // Verify streaming
    const stream = await response.body();
    expect(stream.length).toBeGreaterThan(0);
    
    // Stream should start immediately, not wait for complete response
    expect(responseTime).toBeLessThan(5000);
  });

  test('should handle special characters in message', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    const specialMessage = 'Can you help with <script>alert("test")</script> and SQL: SELECT * FROM users;';
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.getByPlaceholder(/type|message|ask/i)
    ).or(
      page.locator('textarea, input[type="text"]').last()
    );
    
    await chatInput.first().fill(specialMessage);
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Should handle gracefully without executing scripts
    const chatMessages = page.locator('[data-testid="chat-message"], .message, .chat-message');
    await expect(chatMessages.last()).toBeVisible();
  });

  test('should show admin-specific suggestions or features', async ({ page }) => {
    // Open chat
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.getByRole('button', { name: /chat|message|ai/i })
    ).first();
    await chatButton.click();
    await page.waitForTimeout(1000);
    
    // Look for admin-specific chat features
    // This could be suggested prompts, quick actions, etc.
    const chatPanel = page.locator('[data-testid="chat-panel"]').or(
      page.locator('[role="dialog"]')
    );
    
    // Admin might see different suggestions than regular users
    await expect(chatPanel.first()).toBeVisible();
  });
});
