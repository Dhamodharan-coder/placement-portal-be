import multer from "multer";

// Multer configuration for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Set the destination for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now(); // Create a unique suffix for the file name
    cb(null, uniqueSuffix + '-' + file.originalname); // Save file with unique name
  },
});

// Multer upload setup to handle both image and resume uploads
const upload = multer({ storage });

export default upload;
