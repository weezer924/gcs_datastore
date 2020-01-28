const { Storage } = require('@google-cloud/storage');
const { Datastore } = require('@google-cloud/datastore');

exports.sketchbookCopy = async (req, res) => {
  let orgID = req.body.orgID;
  let desID = req.body.desID;

  // Check params
  if (!orgID || !desID) {
    const err = 'Param is wrong. You need input orgID and desID.'
    console.error('ERROR:', err);
    res.status(200).send(err)
    return;
  }

  const srcBucketName = 'dooropener-images';
  const floderName = 'mask/' + orgID + '/original';
  const desFloderName = 'mask/' + desID + '/original';
  const kindName = 'MaskImage';
  
  const storage = new Storage();
  const datastore = new Datastore();
  
  const entities = [];

  const [files] = await storage.bucket(srcBucketName).getFiles({ prefix: floderName});
  await Promise.all(files.map(async (file) => {
    const name = file.name.replace(floderName, '');
    const id = name.replace('.png', '').replace('/', '') + '-c';
    const desFileName = desFloderName + '/' + id + '.png';

    const entityOne = {
      key: datastore.key([kindName, id]),
      data: {
        ID:           id,
        SketchbookID: desID,
        URI:          "https://storage.googleapis.com/" + srcBucketName + '/' + desFileName,
        CreatedAt:    new Date()
      }
    }
    entities.push(entityOne);

    // Copy file
    await storage.bucket(srcBucketName)
      .file(file.name)
      .copy(storage.bucket(srcBucketName)
      .file(desFileName), 
      { predefinedAcl: 'publicRead' }
    );
  }));

  console.log('Copied Files:');
  console.log(entities);

  // insert to Datastore
  if (entities.length > 0) {
    datastore.insert(entities).then(response => {
      res.status(200).send("Datastore entities added.");
    }).catch(err => {
      console.error('ERROR:', err);
      res.status(200).send(err);
      return;
    });
  } else {
    res.status(200).send("None entity.");
  }
}