import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/assets"); // Save temporary files to this directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Use timestamp and original name
  },
});

const upload = multer({ storage });
export { upload };
