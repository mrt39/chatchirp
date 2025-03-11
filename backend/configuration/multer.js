//multer configuration for file uploads
var multer = require('multer');

//store image in memory, as we will be directly uploading it to remote without saving it to disk
const storage = multer.memoryStorage();  
const upload = multer({storage:storage});

module.exports = upload;