import { test, expect } from '@playwright/test';

/**
 * API Authorization Security Tests
 * 
 * Bu testler farklı kullanıcı rollerinin API endpoint'lerine erişim yetkilerini kontrol eder.
 * 
 * Test Kullanıcıları:
 * 1. admin@efsora.com - EFSORA_ADMIN (Tüm sistem erişimi)
 * 2. customeradmin@apex.com - CUSTOMER (Apex şirketi erişimi)
 * 3. sarah.wilson@apex.com - CUSTOMER (Sınırlı Apex erişimi)
 * 4. customer@demo.com - CUSTOMER (Demo şirketi erişimi)
 */

// Helper function to login via UI and get session
async function loginAndGetSession(page, email: string, password: string = 'Demo123!') {
  await page.goto('http://localhost:5174/');
  
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for navigation after login
  // await page.waitForURL('**/dashboard', { timeout: 5000 });
  
  // Get cookies/storage for API requests
  const cookies = await page.context().cookies();
  const storage = await page.context().storageState();
  
  return { cookies, storage };
}

test.describe('Security Tests - EFSORA_ADMIN Access', () => {
  test('EFSORA_ADMIN should access all users endpoint', async ({ page, context }) => {
    // Login as admin
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Make API request to get all users
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    
    // Admin should see all users with full details
    console.log(`✅ Admin can access all users: ${users.length} users found`);
  });

  test('EFSORA_ADMIN should access all companies', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.ok()).toBeTruthy();
    const companies = await response.json();
    expect(Array.isArray(companies)).toBeTruthy();
    
    // Admin should see ALL companies (Efsora, Apex, TechCorp, Demo, etc.)
    console.log(`✅ Admin can see all companies: ${companies.length} companies`);
  });

  test('EFSORA_ADMIN should access all companies customers', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies/customers');
    
    expect(response.ok()).toBeTruthy();
    const customers = await response.json();
    expect(Array.isArray(customers)).toBeTruthy();
    
    console.log(`✅ Admin can see all customer companies: ${customers.length} customers`);
  });

  test('EFSORA_ADMIN should access all project teams', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Test multiple project IDs
    const projectIds = [1, 2, 3];
    
    for (const projectId of projectIds) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects/team?projectId=${projectId}`
      );
      
      expect(response.ok()).toBeTruthy();
      const teamData = await response.json();
      
      console.log(`✅ Admin can access project ${projectId} team data`);
    }
  });
});

test.describe('Security Tests - CUSTOMER Access (Apex Admin)', () => {
  test('CUSTOMER should NOT access all users endpoint', async ({ page, context }) => {
    // Login as customer
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all users - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    // ❌ BU TEST ŞU ANDA FAIL EDECEK - Çünkü endpoint yetkisiz erişime açık
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`Current status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should only see their own company data', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.ok()).toBeTruthy();
    const companies = await response.json();
    
    // Customer should only see Apex company
    expect(Array.isArray(companies)).toBeTruthy();
    
    // Check if only Apex company is returned
    const apexCompany = companies.find(c => c.name?.toLowerCase().includes('apex'));
    expect(apexCompany).toBeDefined();
    
    // Should NOT see Efsora internal company
    const efsoraCompany = companies.find(c => c.name?.toLowerCase().includes('efsora'));
    expect(efsoraCompany).toBeUndefined();
    
    console.log(`✅ Customer sees only their company: ${companies.length} company(ies)`);
  });

  test('CUSTOMER should only access their own projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // customeradmin@apex.com should see: Apex Mobile (ID:1) + Apex Analytics
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=1'
    );
    
    expect(response.ok()).toBeTruthy();
    
    // Try to access Efsora internal project (ID:2) - should be blocked
    const unauthorizedResponse = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=2'
    );
    
    // Should return 403 or empty data
    if (!unauthorizedResponse.ok()) {
      expect(unauthorizedResponse.status()).toBe(403);
      console.log('✅ Customer blocked from accessing other company projects');
    } else {
      const data = await unauthorizedResponse.json();
      // Or should return empty/filtered data
      expect(data).toEqual({});
      console.log('✅ Customer receives empty data for unauthorized projects');
    }
  });

  test('CUSTOMER should NOT access all customers endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies/customers');
    
    // Customer should not see all customers - only their own
    if (response.ok()) {
      const customers = await response.json();
      expect(customers.length).toBeLessThanOrEqual(1); // Should only see own company
    } else {
      expect(response.status()).toBe(403);
    }
  });
});

