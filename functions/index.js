const { Storage } = require('@google-cloud/storage');
const { Datastore } = require('@google-cloud/datastore');

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
  const kindName = 'MaskImage';
  
  const storage = new Storage();
  const datastore = new Datastore();

  const [files] = await storage.bucket(srcBucketName).getFiles({ prefix: floderName})
  
  files.forEach(async (file) => {
    const name = file.name.replace(floderName, '');
    console.log(desFloderName + name);

    // Copy file
    await storage.bucket(srcBucketName)
      .file(file.name)
      .copy(storage.bucket(srcBucketName)
      .file(desFloderName + name), 
      { predefinedAcl: 'publicRead' }
    );

    // Set to datastore
    const id = name.replace('.png', '').replace('/', '');
    datastore.save({
      key: datastore.key(kindName),
      data: {
        ID:           id,
        SketchbookID: desID,
        URI:          "https://storage.googleapis.com/" + srcBucketName + '/' + desFloderName + name,
        CreatedAt:    new Date()
      }
    }).catch(err => {
      console.error('ERROR:', err);
      res.status(200).send(err);
      return;
    });
  });

  res.status(200).send("function successed.");
}