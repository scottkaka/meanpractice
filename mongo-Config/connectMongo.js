/**
 * Created by Bharath Kumar on 5/3/2016.
 */
var mongoClient=require('mongodb').MongoClient;
var mongoDbObj;

mongoClient.connect('mongodb://localhost/smartFarm', function(err, db) {
    if (err)
        console.log(err);
    else {
        console.log("Connected to MongoDB");
        mongoDbObj = {
            db: db,
            priceSchema: db.collection('PriceSchema'),
            areaSchema: db.collection('AreaSchema')
        };
    }
});

exports.mongoDbObj = function(){
    return mongoDbObj;
};