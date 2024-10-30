const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');


// Checking if the uploads folder exists or no, if not then create one
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// fs.promises.access(uploadDir).catch((error) => {
//     fs.mkdir('./uploads', { recursive: true }, (err) => {
//         if (err) {
//             console.error('Error creating directory:', err);
//         } else {
//             console.log(`Directory '${uploadDir}' created.`);
//         }
//     });
// });


const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, res, cb) => {
        const ext = path.extname(res.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
})

const fileFilter = (req, res, cb) => {
    // if (!res.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        console.log("res.mimetype: ", res.mimetype);
    if (res.mimetype === 'image/jpeg' || res.mimetype === 'image/png' || res.mimetype === 'image/jpg' || res.mimetype === 'image/gif'  || res.mimetype === 'image/svg+xml') {
        cb(null, true);
    } else {
        return cb(new Error('Only image files are allowed!'));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    fileFilter: fileFilter
});

module.exports = upload;












/*
// //------------------------------------------------------------------------------------------------------------
// //------------  file will be saved only after the data is successfully created in the database -------------
// //------------------------------------------------------------------------------------------------------------
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;  // Use fs.promises for async operations

// Check if uploads folder exists, if not, create it
async function ensureUploadDirExists(uploadDir) {
    try {
        await fs.access(uploadDir);  // Check if the directory can be accessed
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Directory doesn't exist, create it
            await fs.mkdir(uploadDir, { recursive: true });
            console.log(`Directory '${uploadDir}' created.`);
        } else {
            throw err;  // Other errors
        }
    }
}

const storage = multer.memoryStorage();  // Use memory storage

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
    fileFilter: (req, res, cb) => {
        if (res.mimetype === 'image/jpeg' || res.mimetype === 'image/png' || res.mimetype === 'image/jpg' || res.mimetype === 'image/gif' || res.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            return cb(new Error('Only image files are allowed!'));
        }
    }
});

module.exports = upload;

// Controller
exports.createBanner = async (req, res) => {
    const uploadDir = './uploads';

    try {
        // Ensure the upload directory exists
        await ensureUploadDirExists(uploadDir);

        // Create the banner in the database
        const bannerData = {
            title: req.body.title,
            description: req.body.description,
            // other fields...
        };

        const createdBanner = await Banner.create(bannerData);  // Simulated DB operation

        if (createdBanner && req.file) {
            // Save the file after the banner is successfully created
            const ext = path.extname(req.file.originalname);
            const uniqueName = `${uuidv4()}${ext}`;
            const filePath = path.join(uploadDir, uniqueName);

            await fs.writeFile(filePath, req.file.buffer);  // Save file to disk from memory

            // Optionally update the banner record with the image path
            createdBanner.imagePath = uniqueName;
            await createdBanner.save();

            return res.status(201).json({ message: 'Banner created successfully', banner: createdBanner });
        } else {
            return res.status(400).json({ message: 'Banner creation failed' });
        }
    } catch (error) {
        console.error('Error creating banner:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
*/