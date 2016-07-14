/**
 * Created by Bharath Kumar on 5/3/2016.
 */
var ns = require('http')
var area = require('../mongodb-apiCalls/crudCalls');

exports.getCropArea = function(req, res) {
    var customDate = parseInt(new Date().getFullYear());
    var yearArray = [
        customDate-1,
        customDate-2,
        customDate-3,
        customDate-4
    ];
    ns.get({
        host: 'nass-api.azurewebsites.net',
        path: '/api/api_get?agg_level_desc=COUNTY&source_desc=SURVEY&sector_desc=CROPS&group_desc=FIELD%20CROPS&year__or='+yearArray[0]+'&year__or='+yearArray[1]+'&year__or='+yearArray[2]+'&year__or='+yearArray[3]
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
            parseDataForArea(dataParse, res, displayData);
        });
        response.on('error', function (errorDisplay) {
            console.log('Problem with request: ${errorDisplay.message}')
        });
    });
};

function parseDataForArea(jsonObj,res, callback){
    var mainJson = [];
    var tempJson = {};
    for(var i=0;i<jsonObj.data.length;i++){
        tempJson = jsonObj.data[i];
        if((tempJson.unit_desc.indexOf("ACRES") > -1)&&(tempJson.statisticcat_desc.indexOf("AREA HARVESTED") > -1)){
            mainJson.push({
                "commodity_desc" : tempJson.commodity_desc.toString(),
                "class_desc" : tempJson.class_desc.toString(),
                "statisticcat_desc" : tempJson.statisticcat_desc.toString(),
                "unit_desc" : tempJson.unit_desc.toString(),
                "agg_level_desc" : tempJson.agg_level_desc.toString(),
                "state_name" : tempJson.state_name.toString(),
                "county_ansi" : tempJson.county_ansi,
                "county_code" : tempJson.county_code,
                "county_name" : tempJson.county_name,
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
    area.insertAreaData(mainData,res);
};