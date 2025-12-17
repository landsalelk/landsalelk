const { Client, Storage } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('landsalelkproject')
  .setKey('standard_6146a90a8110a94d2d6468817a644b7d6dae2ca9162600f443e56ba1239851ecf7c43600c80decb7f2da4f2ef1958cbb65cac0abb4581eac85008343d7b01a0454940859670360dace3cd37c7719d6409e4edba73144682aa9e2e2dd05d67aa9f867b977c14a15397ad08614b61b23489a998a7ab1ae6ba9be1d81688089e16c');

const storage = new Storage(client);

async function testImageUpload() {
  console.log('🖼️  Testing Appwrite image upload functionality...\n');
  
  try {
    // Test bucket access
    console.log('1️⃣ Testing bucket access...');
    const bucket = await storage.getBucket('listing_images');
    console.log(`  ✅ Bucket accessible: ${bucket.name} (${bucket.$id})`);
    console.log(`  📊 Max file size: ${bucket.maximumFileSize} bytes`);
    console.log(`  🔒 Allowed extensions: ${bucket.allowedFileExtensions.join(', ') || 'All files'}`);
    
    // Test creating a simple test image (1x1 pixel PNG)
    console.log('\n2️⃣ Creating test image...');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Upload test image
    console.log('\n3️⃣ Uploading test image...');
    const file = await storage.createFile(
      'listing_images',
      'unique()', // Auto-generate ID
      InputFile.fromBuffer(testImageBuffer, 'test-image.png', 'image/png')
    );
    
    console.log(`  ✅ File uploaded successfully!`);
    console.log(`  📁 File ID: ${file.$id}`);
    console.log(`  📊 File size: ${file.sizeOriginal} bytes`);
    console.log(`  🎯 MIME type: ${file.mimeType}`);
    
    // Test file retrieval
    console.log('\n4️⃣ Testing file retrieval...');
    const retrievedFile = await storage.getFile('listing_images', file.$id);
    console.log(`  ✅ File retrieved: ${retrievedFile.name}`);
    
    // Test file download
    console.log('\n5️⃣ Testing file download...');
    const downloadBuffer = await storage.getFileDownload('listing_images', file.$id);
    console.log(`  ✅ File downloaded: ${downloadBuffer.length} bytes`);
    
    // Clean up - delete test file
    console.log('\n6️⃣ Cleaning up test file...');
    await storage.deleteFile('listing_images', file.$id);
    console.log(`  ✅ Test file deleted`);
    
    console.log('\n🎉 Image upload functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing image upload:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Mock InputFile for testing (since we're in Node.js environment)
class InputFile {
  constructor(buffer, filename, mimeType) {
    this.buffer = buffer;
    this.filename = filename;
    this.mimeType = mimeType;
  }
  
  static fromBuffer(buffer, filename, mimeType) {
    return new InputFile(buffer, filename, mimeType);
  }
}

testImageUpload().catch(console.error);