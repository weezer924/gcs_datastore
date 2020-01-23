const {Storage} = require('@google-cloud/storage');

exports.sketchbookCopy = async (req, res) => {
  let orgID = req.body.orgID;
  let desID = req.body.desID;

  if (!orgID || !desID) {
    res.status(500).send("ERROR: Param is wrong. You need input orgID and desID.")
    return;
  }

  const srcBucketName = 'dooropener-images';
  const floderName = 'mask/' + orgID + '/original';
  const desFloderName = 'mask/' + desID + '/original';
  
  const storage = new Storage();
  const [files] = await storage.bucket(srcBucketName).getFiles({ prefix: floderName})
  
  files.forEach(async (file) => {
    const name = file.name.replace(floderName, '');
    console.log(desFloderName + name);
    await storage.bucket(srcBucketName)
      .file(file.name)
      .copy(storage.bucket(srcBucketName)
      .file(desFloderName + name), 
      { predefinedAcl: 'publicRead' }
    );
  });

  res.status(200).send("function successed.");
}