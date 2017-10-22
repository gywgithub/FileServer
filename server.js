let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let fs = require('fs');
let multer = require('multer');
let cors = require('cors');
let cookieParser = require('cookie-parser');
let session = require('express-session');

// static file 
// http://localhost:8081/images/img144.jpeg
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/' }).array('image'));
app.use(cors());

let secretStr = randomString();
app.use(cookieParser(secretStr));
app.use(session({
  secret: secretStr,
  cookie: {maxAge: 60 * 1000 * 30},
  resave: true,
  saveUninitialized:true
}));


//  get /
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// get process_get
app.get('/process_get', (req, res) => {
  let response_data = {
    'first_name': req.query.first_name,
    'last_name': req.query.last_name
  };
  console.log(response_data);
  res.end(JSON.stringify(response_data));
});


// get process_post
app.get('/process_post', (req, res) => {
  let response_data = {
    'first_name': req.query.first_name,
    'last_name': req.query.last_name
  };
  console.log(response_data);
  res.end(JSON.stringify(response_data));
});


// get upload token 
app.get('/get_upload_token', (req, res) => {
  console.log('get upload token');
  let token = randomString();
  console.log(token);
  req.session.token = token;
  console.log(req.session.token);
  res.end(token)
});


// post file_upload 
app.post('/file_upload', (req, res) => {
  console.log('file upload');

  console.log(req);
  console.log(req.files[0]);

  let file = req.files[0];
  let size = file.size;
  // size limit  1G 
  if (size > 1048576) {
    res.end('File beyond size limit ！');
    return false;
  }

  let mimetypeFlag = 0;
  let mimetypeArray = ['image/bmp', 'image/gif', 'image/jpeg', 'image/svg+xml', 'image/tiff', 'image/png'];
  let mimetype = file.mimetype;
  for (let i = 0; i < mimetypeArray.length - 1; i++) {
    if (mimetype === mimetypeArray[i]) {
      mimetypeFlag = 1;
    }
  }
  if (mimetypeFlag === 0) {
    res.end('Documents must be image format ！');
    return false;
  }

  let token = req.body.token;
  if (token === req.session.token) {
    let des_file = __dirname + '/' + req.files[0].originalname;
    fs.readFile(req.files[0].path, (err, data) => {
      fs.writeFile(des_file, data, (err) => {
        if (err) {
          console.log(err);
        } else {
          response = {
            message: 'File Upload Success!',
            filename: req.files[0].originalname
          };
        }
        req.session.destroy();
        res.end(JSON.stringify(response));
      });
    });
  } else {
    console.log('token error');
    console.log('token: ');
    console.log(req.body.token);
    console.log('session token: ');
    console.log(req.session.token);

    res.end('token error');
  }
});


// get file download 
app.get('/file_download', (req, res) => {
  console.log('file download');
  console.log('file_name: ' + req.query.file_name);

  res.writeHead(200, {
     'Content-Type': 'application/octet-stream',
     'Content-Disposition': 'attachment; filename=' + req.query.file_name,
     'Accept-Length': 1024,
  });

  let stream = fs.createReadStream(__dirname + '/' + req.query.file_name);
  console.log(stream);
  stream.pipe(res);
});


let server = require('http').createServer(app);

let io = require('socket.io')(server);
io.on('connection', function(){ 
  console.log('socket.io connection');
});

server.listen(3000, (req, res) => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('server is running .  http://%s:%s', host, port);
});


function randomString(len) {
  len = len || 32;
  let timestamp = new Date().getTime();
  // Get rid of confusing characters by default 
  // oOLl,9gq,Vv,Uu,I1
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    
  let maxPos = $chars.length;
  let randomStr = '';
  for (i = 0; i < len; i++) {
    randomStr += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return randomStr + timestamp;
}