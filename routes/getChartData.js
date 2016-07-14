/**
 * Created by Bharath Kumar on 5/3/2016.
 */
var ns = require('http');
var geoData = require('./getGeocodeInfo');
var mongoData = require('../mongodb-apiCalls/crudCalls');

exports.getCropData = function(req, res){
    console.log('iin charData')
    var lat= Number(req.query.lat);
    var long= Number(req.query.long);
    var arr = [1,2,3]
    var path = '';
    var i = 0
    arr.forEach(function(arrChild){
        if(arrChild==1){
            path = '/api/block/2010/find?latitude='+lat+ '&longitude=' + long
            console.log(path)
        }
        i++;
    })
    if(i==3){       
        geoData.getCountyName(path,res, getCropArea);
    }

};

function getCropArea(res,countyName){
    mongoData.getAreaData(res, countyName);
};