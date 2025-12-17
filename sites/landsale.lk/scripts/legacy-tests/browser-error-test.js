const puppeteer = require('puppeteer');

async function testPayHerePage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('Browser page error:', error.message);
  });
  
  // Enable network logging
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`Network error: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('Navigating to PayHere test page...');
    await page.goto('http://localhost:3000/dashboard/payments/test', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded successfully');
    
    // Wait for the page to fully load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check for PayHere SDK errors
    const payHereErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for PayHere SDK errors
      const payHereElements = document.querySelectorAll('[id*="payhere"]');
      if (payHereElements.length === 0) {
        errors.push('No PayHere elements found');
      } else {
        errors.push(`Found ${payHereElements.length} PayHere elements`);
      }
      
      // Check for specific error messages
      const errorElements = document.querySelectorAll('.error, .Error, [data-error]');
      errorElements.forEach(el => {
        errors.push(`Error element: ${el.textContent}`);
      });
      
      // Check for console errors in browser
      if (window.payhere) {
        errors.push('PayHere SDK loaded successfully');
      } else {
        errors.push('PayHere SDK not found in window object');
      }
      
      return errors;
    });
    
    console.log('PayHere status:', payHereErrors);
    
    // Get page title and content
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasPaymentButton: !!document.querySelector('button[type="submit"]'),
        hasPayHereModal: !!document.querySelector('[id*="payhere"]'),
        pageContent: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('Page info:', pageInfo);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'payhere-test-screenshot.png', fullPage: true });
    console.log('Screenshot saved as payhere-test-screenshot.png');
    
    // Test if there's a payment button and click it
    if (pageInfo.hasPaymentButton) {
      console.log('Testing payment button...');
      await page.click('button[type="submit"]');
      
      // Wait a bit for any modal to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for modal or payment dialog after click
      const modalCheck = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [id*="payhere"]');
        return {
          modalCount: modals.length,
          modalText: Array.from(modals).map(m => m.textContent?.substring(0, 100))
        };
      });
      
      console.log('Modal detection after click:', modalCheck);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testPayHerePage().catch(console.error);