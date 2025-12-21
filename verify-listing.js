const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting "Verify Listing Creation" Proof Script...');
  const browser = await chromium.launch({ headless: false }); // Headless: false to see what's happening
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to browser console logs
  page.on('console', msg => console.log('Browser Console:', msg.text()));
  page.on('pageerror', err => console.error('Browser Error:', err));

  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'Password123!',
  };

  try {
    // 1. Register a new user
    console.log(`👤 Registering new user: ${testUser.email}`);
    await page.goto(`${baseUrl}/auth/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Submit registration
    await Promise.all([
      page.waitForURL(`${baseUrl}/dashboard`), // Wait for redirect to dashboard
      page.click('button[type="submit"]')
    ]);
    console.log('✅ Registration successful! Redirected to Dashboard.');

    // 2. Navigate to Create Listing
    console.log('🏠 Navigating to /properties/create...');
    await page.goto(`${baseUrl}/properties/create`, { waitUntil: 'networkidle' });

    // 3. Step 1: Property Type & Location
    console.log('📝 Step 1: Selecting Property Type...');
    // Select "House" (should be default, but let's click it)
    await page.click('button:has-text("House")'); 
    // Select "For Sale" (should be default)
    await page.click('button:has-text("For Sale")');
    // Enter Location
    await page.fill('input[name="location"]', 'Colombo 7, Test Location');
    await page.click('button:has-text("Continue")');
    
    // 4. Step 2: Agent Matching (Skip)
    console.log('🕵️ Step 2: Skipping Agent Matching...');
    // If "Find Me an Agent" button is visible, click "Continue" (Wait, usually there is a skip or continue button)
    // Looking at the code: "Continue" button is at the bottom navigation.
    // We just click "Continue" to go to Step 3.
    // Wait for animation if any
    await page.waitForTimeout(1000); 
    await page.click('button:has-text("Continue")');

    // 5. Step 3: Property Details
    console.log('📋 Step 3: Filling Property Details...');
    await page.fill('input[name="title"]', `Test Listing ${timestamp}`);
    await page.fill('input[name="price"]', '50000000');
    // Fill extended fields if they exist (based on recent code changes)
    // Beds, Baths, Sqft are in a grid
    if (await page.isVisible('input[name="beds"]')) await page.fill('input[name="beds"]', '3');
    if (await page.isVisible('input[name="baths"]')) await page.fill('input[name="baths"]', '2');
    if (await page.isVisible('input[name="size_sqft"]')) await page.fill('input[name="size_sqft"]', '2000');
    if (await page.isVisible('input[name="perch_size"]')) await page.fill('input[name="perch_size"]', '10');
    
    await page.fill('textarea[name="description"]', 'This is a test listing created by the automated verification script.');
    await page.click('button:has-text("Continue")');

    // 6. Step 4: Photos & Contact
    console.log('📸 Step 4: Uploading Mock Image & Contact Info...');
    
    // Create a dummy image file
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const imagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(imagePath, buffer);

    // Upload image
    // The input is hidden: input[type="file"]
    await page.setInputFiles('input[type="file"]', imagePath);
    
    // Wait for image to appear in preview (optional but good)
    await page.waitForSelector('img[alt^="Uploaded image"]', { timeout: 5000 });

    // Fill Contact Info
    await page.fill('input[name="contact_name"]', testUser.name);
    await page.fill('input[name="contact_phone"]', '0771234567');
    
    // Owner Info (if visible)
    if (await page.isVisible('input[name="owner_phone"]')) {
        await page.fill('input[name="owner_phone"]', '0777654321');
    }
    
    // 7. Submit
    console.log('🚀 Submitting Listing...');
    await page.click('button:has-text("Publish Listing")');

    // 8. Verify Success
    // Wait for success modal OR error toast
    console.log('⏳ Waiting for submission result...');
    
    // Race condition check
    const successSelector = 'text=Listing Created!';
    const errorSelector = 'li[data-type="error"]'; // Sonner toast error
    const anyToast = 'li[data-sonner-toast]';

    try {
        const result = await Promise.race([
            page.waitForSelector(successSelector, { timeout: 30000 }),
            page.waitForSelector(errorSelector, { timeout: 30000 })
        ]);

        const text = await result.innerText();
        console.log(`🔎 Result found: "${text}"`);

        if (await page.$(errorSelector)) {
             throw new Error(`Submission failed with toast: ${text}`);
        }

        console.log('✅ SUCCESS: "Listing Created!" modal appeared.');
        await page.screenshot({ path: 'proof-listing-success.png' });
        
    } catch (e) {
        console.error('❌ FAILURE: Success message not found or Error occurred.');
        // Check for any visible text that looks like an error
        const bodyText = await page.innerText('body');
        if (bodyText.includes('Failed')) {
             console.error('Found "Failed" in body text');
        }
        await page.screenshot({ path: 'failure-listing.png' });
        throw e;
    }

    // Cleanup image
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

  } catch (error) {
    console.error('❌ Test Failed:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
})();
