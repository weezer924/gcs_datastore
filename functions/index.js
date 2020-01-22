const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

// const srcFilename = 'Name of the source file, e.g. file.txt';
// const destBucketName = 'Name of the destination bucket, e.g. my-other-bucket';
// const destFilename = 'Destination name of file, e.g. file.txt';

// Copies the file to the other bucket
// await storage
//   .bucket(srcBucketName)
//   .file(srcFilename)
//   .copy(storage.bucket(destBucketName).file(destFilename));

// console.log(
//   `gs://${srcBucketName}/${srcFilename} copied to gs://${destBucketName}/${destFilename}.`
// );

exports.sketchbookCopy = async (req, res) => {
  let orgID = req.body.orgID;
  let desID = req.body.desID;

  const srcBucketName = 'dooropener-images/mask/' + orgID + '/original';
  const files = await storage.bucket(srcBucketName).getFiles();

  files.forEach(file => {
    console.log(file.name);
  });
  
  if ((orgID === '') || (desID === '')) {
    res.status(500).send("ERROR: Param is wrong. You need input orgID and desID.")
  }
  res.status(200).send(req.body);
};