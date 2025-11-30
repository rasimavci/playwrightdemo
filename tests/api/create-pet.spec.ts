import { test, expect } from '@playwright/test';

test('Create pet with correct Swagger headers', async ({ request }) => {
  const payload = {
    id: Date.now(),
    category: { id: 0, name: "string" },
    name: "doggie",
    photoUrls: ["string"],
    tags: [{ id: 0, name: "string" }],
    status: "available"
  };

  const response = await request.post('https://petstore.swagger.io/v2/pet', {
    data: payload,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  });

  console.log("STATUS:", response.status());
  console.log("BODY:", await response.text());

  expect(response.status()).toBe(200);
});
