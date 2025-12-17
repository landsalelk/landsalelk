const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: false,
  slowMo: 100,
  timeout: 30000,
  viewport: { width: 1280, height: 720 }
};

// Test data
const TEST_DATA = {
  propertyId: 'test_property_real_123',
  propertyTitle: 'Luxury Villa in Colombo - Real Test',
  userId: 'test_user_real_123',
  userEmail: 'test@landsale.lk',
  userName: 'Test User',
  userPhone: '0771234567'
};

class PayHereIntegrationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  async init() {
    console.log('🚀 Starting PayHere Integration Test...\n');
    
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport(TEST_CONFIG.viewport);
    
    // Set up console monitoring
    this.page.on('console', (msg) => {
      const text = msg.text();
      console.log(`📄 Console [${msg.type()}]: ${text}`);
      
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console_error',
          message: text,
          timestamp: new Date().toISOString()
        });
      } else if (msg.type() === 'warning') {
        this.warnings.push({
          type: 'console_warning',
          message: text,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Monitor network requests
    this.page.on('request', (request) => {
      const url = request.url();
      if (url.includes('payhere')) {
        console.log(`🌐 PayHere Request: ${url}`);
      }
    });

    this.page.on('response', (response) => {
      const url = response.url();
      if (url.includes('payhere')) {
        const status = response.status();
        const statusText = status >= 400 ? '❌' : '✅';
        console.log(`${statusText} PayHere Response: ${url} (${status})`);
        
        if (status >= 400) {
          this.errors.push({
            type: 'network_error',
            url: url,
            status: status,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Monitor for JavaScript errors
    this.page.on('pageerror', (error) => {
      console.log(`❌ Page Error: ${error.message}`);
      this.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  async testPayHereSDKLoading() {
    console.log('📋 Test 1: Checking PayHere SDK Loading...');
    
    try {
      await this.page.goto(`${TEST_CONFIG.baseUrl}/dashboard/payments/test`);
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if PayHere SDK is available
      const payHereAvailable = await this.page.evaluate(() => {
        return {
          payhereGlobal: typeof window.payhere !== 'undefined',
          payHereEmbed: typeof window.PayHereEmbed !== 'undefined',
          payHereScriptLoaded: document.querySelector('script[src*="payhere"]') !== null
        };
      });
      
      console.log('PayHere SDK Status:', payHereAvailable);
      
      if (payHereAvailable.payhereGlobal) {
        this.successes.push('PayHere global object is available');
      } else {
        this.warnings.push('PayHere global object not found');
      }
      
      if (payHereAvailable.payHereEmbed) {
        this.successes.push('PayHere Embed SDK is available');
      } else {
        this.warnings.push('PayHere Embed SDK not found');
      }
      
      if (payHereAvailable.payHereScriptLoaded) {
        this.successes.push('PayHere script tag is loaded');
      } else {
        this.warnings.push('PayHere script tag not found');
      }
      
    } catch (error) {
      this.errors.push({
        type: 'sdk_loading_test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testPaymentButtonClick() {
    console.log('\n📋 Test 2: Testing Payment Button Click...');
    
    try {
      // Wait for the page to load
      await this.page.waitForSelector('button', { timeout: 10000 });
      
      // Find payment buttons
      const paymentButtons = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const paymentButtons = buttons.filter(button => 
          button.textContent.toLowerCase().includes('pay') ||
          button.textContent.toLowerCase().includes('boost') ||
          button.textContent.toLowerCase().includes('verify') ||
          button.textContent.toLowerCase().includes('get started')
        );
        return paymentButtons.map(btn => ({
          text: btn.textContent.trim(),
          id: btn.id,
          className: btn.className,
          disabled: btn.disabled
        }));
      });
      
      console.log('Found payment buttons:', paymentButtons);
      
      if (paymentButtons.length === 0) {
        this.warnings.push('No payment buttons found on the page');
        return;
      }
      
      // Click the first available payment button
      const firstButton = paymentButtons[0];
      console.log(`Clicking button: "${firstButton.text}"`);
      
      // Click the button using JavaScript
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const paymentButton = buttons.find(button => 
          button.textContent.toLowerCase().includes('pay') ||
          button.textContent.toLowerCase().includes('boost') ||
          button.textContent.toLowerCase().includes('verify') ||
          button.textContent.toLowerCase().includes('get started')
        );
        if (paymentButton) {
          paymentButton.click();
        }
      });
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for any errors or success indicators
      const result = await this.page.evaluate(() => {
        const errorElements = document.querySelectorAll('[class*="error"], [id*="error"]');
        const successElements = document.querySelectorAll('[class*="success"], [id*="success"]');
        const loadingElements = document.querySelectorAll('[class*="loading"], [id*="loading"]');
        
        return {
          hasErrors: errorElements.length > 0,
          hasSuccess: successElements.length > 0,
          isLoading: loadingElements.length > 0,
          currentUrl: window.location.href
        };
      });
      
      console.log('Payment button click result:', result);
      
      if (result.hasErrors) {
        this.warnings.push('Error indicators found after button click');
      }
      
      if (result.isLoading) {
        this.successes.push('Loading state detected after button click');
      }
      
      this.successes.push('Payment button clicked successfully');
      
    } catch (error) {
      this.errors.push({
        type: 'button_click_test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testPayHereModal() {
    console.log('\n📋 Test 3: Testing PayHere Modal/Popup...');
    
    try {
      // Wait for potential modal to appear
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check for PayHere modal or popup
      const payHereElements = await this.page.evaluate(() => {
        const selectors = [
          '[id*="payhere"]',
          '[class*="payhere"]',
          'iframe[src*="payhere"]',
          'div:has(iframe[src*="payhere"])'
        ];
        
        const elements = [];
        selectors.forEach(selector => {
          try {
            const found = document.querySelectorAll(selector);
            if (found.length > 0) {
              elements.push({
                selector: selector,
                count: found.length,
                visible: Array.from(found).some(el => el.offsetParent !== null)
              });
            }
          } catch (e) {
            // Ignore invalid selectors
          }
        });
        
        return elements;
      });
      
      console.log('PayHere elements found:', payHereElements);
      
      if (payHereElements.length > 0) {
        const visibleElements = payHereElements.filter(el => el.visible);
        if (visibleElements.length > 0) {
          this.successes.push('PayHere modal/popup is visible');
        } else {
          this.warnings.push('PayHere elements found but not visible');
        }
      } else {
        this.warnings.push('No PayHere modal/popup elements found');
      }
      
      // Check for any error messages
      const errorMessages = await this.page.evaluate(() => {
        const errorSelectors = [
          '.error',
          '.alert-error',
          '[class*="error"]',
          '[id*="error"]'
        ];
        
        const errors = [];
        errorSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent.trim()) {
              errors.push(el.textContent.trim());
            }
          });
        });
        
        return errors;
      });
      
      if (errorMessages.length > 0) {
        console.log('Error messages found:', errorMessages);
        errorMessages.forEach(msg => {
          this.errors.push({
            type: 'ui_error',
            message: msg,
            timestamp: new Date().toISOString()
          });
        });
      }
      
    } catch (error) {
      this.errors.push({
        type: 'modal_test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testPaymentAPI() {
    console.log('\n📋 Test 4: Testing Payment API Integration...');
    
    try {
      // Test the payment initiation API
      const apiResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/payments/start-onsite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: 'boost_weekly',
          orderId: `TEST_${Date.now()}`,
          userId: TEST_DATA.userId,
          userEmail: TEST_DATA.userEmail,
          userName: TEST_DATA.userName,
          userPhone: TEST_DATA.userPhone,
          propertyId: TEST_DATA.propertyId,
          useOnsiteCheckout: true
        })
      });
      
      const data = await apiResponse.json();
      console.log('Payment API Response:', {
        status: apiResponse.status,
        success: data.success,
        useOnsiteCheckout: data.useOnsiteCheckout,
        environment: data.environment,
        hasPaymentData: !!data.paymentData
      });
      
      if (data.success) {
        this.successes.push('Payment API is working correctly');
        
        if (data.useOnsiteCheckout) {
          this.successes.push('Onsite checkout is enabled');
        } else {
          this.warnings.push('Onsite checkout is disabled');
        }
        
        if (data.paymentData) {
          this.successes.push('Payment data is generated correctly');
          
          // Validate required payment fields
          const requiredFields = [
            'merchant_id', 'order_id', 'items', 'amount', 'currency',
            'first_name', 'last_name', 'email', 'phone', 'address',
            'city', 'country', 'hash'
          ];
          
          const missingFields = requiredFields.filter(field => !data.paymentData[field]);
          if (missingFields.length > 0) {
            this.warnings.push(`Missing payment fields: ${missingFields.join(', ')}`);
          } else {
            this.successes.push('All required payment fields are present');
          }
        }
      } else {
        this.errors.push({
          type: 'api_error',
          message: data.error || 'Payment API failed',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      this.errors.push({
        type: 'api_test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testConfig: TEST_CONFIG,
      testData: TEST_DATA,
      summary: {
        totalSuccesses: this.successes.length,
        totalWarnings: this.warnings.length,
        totalErrors: this.errors.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      },
      successes: this.successes,
      warnings: this.warnings,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'payhere-integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📋 Test Summary:');
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`📊 Overall Status: ${report.summary.status}`);
    
    console.log('\n🔍 Detailed Report:');
    console.log(`Report saved to: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.some(e => e.type === 'console_error' && e.message.includes('payhere'))) {
      recommendations.push('Fix PayHere SDK loading issues - check console for specific errors');
    }
    
    if (this.warnings.some(w => w.includes('Onsite checkout is disabled'))) {
      recommendations.push('Enable onsite checkout in the payment API configuration');
    }
    
    if (this.errors.some(e => e.type === 'api_error')) {
      recommendations.push('Check payment API endpoint configuration and environment variables');
    }
    
    if (this.warnings.some(w => w.includes('No payment buttons found'))) {
      recommendations.push('Ensure payment buttons are properly rendered on the test page');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passed! PayHere integration appears to be working correctly.');
    }
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.testPayHereSDKLoading();
      await this.testPaymentButtonClick();
      await this.testPayHereModal();
      await this.testPaymentAPI();
      const report = await this.generateReport();
      await this.cleanup();
      
      return report;
    } catch (error) {
      console.error('Test failed:', error);
      await this.cleanup();
      throw error;
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new PayHereIntegrationTester();
  tester.run()
    .then(report => {
      console.log('\n🎉 PayHere Integration Test Complete!');
      process.exit(report.summary.status === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = PayHereIntegrationTester;