import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { TackleboxVision } from '../ai-agent/vision.js';
import Gear from '../models/Gear.js';

const router = express.Router();

// Configure multer to hold the uploaded file memory buffer temporarily
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Cap photo uploads at 10MB
});

/**
 * @route   POST /api/inventory/scan
 * @desc    Receives a mobile camera photo, runs it through Gemini Vision, 
 * and saves the resulting gear array directly to MongoDB.
 */
router.post('/scan', upload.single('tacklePhoto'), async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Guard check: Ensure a file was actually uploaded
        if (!req.file) {
            res.status(400).json({ error: "No photo provided. Please attach an image matching the 'tacklePhoto' key." });
            return;
        }

        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: "Missing required 'userId' field." });
            return;
        }

        console.log(`📸 Backend received a mobile upload: ${req.file.originalname} (${req.file.size} bytes)`);

        // 2. Initialize your backend AI Vision agent
        const visionScanner = new TackleboxVision();

        // 3. Fire the image buffer up to the Gemini Cloud Brain
        const parsedInventory = await visionScanner.scanImageToInventory(
            req.file.buffer, 
            req.file.mimetype
        );

        console.log(`🤖 Gemini successfully parsed ${parsedInventory.length} items from photo. Writing to MongoDB...`);

        // 4. Bulk insert right into MongoDB using your Mongoose Model
        const inventoryToSave = parsedInventory.map((item) => ({
            ...item,
            userId
        }));

        const savedInventory = await Gear.insertMany(inventoryToSave);

        // 5. Respond to the mobile app with the final database entries
        res.status(201).json({
            message: "Tacklebox successfully scanned and saved to database!",
            itemsSavedCount: savedInventory.length,
            data: savedInventory
        });

    } catch (error) {
        console.error("🚨 API Scan endpoint failed:", error);
        res.status(500).json({ error: "Internal server error during AI computer vision processing." });
    }
});

export default router;
