const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const { uploadImage, getAllImages, deleteImage } = require("../controllers/image-controller");


router.post('/upload', authMiddleware, adminMiddleware, uploadMiddleware.single("image"), uploadImage,
);

router.get('/getImages', authMiddleware, adminMiddleware, getAllImages);

router.delete('/deleteImage/:id', authMiddleware, deleteImage);

module.exports = router;