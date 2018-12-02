let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let fs = require('fs')
let multer = require('multer')
let options = {
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*')
  }
}

app.use(express.static('public', options))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(multer({
  dest: '/tmp/'
}).array('image'))


//  get /
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


// post file_upload
app.post('/file_upload', (req, res) => {
  console.log('file upload')

  let file = req.files[0]
  let size = file.size
  // size limit  10MB
  if (size > 10240000) {
    res.end('File beyond size limit !')
    return false
  }

  let mimetypeFlag = 0
  let mimetypeArray = ['image/bmp', 'image/gif', 'image/jpeg', 'image/svg+xml', 'image/tiff', 'image/png']
  let mimetype = file.mimetype
  for (let i = 0; i < mimetypeArray.length; i++) {
    if (mimetype === mimetypeArray[i]) {
      mimetypeFlag = 1
    }
  }
  if (mimetypeFlag === 0) {
    res.end('Documents must be image format !')
    return false
  }

  let des_file = __dirname + '/public/images/' + req.files[0].originalname
  fs.readFile(req.files[0].path, (err, data) => {
    fs.writeFile(des_file, data, (err) => {
      if (err) {
        console.log(err)
      } else {
        response = {
          message: 'File Upload Success!',
          filename: req.files[0].originalname
        }
      }
      res.end(JSON.stringify(response))
    })
  })

})

let server = require('http').createServer(app)


server.listen(3000, (req, res) => {
  let host = server.address().address
  let port = server.address().port

  console.log('server is running .  http://%s:%s', host, port)
})
