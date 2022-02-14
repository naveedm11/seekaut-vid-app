const videoTags = require("../models/categories");

exports.add_tag = async(req, res) => {
    try {
      const tag = new videoTags({title: req.body.title});
     
      await tag.save();

      const resp = {
        category: tag,
        code: 200
    };
    
    res.json(resp);

    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
}

exports.get_tags = async(req, res) => {
    try {
      const tags = await videoTags.find({});
     
      const resp = {
        categories: tags,
        code: 200
    };
    
    return res.send(resp)

    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }

}