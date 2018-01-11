/*
 * To create a list of posts with a specific tag, or from a specific year, I've
 * configured Jekyll in a way that a source file is needed for each one.
 * I've also configured Jekyll to generate a list of missing tags and years
 * in the _site output. This script reads those files and creates the missing
 * source files, if needed.
 * 
 * @AUTHOR Daniel Smith dan@dansmith65.com
 */

var parallel = require('run-parallel')
var fs = require('fs');

parallel([
    (function(callback){
        fs.readFile('_site/blog/validate-tags.txt', 'utf8', function(err, data) {
            if (err) {
                callback(err);
            } else if (data) {
                //console.debug('these tags will be created: '+data);
                var tags = data.replace(/\|$/,'').split('|');
                tags.forEach(function(tag, i, array){
                    tag = tag.trim();
                    //console.debug(tag);
                    var filename = '_posts_by_tag/'+tag+'.md';
                    if (!fs.existsSync(filename)) {
                        fs.writeFileSync(filename, '---\r\n---\r\n');
                        console.log('created: '+filename);
                    }
                    if (i === array.length - 1) {
                        callback(null, true);
                    }
                });
            } else {
                callback(null, false);
            }
        });
    }),
    (function(callback){
        fs.readFile('_site/blog/validate-years.txt', 'utf8', function(err, data) {
            if (err) {
                callback(err);
            } else if (data) {
                //console.debug('these years will be created: '+data);
                var years = data.replace(/\|$/,'').split('|');
                years.forEach(function(year, i, array){
                    year = year.trim();
                    //console.debug(year);
                    var filename = '_posts_by_year/'+year+'.md';
                    if (!fs.existsSync(filename)) {
                        fs.writeFileSync(filename, '---\r\n---\r\n');
                        console.log('created: '+filename);
                    }
                    if (i === array.length - 1) {
                        callback(null, true);
                    }
                });
            } else {
                callback(null, false);
            }
        });
    })
],
function(err, results) {
    if (err) throw err;
    // console.debug('validate-tags-years: results:', results);
    if (results.indexOf(true) > -1) {
        console.warn('validate-tags-years: files created, should build again!!!');
    } else {
        console.log('validate-tags-years: all good');
    }
});
