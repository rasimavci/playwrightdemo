import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' }); 

test.describe('Petstore CRUD with console logs', () => {

  const petId: number = 999; //Date.now();
  const baseURL = 'https://petstore.swagger.io/v2';

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };



  test('1. CREATE PET', async ({ request }) => {
    const payload = {
      id: petId,
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

    console.log("CREATE STATUS:", response.status());
    const body = await response.json();
    console.log("CREATE BODY:", body);

    expect(response.status()).toBe(200);


  });
  

  test('2. GET PET BY ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/pet/${petId}`, { headers });

    console.log("GET STATUS:", response.status());
    const body = await response.json();
    console.log("GET BODY:", body);

    expect(response.status()).toBe(200);
    expect(body.id).toBe(petId);
    expect(body.name).toBe("doggie");
  });

  test('3. UPDATE PET', async ({ request }) => {
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

    console.log("UPDATE STATUS:", response.status());
    const body = await response.json();
    console.log("UPDATE BODY:", body);

    expect(response.status()).toBe(200);
    expect(body.name).toBe("doggie-updated");
    expect(body.status).toBe("sold");
  });

  test('4. GET UPDATED PET BY ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/pet/${petId}`, { headers });

    console.log("GET UPDATED STATUS:", response.status());
    const body = await response.json();
    console.log("GET UPDATED BODY:", body);

    expect(response.status()).toBe(200);
    expect(body.id).toBe(petId);
    expect(body.name).toBe("doggie-updated");
    expect(body.status).toBe("sold");
  });

  test('5. DELETE PET', async ({ request }) => {
    const response = await request.delete(`${baseURL}/pet/${petId}`, { headers });

    console.log("DELETE STATUS:", response.status());
    const text = await response.text();
    console.log("DELETE BODY:", text);

    // Petstore often returns 200 OR 404.
    expect([200, 404]).toContain(response.status());
  });

  test('6. GET DELETED PET', async ({ request }) => {
    const response = await request.get(`${baseURL}/pet/${petId}`, { headers });

    console.log("GET AFTER DELETE STATUS:", response.status());
    const body = await response.text();
    console.log("GET AFTER DELETE BODY:", body);

    expect(response.status()).toBe(404);
  });

});
