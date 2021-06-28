const express = require('express');
const errorResponse = require('./utils/errorResponse');
const asyncHandler = require('./middleware/asyncHandler');
const fileupload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');

const PORT = process.env.PORT ||  5000;
const app = express();

app.use(cors());
// Body parser
app.use(express.json());
app.use(morgan('dev'));

// File upload
app.use(fileupload());
// set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', ( req, res) =>{
    res.status(200).json(
        {
            message: "Server is running"
        }
    )
});


app.post('/upload',asyncHandler(async(req,res,next)=>{
    if (!req.files) {
        return next(new errorResponse(`Please upload file`, 400));
      }
      const file = req.files.file;
      // Checking if file type is image
      if (!file.mimetype.startsWith('image')) {
        return next(new errorResponse(`Please upload image file`, 400));
      }
      // File size checking
      if (file.size > process.env.FILE_UPLOAD_SIZE) {
        return next(
          new errorResponse(
            `Please upload image file of size less than ${process.env.FILE_UPLOAD_SIZE}`,
            400
          )
        );
      }
      // create custom file name
      file.name = `blog_photo_${Math.ceil(Math.random() * 10 + 1)}${path.parse(file.name).ext}`;
      file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
          console.error(err);
          return next(new errorResponse(`Problem with file upload`, 500));
        }
        res.status(200).json({
          success: true,
          msg: 'File uploaded successfully!',
          url: `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/${file.name}`
        });
      });    
}))

app.listen(PORT,console.log(`Server is runing on ${PORT}`));