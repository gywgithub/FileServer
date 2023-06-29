const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

app.use(express.static("public"));

app.use(
  multer({
    dest: "/tmp/",
  }).array("image")
);

// app.use(multer({
//   dest: '/tmp/'
// }))

const cors = require("cors");
app.use(cors());

// 配置此项，用于接收post请求的json数据
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//  get /
app.get("/", (req, res) => {
  res.endFile(__dirname + "/index.html");
});

// put file_upload
app.put("/file_upload_put", (req, res) => {
  const des_file = __dirname + "/public/images/" + req.files[0].originalname;
  fs.readFile(req.files[0].path, (err, data) => {
    fs.writeFile(des_file, data, (err) => {
      if (err) {
        console.log(err);
      } else {
        response = {
          message: "File Upload Success!",
          filename: req.files[0].originalname,
        };
      }
      res.end(JSON.stringify(response));
    });
  });
});

// post file_upload
app.post("/file_upload", (req, res) => {
  const file = req.files[0];
  const size = file.size;
  // size limit  10MB
  if (size > 10240000) {
    res.end("File beyond size limit !");
    return false;
  }

  const mimetypeFlag = 0;
  const mimetypeArray = [
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/tiff",
    "image/png",
  ];
  const mimetype = file.mimetype;

  for (let i = 0; i < mimetypeArray.length; i++) {
    if (mimetype === mimetypeArray[i]) {
      mimetypeFlag = 1;
    }
  }
  if (mimetypeFlag === 0) {
    res.end("Documents must be image format !");
    return false;
  }

  const des_file = __dirname + "/public/images/" + req.files[0].originalname;
  fs.readFile(req.files[0].path, (err, data) => {
    fs.writeFile(des_file, data, (err) => {
      if (err) {
        console.log(err);
      } else {
        response = {
          message: "File Upload Success!",
          filename: req.files[0].originalname,
          url:
            "http://192.168.199.172:3000/images/" + req.files[0].originalname,
        };
      }
      res.end(JSON.stringify(response));
    });
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("1");
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + Math.random() + ".txt");
  },
});

const upload = multer({
  limits: { fileSize: 1024 * 1024 * 5 }, // 文件最大5MB
});

// single("image") 需要和前端本地的参数一致
app.post("/upload_large_file", upload.single("image"), (req, res) => {
  console.log("upload_large_file");
  // 注意!!! /public/images/ 目录需要提前创建
  const des_file = __dirname + "/public/images/" + req.files[0].originalname;
  console.log('__dirname: ', __dirname)
  // const des_file = __dirname + '/' + req.files[0].originalname;
  console.log("des_file: ", des_file);
  let responseResult = {};
  console.log("req.files[0].path: ", req.files[0].path);
  fs.readFile(req.files[0].path, (err, data) => {
    fs.writeFile(des_file, data, (err) => {
      if (err) {
        console.log(err);
      } else {
        responseResult = {
          message: "File Upload Success!",
          filename: req.files[0].originalname,
          url: "http://127.0.0.1:3000/images/" + req.files[0].originalname,
        };
      }
      res.end(JSON.stringify(responseResult));
    });
  });
});


app.post("/finish_upload", (req, res) => {
  console.log("finish_upload api");
  console.log(req.body);
  // __dirname + "/public/images/"

  const uploadPath = __dirname + "/public/images/"; // uploads dir path (local)!!! NOT /public/images/!!!!!!

  // const filePaths = ['./uploads/image-1.jpg', './uploads/image-2.jpg', './uploads/image-3.jpg']; // 上传的文件路径列表
  const mergedFileName = req.body.fileName; // 合并后的文件名

  let filePaths = [];

  req.body.fileChunkList.forEach((item) => {
    filePaths.push("./public/images/" + item);
  });
  console.log('filePaths: ', filePaths)

  const files = filePaths;
  const targetFile = mergedFileName;

  const writeStream = fs.createWriteStream(targetFile);

  files.forEach((file, index) => {
    console.log('index: ', index)
    console.log('file: ', file)
    const filePath = path.join(__dirname, file);
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(writeStream);
  });

  writeStream.on("finish", () => {
    console.log(`All files are merged into ${targetFile}`);
  });

  const resData = {
    state: "success",
    message: "文件已合并，上传成功",
  };
  console.log("resData: ", resData);
  res.json(resData);
});

let server = require("http").createServer(app);

server.listen(3000, (req, res) => {
  let host = server.address().address;
  let port = server.address().port;

  console.log("server is running .  http://%s:%s", host, port);
  console.log("http://127.0.0.1:3000");
});
