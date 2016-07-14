/**
 * Created by Yassaman on 5/3/2016.
 */

var ns = require('http');
var xml2js = require('xml2js');

exports.getCountyName = function(pathToGO,res, callback) {
    console.log(pathToGO)
    ns.get({
        host: 'data.fcc.gov',
        path: pathToGO
    }, function doneSending(response) {
        console.log("Received Data and waiting for the end");
        var body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk
        });
        response.on('end', function () {
            console.log('No more data in response');
            var parser = new xml2js.Parser();
            parser.parseString(body, function(err,rslt){
                var countyObjectStr= JSON.stringify(rslt['Response']['County']);
                var stateObjectStr= JSON.stringify(rslt['Response']['State']);
                var finalCountyObj = countyObjectStr.slice(1, countyObjectStr.indexOf("]"));
                var finalStateObj = stateObjectStr.slice(1, stateObjectStr.indexOf("]"));
                var countyName= JSON.parse(finalCountyObj).$.name;
                var stateName= JSON.parse(finalStateObj).$.name;
                var countyStateJsonStr= "{ \"state\" : \"" + stateName.toUpperCase() +
                        "\", \"county\": \"" +  countyName.toUpperCase() + "\" }";
                console.log(countyStateJsonStr);

                callback(res,JSON.parse(countyStateJsonStr));
            })
        });
        response.on('error', function (errorDisplay) {
            console.log('Problem with request: ${errorDisplay.message}')
        });
    });
};

