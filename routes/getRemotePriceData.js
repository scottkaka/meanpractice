/**
 * Created by Bharath Kumar on 5/2/2016.
 */
var ns = require('http');
var price = require('../mongodb-apiCalls/crudCalls');


exports.getCropPrice = function(req, res) {
    var customDate = parseInt(new Date().getFullYear());
    var yearArray = [
        customDate-1,
        customDate-2,
        customDate-3,
        customDate-4
    ];
    ns.get({
        host: 'nass-api.azurewebsites.net',
        path: '/api/api_get?source_desc=SURVEY&sector_desc=CROPS&group_desc=FIELD%20CROPS&statisticcat_desc=PRICE%20RECEIVED&year__or='+yearArray[0]+'&year__or='+yearArray[1]+'&year__or='+yearArray[2]+'&year__or='+yearArray[3]
    }, function doneSending(response) {
        console.log("Received Data and waiting for the end");
        var body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk
        });
        response.on('end', function () {
            console.log('No more data in response');
            var dataParse = JSON.parse(body);
            parseDataForPrice(dataParse, res, displayData);
        });
        response.on('error', function (errorDisplay) {
            console.log('Problem with request: ${errorDisplay.message}')
        });
    });
};

function parseDataForPrice(jsonObj,res, callback){
    var mainJson = [];
    var tempJson = {};
    for(var i=0;i<jsonObj.data.length;i++){
        tempJson = jsonObj.data[i];
        if((!(tempJson.value.indexOf("(")> -1))&&(tempJson.unit_desc.indexOf("$") > -1)){
            mainJson.push({
                "commodity_desc" : tempJson.commodity_desc.toString(),
                "class_desc" : tempJson.class_desc.toString(),
                "statisticcat_desc" : tempJson.statisticcat_desc.toString(),
                "unit_desc" : tempJson.unit_desc.toString(),
                "agg_level_desc" : tempJson.agg_level_desc.toString(),
                "state_name" : tempJson.state_name.toString(),
                "country_name" : tempJson.country_name.toString(),
                "year" : tempJson.year.toString(),
                "load_time" : tempJson.load_time.toString(),
                "value": tempJson.value.toString()
            });
        }
    };
    callback(res,mainJson);
};

function displayData(res,mainData){
    price.insertPriceData(mainData,res);
};