test.describe('Security Tests - CUSTOMER Access (Sarah Wilson)', () => {
  test('Sarah should only see her assigned projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    // sarah.wilson@apex.com sees: Apex Web Portal + Apex Analytics
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.ok()).toBeTruthy();
    const companies = await response.json();
    
    // Should only see Apex company
    expect(companies.length).toBeLessThanOrEqual(1);
    
    if (companies.length > 0) {
      expect(companies[0].name).toContain('Apex');
    }
  });

  test('Sarah should NOT access projects she is not assigned to', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    // Sarah should NOT see TechCorp Dashboard (ID:3)
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=3'
    );
    
    if (!response.ok()) {
      expect(response.status()).toBe(403);
    } else {
      const data = await response.json();
      expect(data).toEqual({});
    }
  });

  test('Sarah should NOT access all users endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    // Should be blocked
    expect(response.status()).toBe(403);
  });
});

test.describe('Security Tests - CUSTOMER Access (Demo User)', () => {
  test('Demo customer should only see demo company', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.ok()).toBeTruthy();
    const companies = await response.json();
    
    // Should only see Demo company
    expect(companies.length).toBeLessThanOrEqual(1);
    
    // Should NOT see Apex or other companies
    const apexCompany = companies.find(c => c.name?.toLowerCase().includes('apex'));
    expect(apexCompany).toBeUndefined();
  });

  test('Demo customer should NOT access other companies projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    // Try to access Apex project
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=1'
    );
    
    if (!response.ok()) {
      expect(response.status()).toBe(403);
    } else {
      const data = await response.json();
      expect(data).toEqual({});
    }
  });
});

test.describe('Security Tests - Cross-Account Validation', () => {
  test('Customer A should not see Customer B data', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    const companies = await response.json();
    
    // Should not contain TechCorp or Demo companies
    const techCorpCompany = companies.find(c => c.name?.toLowerCase().includes('techcorp'));
    const demoCompany = companies.find(c => c.name?.toLowerCase().includes('demo'));
    
    expect(techCorpCompany).toBeUndefined();
    expect(demoCompany).toBeUndefined();
    
    console.log('✅ Customer A cannot see Customer B data');
  });

  test('Unauthenticated access should be blocked', async ({ request }) => {
    // Try to access API without authentication
    const response = await request.get('http://localhost:3000/api/v1/users');
    
    expect(response.status()).toBe(401); // Unauthorized
    console.log('✅ Unauthenticated requests are blocked');
  });
});

test.describe('Security Tests - Data Leakage Prevention', () => {
  test('API responses should not contain sensitive admin fields for customers', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    if (response.ok()) {
      const companies = await response.json();
      
      // Check that sensitive fields are not exposed
      companies.forEach(company => {
        // These fields should not be visible to customers
        expect(company).not.toHaveProperty('internalNotes');
        expect(company).not.toHaveProperty('billingDetails');
        expect(company).not.toHaveProperty('adminEmails');
      });
    }
  });

  test('Error messages should not leak system information', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access invalid endpoint
    const response = await context.request.get('http://localhost:3000/api/v1/admin/secrets');
    
    if (!response.ok()) {
      const errorBody = await response.text();
      
      // Error should not contain stack traces or system paths
      expect(errorBody).not.toContain('at Object');
      expect(errorBody).not.toContain('node_modules');
      expect(errorBody).not.toContain('C:\\');
      expect(errorBody).not.toContain('/var/www');
    }
  });
});
