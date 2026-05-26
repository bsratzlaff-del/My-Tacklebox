// 🛠️ FIXED: Remove the extra dot
import { TackleboxVision } from '../ai-agent/vision.js';
import fs from 'fs';
import path from 'path';

async function runVisionTest() {
    console.log("📸 Initializing Tacklebox Vision Scanner Simulation...\n");

    const visionScanner = new TackleboxVision();
    
    // Path to the test image sitting in your frontend directory
    const imagePath = path.join(process.cwd(), 'tackle-test.jpg');

    // Verify the test file actually exists before firing up the AI
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Test image missing! Please drop a real image named 'tackle-test.jpg' into: ${process.cwd()}`);
        return;
    }

    try {
        // Read the image off your hard drive into a raw data buffer (exactly how a file upload works)
        const imageBuffer = fs.readFileSync(imagePath);

        const scannedInventory = await visionScanner.scanImageToInventory(imageBuffer, 'image/jpeg');

        console.log("\n🤖 VISION SCAN COMPLETE! STRUCTURALLY PARSED INVENTORY DATA: 🤖");
        console.log("=====================================================================");
        console.log(JSON.stringify(scannedInventory, null, 2));
        console.log("=====================================================================");
        console.log(`\n🎉 Success! Found ${scannedInventory.length} items ready to pipe to your MongoDB database.`);

    } catch (error) {
        console.error("❌ Vision simulation run aborted due to errors.");
    }
}

runVisionTest();