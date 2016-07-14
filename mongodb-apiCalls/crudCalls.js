/**
 * Created by Bharath Kumar on 5/3/2016.
 */

var getMongoClient = require('../mongo-Config/connectMongo');

exports.getAreaData = function(res, locationName){
    var mongoDbObj = getMongoClient.mongoDbObj();
    getDistinctCrops(res, mongoDbObj, locationName);
};


function getDistinctCrops(res, mongoDbObj, locationName){
    mongoDbObj.areaSchema.distinct("commodity_desc" , { "county_name": locationName.county } ,function(err,result){
        if(err){
            throw err;
        }
        else{
            if(result.length > 0){
                getCropAreaData(res, mongoDbObj, locationName, result);
            }
        }
    })
}


function getCropAreaData(res,mongoDbObj, locationName,result){
    mongoDbObj.areaSchema.find({$and: [{county_name: locationName.county}]},{_id:0,value:1,commodity_desc:1}).toArray(function(err, rslt){
        if(err){
            throw err;
        }
        else{
            if(rslt.length > 0){
                getAverageArea(res,mongoDbObj, locationName, result, rslt);
            }
            else{
                console.log("could not get data");
            }
        }

    });
}

function getAverageArea(res, mongoDbObj, locationName, result, rslt){
    var k = 0;
    var jsonArray = [];
    var avg = 0;
    result.forEach(function(childResult){
        rslt.forEach(function(childRslt){
            if(childRslt.commodity_desc == childResult){
                k++;
                avg = avg + parseInt(childRslt.value.replace(/[^0-9]/g, ''));
            }
        });
        avg = avg/k;
        k = 0;
        jsonArray.push({"cropName" : childResult, "cropAcres" : avg});
        avg = 0;
    });
    getCropPriceData(res, mongoDbObj, locationName, result, jsonArray);
}

function getCropPriceData(res, mongoDbObj, locationName, result, jsonArray){
    var cropPriceData = {"PriceData" : []};
    function getPriceData(i) {
        if( i < result.length ) {
            mongoDbObj.priceSchema.find({$and:[{state_name: locationName.state},{commodity_desc: result[i]}]},{_id:0}).toArray( function(err, rslt){
                if( err ) {
                    console.log('error: '+err)
                }
                else {
                    if(rslt.length > 0){
                        for(var j = 0; j < rslt.length ; j++){
                            cropPriceData.PriceData.push(rslt[j]);
                        }
                    }
                    getPriceData(i+1)
                }
            });
        }
        if(i==result.length){
            sendCropData(res, jsonArray, cropPriceData);
        }
    }
    getPriceData(0)
}

function sendCropData(res,jsonArray, cropPriceData) {
    var cropJSON = {"cropData": []};
    jsonArray.forEach(function (cropDetail) {
        cropPriceData.PriceData.forEach(function (priceData) {
            if (cropDetail.cropName == priceData.commodity_desc) {
                if (cropJSON.cropData.length > 0) {
                    var tempJSON = cropJSON.cropData;
                    var checkEntry = 0;
                    cropJSON.cropData.forEach(function (cropFinal) {
                        if (cropFinal.name == cropDetail.cropName) {
                            checkEntry = 1;
                            cropFinal.year.push(parseInt(priceData.year));
                            cropFinal.price.push(parseFloat(priceData.value));
                        }
                    });
                    if (checkEntry == 0) {
                        var tempData = {
                            "name": cropDetail.cropName.toString(),
                            "arc": cropDetail.cropAcres,
                            "unit": priceData.unit_desc,
                            "year": [parseInt(priceData.year)],
                            "price": [parseFloat(priceData.value)]
                        };
                        cropJSON.cropData.push(tempData);
                    }
                }
                else {
                    var tempData = {
                        "name": cropDetail.cropName.toString(),
                        "arc": cropDetail.cropAcres,
                        "unit": priceData.unit_desc,
                        "year": [parseInt(priceData.year)],
                        "price": [parseFloat(priceData.value)]
                    };
                    cropJSON.cropData.push(tempData);
                }
            }

        });
    });
    if (cropJSON.cropData.length > 0) {
        sortData(res, cropJSON.cropData);
        //res.setHeader('Content-Type', 'application/json');
        //res.send(cropJSON.cropData);
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.send(cropJSON.cropData);
    }
}

function sortData(res,cropData){
    var customDate = parseInt(new Date().getFullYear());
    var yearArray = [
        customDate-4,
        customDate-3,
        customDate-2,
        customDate-1
    ];
    var finalPrice = [];
    var finalYear = [];
    var j = 0;
    cropData.forEach(function(childCropData){
        var i = 0;
        var k = 0;
        yearArray.forEach(function(childArray){
            childCropData.year.forEach(function(childYear){
                if(childYear == childArray){
                    finalYear.push(childYear);
                    finalPrice.push(childCropData.price[i]);
                }
                i++;
            });
            i = 0;
            k++;
            if(k==yearArray.length){
                childCropData.year = finalYear;
                childCropData.price = finalPrice;
                finalYear = [];
                finalPrice = [];
            }
        });
        j++;
        if(j == cropData.length){
            console.log(cropData)
            res.setHeader('Content-Type', 'application/json');
            res.send(cropData);
        }
    });
    /*
    yearArray.forEach(function(yearData){
        cropData.forEach(function(childCropData){
            var i = 0;
            childCropData.year.forEach(function(childYear){
                if(childYear == yearData.toString()){
                    finalYear.push(childYear);
                    finalPrice.push(childCropData.price[i]);
                }
                i++;
            });
            if(i==childCropData.year.length){
                console.log(finalYear)
                childCropData.year = finalYear;
                childCropData.price = finalPrice;
                finalPrice = [];
                finalYear = [];
            }
        });
        k++;
        if(k==yearArray.length){
            console.log(cropData)
            res.setHeader('Content-Type', 'application/json');
            res.send(cropData);
        }
    });
    */
}


exports.insertPriceData = function(jsonObj, res){
    var mongoDbObj = getMongoClient.mongoDbObj();
    jsonObj.forEach(function(childJsonObj){
        mongoDbObj.priceSchema.insert(childJsonObj,{w:1},function(err){
            if(err){
                //res.write('Unable to write Data');
                //res.end();
            }
            else{
                //res.write('Data Success');
                //res.end();
            }
        });
    });
};

exports.insertAreaData = function(jsonObj, res){
    var mongoDbObj = getMongoClient.mongoDbObj();
    console.log(jsonObj);
    jsonObj.forEach(function(childJsonObj){
        mongoDbObj.areaSchema.insert(childJsonObj,{w:1},function(err){
            if(err){
               // res.write('Unable to write Data');
               // res.end();
            }
            else{
               // res.write('Data Success');
               // res.end();
            }
        });
    });
};
