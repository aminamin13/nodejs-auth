const Image = require("../models/image");
const { uploadToCloudinary } = require("../helpers/cloudinary-helper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary")


const uploadImage = async (req, res) => {
    try {

        // Check if the file is present
        if (!req.file) {
            return res.status(400).json({
                status: "failure",
                message: "No file uploaded"
            });
        }
        // Upload the file to Cloudinary
        const { url, publicId } = await uploadToCloudinary(req.file.path);

        // store the image details in the database
        const image = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId, // Assuming req.user is set by authentication middleware
        });
        await image.save();
        res.status(201).json({
            status: "success",
            message: "Image uploaded successfully",
            data: image
        });

        // Remove the file from the local filesystem
        fs.unlinkSync(req.file.path);


    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
            status: "failure",
            message: "Internal server error"
        });
    }
}


const getAllImages = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder;

        const images = await Image.find().sort(sortObj).skip(skip).limit(limit)

        if (images) {
            return res.status(200).json({
                status: "success",
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images,
                message: "Images fetched successfully",

            });
        }

    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).json({
            status: "failure",
            message: "Internal server error"
        });
    }
}


const deleteImage = async (req, res) => {
    try {
        const getCurrentIdOfImageToDelete = req.params.id;
        const userId = req.userInfo.userId; // Assuming req.userInfo is set by authentication middleware
        const image = await Image.findById(getCurrentIdOfImageToDelete);
        if (!image) {
            return res.status(404).json({
                status: "failure",
                message: "Image not found"
            });
        }
        // Delete the image from Cloudinary

        if (image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                status: "failure",
                message: "You are not authorized to delete this image"
            });
        }
        await cloudinary.uploader.destroy(image.publicId);
        // Delete the image from the database
        await Image.findByIdAndDelete(getCurrentIdOfImageToDelete);
        res.status(200).json({
            status: "success",
            message: "Image deleted successfully"
        });

    } catch (error) {

        console.error("Error deleting image:", error);
        res.status(500).json({
            status: "failure",
            message: "Internal server error"
        });
    }
}

module.exports = {
    uploadImage,
    getAllImages,
    deleteImage
}