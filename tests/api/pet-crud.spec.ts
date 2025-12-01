import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' }); 

test.describe('Petstore CRUD API Tests', () => {

  let petId: number;

  const baseURL = 'https://petstore.swagger.io/v2';

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  test('1. Create Pet', async ({ request }) => {
    const payload = {
      id: Date.now(),
      category: { id: 0, name: "string" },
      name: "doggie",
      photoUrls: ["string"],
      tags: [{ id: 0, name: "string" }],
      status: "available"
    };

    const response = await request.post(`${baseURL}/pet`, {
      data: payload,
      headers
    });

    expect(response.status()).toBe(200);

    const json = await response.json();

    // store id for next tests
    petId = json.id;

    // Assertions
    expect(json.id).toBe(payload.id);
    expect(json.name).toBe('doggie');
    expect(json.category.name).toBe('string');
    expect(json.status).toBe('available');
    expect(json.photoUrls.length).toBe(1);
  });

  test('2. Get Pet by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/pet/${petId}`, {
      headers
    });

    expect(response.status()).toBe(200);

    const json = await response.json();

    expect(json.id).toBe(petId);
    expect(json.name).toBe('doggie');
    expect(json.status).toBe('available');
  });

  test('3. Update Pet', async ({ request }) => {
    const updatedPayload = {
      id: petId,
      category: { id: 1, name: "updated-category" },
      name: "doggie-updated",
      photoUrls: ["updated-photo"],
      tags: [{ id: 1, name: "updated-tag" }],
      status: "sold"
    };

    const response = await request.put(`${baseURL}/pet`, {
      data: updatedPayload,
      headers
    });

    expect(response.status()).toBe(200);

    const json = await response.json();

    // Assertions
    expect(json.id).toBe(petId);
    expect(json.name).toBe("doggie-updated");
    expect(json.status).toBe("sold");
    expect(json.category.name).toBe("updated-category");
    expect(json.tags[0].name).toBe("updated-tag");
  });

  test('4. Delete Pet', async ({ request }) => {
    const response = await request.delete(`${baseURL}/pet/${petId}`, {
      headers
    });

    // Petstore usually returns 200 on delete
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain("Pet deleted");
  });

  test('5. Verify Deleted Pet Cannot Be Retrieved', async ({ request }) => {
    const response = await request.get(`${baseURL}/pet/${petId}`, {
      headers
    });

    // Petstore returns 404 for deleted pets
    expect(response.status()).toBe(404);

    const json = await response.json();
    expect(json.message).toContain("Pet not found");
  });

});
