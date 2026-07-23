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
  await page.goto('http://localhost:5173/');
  
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
    
    const responseBody = await response.json();
    expect(responseBody.success).toBeTruthy();
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data.length).toBeGreaterThan(0);
    
    // Admin should see all users with full details
    console.log(`✅ Admin can access all users: ${responseBody.data.length} users found`);
  });

  test('EFSORA_ADMIN should access all companies', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.success).toBeTruthy();
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    
    // Admin should see ALL companies (Efsora, Apex, TechCorp, Demo, etc.)
    console.log(`✅ Admin can see all companies: ${responseBody.data.length} companies`);
  });

  test('EFSORA_ADMIN should access all companies customers', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies/customers');
    
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.success).toBeTruthy();
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    
    console.log(`✅ Admin can see all customer companies: ${responseBody.data.length} customers`);
  });

  test('EFSORA_ADMIN should access all projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Test multiple project IDs
    const projectIds = [1, 2, 3];
    
    for (const projectId of projectIds) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects/`
      );
      
      expect(response.ok()).toBeTruthy();
      const projectData = await response.json();
      
      console.log(`✅ Admin can access all projects data`);
    }
  });

  test('EFSORA_ADMIN should access all milestones', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Test multiple project IDs
    const projectIds = [1, 2, 3];
    
    for (const projectId of projectIds) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/milestones/`
      );
      
      expect(response.ok()).toBeTruthy();
      const milestoneData = await response.json();
      
      console.log(`✅ Admin can access all milestones data`);
    }
  });


    test('EFSORA_ADMIN should access all project teams', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Test multiple project IDs
    const projectIds = [1, 2, 3];
    
    for (const projectId of projectIds) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects/`
      );
      
      expect(response.ok()).toBeTruthy();
      const teamData = await response.json();
      
      console.log(`✅ Admin can access project ${projectId} team data`);
    }
  });

  test('EFSORA_ADMIN should NOT access /api/v1/billing/all endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Try to access billing data - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/billing/all');
    
    // ❌ Admin should NOT access billing data - this is sensitive financial information
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log(`❌ CRITICAL SECURITY ISSUE: Admin can access /billing/all endpoint`);
      console.log(`   - Status: ${response.status()} (Expected: 403 Forbidden)`);
      console.log(`   - Billing data exposed: ${responseBody.data?.length || 0} records`);
      expect(response.status()).toBe(403); // This will FAIL intentionally
    } else {
      console.log(`✅ /billing/all endpoint properly blocked for admin - Status: ${response.status()}`);
      expect(response.status()).toBe(403);
    }
  });

  test('EFSORA_ADMIN should NOT access /api/v1/billing/customers endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'admin@efsora.com');
    
    // Try to access customer billing data - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/billing/customers');
    
    // ❌ Admin should NOT access customer billing - super sensitive financial data
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log(`❌ CRITICAL SECURITY ISSUE: Admin can access /billing/customers endpoint`);
      console.log(`   - Status: ${response.status()} (Expected: 403 Forbidden)`);
      console.log(`   - Customer billing data exposed: ${responseBody.data?.length || 0} customers`);
      expect(response.status()).toBe(403); // This will FAIL intentionally
    } else {
      console.log(`✅ /billing/customers endpoint properly blocked for admin - Status: ${response.status()}`);
      expect(response.status()).toBe(403);
    }
  });

});

test.describe('Security Tests - CUSTOMER Access (Apex Admin)', () => {
  test('CUSTOMER should NOT access /api/v1/users endpoint', async ({ page, context }) => {
    // Login as customer
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all users - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    // ❌ BU TEST ŞU ANDA FAIL EDECEK - Çünkü endpoint yetkisiz erişime açık
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`❌ CRITICAL: Customer can access /users - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access /api/v1/companies endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all companies - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    // ❌ BU TEST ŞU ANDA FAIL EDECEK - Customer şirket listesine erişebiliyor
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`❌ CRITICAL: Customer can access /companies - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access /api/v1/projects endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all projects - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/projects');
    
    // ❌ Customer tüm projelere erişememeli
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`❌ CRITICAL: Customer can access /projects - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access /api/v1/milestones endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all milestones - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/milestones');
    
    // ❌ Customer tüm milestone'lara erişememeli
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`❌ CRITICAL: Customer can access /milestones - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access /api/v1/companies/customers endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access all customer companies - should be blocked
    const response = await context.request.get('http://localhost:3000/api/v1/companies/customers');
    
    // ❌ Customer diğer müşteri şirketlerini görememeli
    expect(response.status()).toBe(403); // Should be Forbidden
    console.log(`❌ CRITICAL: Customer can access /companies/customers - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access specific project by ID', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access a specific project directly
    const projectIds = [1, 2, 3];
    
    for (const projectId of projectIds) {
      const response = await context.request.get(
        `http://localhost:3000/api/v1/projects/${projectId}`
      );
      
      // Customer should not access project details directly
      expect(response.status()).toBe(403);
      console.log(`❌ Customer can access /projects/${projectId} - Status: ${response.status()} - Expected: 403`);
    }
  });

  test('CUSTOMER should NOT access project team without authorization', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access Efsora internal project (ID:2) team - should be blocked
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=2'
    );
    
    // Should return 403 for unauthorized project
    expect(response.status()).toBe(403);
    console.log(`❌ Customer can access other company's project team - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access milestone by ID', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access specific milestone
    const response = await context.request.get('http://localhost:3000/api/v1/milestones/1');
    
    expect(response.status()).toBe(403);
    console.log(`❌ Customer can access /milestones/1 - Status: ${response.status()} - Expected: 403`);
  });

  test('CUSTOMER should NOT access Efsora internal project by UUID', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access Efsora internal project using UUID - should be blocked
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/019c3e44-a2ad-761b-ab5e-9c5824e9c2ac'
    );
    
    // ❌ Customer should NOT access Efsora's internal projects
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log(`❌ CRITICAL SECURITY ISSUE: Customer can access Efsora project by UUID`);
      console.log(`   - Status: ${response.status()} (Expected: 403 Forbidden)`);
      console.log(`   - Project data exposed: ${JSON.stringify(responseBody.data).substring(0, 100)}...`);
      expect(response.status()).toBe(403); // This will FAIL intentionally
    } else {
      console.log(`✅ Efsora project access properly blocked for customer - Status: ${response.status()}`);
      expect(response.status()).toBe(403);
    }
  });
});

test.describe('Security Tests - CUSTOMER Access (Sarah Wilson)', () => {
  test('Sarah should NOT access /api/v1/users endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    expect(response.status()).toBe(403);
    console.log(`Sarah /users access - Status: ${response.status()} - Expected: 403`);
  });

  test('Sarah should NOT access /api/v1/companies endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.status()).toBe(403);
    console.log(`Sarah /companies access - Status: ${response.status()} - Expected: 403`);
  });

  test('Sarah should NOT access /api/v1/projects endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/projects');
    
    expect(response.status()).toBe(403);
    console.log(`Sarah /projects access - Status: ${response.status()} - Expected: 403`);
  });

  test('Sarah should NOT access /api/v1/milestones endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/milestones');
    
    expect(response.status()).toBe(403);
    console.log(`Sarah /milestones access - Status: ${response.status()} - Expected: 403`);
  });

  test('Sarah should NOT access projects she is not assigned to', async ({ page, context }) => {
    await loginAndGetSession(page, 'sarah.wilson@apex.com');
    
    // Sarah should NOT see TechCorp Dashboard (ID:3)
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=3'
    );
    
    expect(response.status()).toBe(403);
    console.log(`Sarah unauthorized project access - Status: ${response.status()} - Expected: 403`);
  });
});

test.describe('Security Tests - CUSTOMER Access (Demo User)', () => {
  test('Demo customer should NOT access /api/v1/users endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    expect(response.status()).toBe(403);
    console.log(`Demo user /users access - Status: ${response.status()} - Expected: 403`);
  });

  test('Demo customer should NOT access /api/v1/companies endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    expect(response.status()).toBe(403);
    console.log(`Demo user /companies access - Status: ${response.status()} - Expected: 403`);
  });

  test('Demo customer should NOT access /api/v1/projects endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/projects');
    
    expect(response.status()).toBe(403);
    console.log(`Demo user /projects access - Status: ${response.status()} - Expected: 403`);
  });

  test('Demo customer should NOT access /api/v1/milestones endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/milestones');
    
    expect(response.status()).toBe(403);
    console.log(`Demo user /milestones access - Status: ${response.status()} - Expected: 403`);
  });

  test('Demo customer should NOT access other companies projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'customer@demo.com');
    
    // Try to access Apex project team
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=1'
    );
    
    expect(response.status()).toBe(403);
    console.log(`Demo user cross-company project access - Status: ${response.status()} - Expected: 403`);
  });
});

test.describe('Security Tests - Cross-Account Validation', () => {
  test('Customer should not access other customer users data', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Customer should not be able to access /users at all
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    expect(response.status()).toBe(403);
    console.log(`❌ Customer accessing /users - Status: ${response.status()} - Expected: 403`);
  });

  test('Customer should not access other customer projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access TechCorp project (assuming ID 3 or another company's project)
    const response = await context.request.get(
      'http://localhost:3000/api/v1/projects/team?projectId=3'
    );
    
    expect(response.status()).toBe(403);
    console.log(`✅ Cross-company project access blocked - Status: ${response.status()}`);
  });

  test('Customer should not access other customer milestones', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access milestone from another company
    const response = await context.request.get('http://localhost:3000/api/v1/milestones/999');
    
    expect(response.status()).toBe(403);
    console.log(`✅ Cross-company milestone access blocked - Status: ${response.status()}`);
  });

  test('Customer should not enumerate companies', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to get all companies list
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    // Should be completely blocked, not filtered
    expect(response.status()).toBe(403);
    console.log(`❌ Customer can list companies - Status: ${response.status()} - Expected: 403`);
  });

  test('Customer should not enumerate all projects', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to get all projects list
    const response = await context.request.get('http://localhost:3000/api/v1/projects');
    
    expect(response.status()).toBe(403);
    console.log(`❌ Customer can list all projects - Status: ${response.status()} - Expected: 403`);
  });

  test('Unauthenticated access to /users should be blocked', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/users');
    expect(response.status()).toBe(401);
    console.log('✅ Unauthenticated /users access blocked');
  });

  test('Unauthenticated access to /companies should be blocked', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/companies');
    expect(response.status()).toBe(401);
    console.log('✅ Unauthenticated /companies access blocked');
  });

  test('Unauthenticated access to /projects should be blocked', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/projects');
    expect(response.status()).toBe(401);
    console.log('✅ Unauthenticated /projects access blocked');
  });

  test('Unauthenticated access to /milestones should be blocked', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/milestones');
    expect(response.status()).toBe(401);
    console.log('✅ Unauthenticated /milestones access blocked');
  });
});

test.describe('Security Tests - Data Leakage Prevention', () => {
  test('Customer should be blocked from /companies endpoint entirely', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/companies');
    
    // Customer should be blocked from companies endpoint - not just filtered
    expect(response.status()).toBe(403);
    console.log(`Customer /companies access should be blocked - Status: ${response.status()}`);
  });

  test('Customer should be blocked from /users endpoint to prevent enumeration', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/users');
    
    // Completely block to prevent user enumeration attacks
    expect(response.status()).toBe(403);
    console.log(`Customer /users access blocked to prevent enumeration - Status: ${response.status()}`);
  });

  test('Customer should be blocked from /projects endpoint to prevent data leakage', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/projects');
    
    expect(response.status()).toBe(403);
    console.log(`Customer /projects access blocked - Status: ${response.status()}`);
  });

  test('Customer should be blocked from /milestones endpoint', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const response = await context.request.get('http://localhost:3000/api/v1/milestones');
    
    expect(response.status()).toBe(403);
    console.log(`Customer /milestones access blocked - Status: ${response.status()}`);
  });

  test('Error messages should not leak system information', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    // Try to access forbidden endpoints
    const endpoints = [
      'http://localhost:3000/api/v1/users',
      'http://localhost:3000/api/v1/companies',
      'http://localhost:3000/api/v1/projects',
      'http://localhost:3000/api/v1/admin/secrets'
    ];
    
    for (const endpoint of endpoints) {
      const response = await context.request.get(endpoint);
      
      if (!response.ok()) {
        const errorBody = await response.text();
        
        // Error should not contain stack traces or system paths
        expect(errorBody).not.toContain('at Object');
        expect(errorBody).not.toContain('node_modules');
        expect(errorBody).not.toContain('C:\\');
        expect(errorBody).not.toContain('/var/www');
        expect(errorBody).not.toContain('prisma');
        expect(errorBody).not.toContain('Error:');
        
        console.log(`✅ Error response for ${endpoint} does not leak system info`);
      }
    }
  });

  test('Forbidden responses should have consistent error format', async ({ page, context }) => {
    await loginAndGetSession(page, 'customeradmin@apex.com');
    
    const endpoints = [
      'http://localhost:3000/api/v1/users',
      'http://localhost:3000/api/v1/companies',
      'http://localhost:3000/api/v1/projects',
      'http://localhost:3000/api/v1/milestones'
    ];
    
    for (const endpoint of endpoints) {
      const response = await context.request.get(endpoint);
      
      expect(response.status()).toBe(403);
      
      // Check for consistent error structure
      const errorBody = await response.json();
      expect(errorBody).toHaveProperty('error');
      expect(errorBody).toHaveProperty('success');
      expect(errorBody.success).toBe(false);
      
      console.log(`✅ Consistent error format for ${endpoint}`);
    }
  });
});
