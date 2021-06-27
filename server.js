const express = require('express');
const bodyparser = require ('body-parser');
const multiparty = require('connect-multiparty');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');

const fs = require('fs');



const PORT = process.env.PORT ||  5000;
const app = express();

app.use(cors());
app.use(morgan('dev'));

const MuiltiPartyMiddleware = multiparty({uploadDir:"/images"});
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(express.static("uploads"));


app.get('/', ( req, res) =>{
    res.status(200).json(
        {
            message: "Server is running"
        }
    )
});



app.post('/upload', MuiltiPartyMiddleware, (req, res) =>{
    console.log(req.files.file)
    var TempFile = req.files.file ? req.files.file :req.files.upload;
    var TempPathfile = TempFile.path;

   const targetPathUrl = path.join(__dirname,"./uploads/"+TempFile.name);

   if(path.extname(TempFile.originalFilename).toLowerCase() === ".png" || ".jpg"){
     
    fs.rename(TempPathfile, targetPathUrl, err =>{

        res.status(200).json({
         uploaded: true,
          url: `${req.protocol}://${req.hostname}:${process.env.PORT}/${TempFile.originalFilename}`
        });

        if(err) return console.log(err);
    })
   }


    console.log(req.files);
})

app.listen(PORT,console.log(`Server is runing on ${PORT}`));