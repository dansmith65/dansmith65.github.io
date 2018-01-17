/**
 * Read source .txt file's to get paths to original images, create
 * copies of each of those images in various sizes, for use in blog posts.
 * 
 * @AUTHOR Daniel Smith dan@dansmith65.com
 */

const glob = require("glob");
const fs = require('fs-extra');
const fsCompare = require('fs-compare');
const sharp = require("sharp");
const exifReader = require('exif-reader');
const path = require('path');
const slug = require('slug');

slug.defaults.mode ='rfc3986';

const source_glob = "_data/pictures/*/*.txt";

glob(source_glob, function (err, files) {
    if (err) throw err;
    files.forEach(file => {
        /**
         * If lock file doesn't exist, or was created after source file, re-process
         * picture-source.txt file.
         */
        fsCompare.ctime(file, getLockPath(file), function(err, diff) {
            if (err) throw err;
            if (diff < 1) {
                console.debug(file + " already processed");
            } else {
                console.debug(file + " will be processed because source is newer than lock, or lock didn't exist");
                processPictureSource(file, getLockPath(file));
            }
        });

    });
  })


/* for now, I'm going to keep writing json to this file, even though I don't plan to use it in the end, and I may re-name this file later. */
const getLockPath = function (source_file_path) {
    const d = path.dirname(source_file_path);
    const f = path.basename(source_file_path, '.txt');
    const lock_path = path.join(d, f + '.json')
    return lock_path;
};


const processPictureSource = function (picture_source, picture_source_lock) {

    fs.readFile(picture_source, 'utf8', function(err, data) {
        if (err) throw err;
        if (!data) return;
        //console.trace(data);
        
        /*
        var outDir = path.join([
            path.dirname(picture_source).replace(/^_data/,'assets'),
            path.basename(picture_source)
        ]);
        */
        var outDir = picture_source.replace(/^_data/,'assets').replace(/\.txt$/,'');
        console.log('picture_source: ' + picture_source);
        console.log('outDir:         ' + outDir);

        var lines = data.split(/\r?\n/);
        var promises = [];
        var gallery = '';
        lines.forEach(function(line, i, array){
            line = line.trim();
            if (!line) {
                // skip blank lines
            } else if (line[0]==='#') {
                gallery = line.replace(/^#+\s/,'');
                //console.debug('gallery',gallery);
            } else {
                var inPath = line;
                promises.push(createPictures (inPath, outDir, gallery));
            }
        });

        Promise.all(promises).then(data => {
            console.log('all images created for: ' + picture_source);
            let json = {},
                gallery,
                gallery_last,
                gallery_slug;
            data.forEach(obj => {
                gallery = obj.gallery;
                gallery_slug = gallery == "" ? "gallery" : slug(gallery);
                delete obj.gallery;
                if (! json[gallery_slug]) { json[gallery_slug] = {}; }
                json[gallery_slug]["title"] = gallery;
                if (! json[gallery_slug]["pictures"]) { json[gallery_slug]["pictures"] = []; }
                (json[gallery_slug]["pictures"]).push(obj);
            });
            fs.writeJson(picture_source_lock, json, {spaces:'\t'})
                .then(() => {
                    console.log('created ' + picture_source_lock);
                })
                .catch(err => {
                    console.error(err);
                    process.exit(1);
                })
        });
    });
};



  /**
   * 
   * @param {String} inPath 
   * @param {String} outDir - Directory to put pictures in.
   * @returns {*} - What should it return? all image data, so calling script can write it to necessary files?
   */
const createPictures = function (inPath, outDir, gallery) {
    /* define paths */
    var file_name = path.basename(inPath);
    var ext = path.extname(file_name);
    var inName = path.basename(file_name, ext);
    var ext = ext.toLowerCase();
    var outPathThumb = path.join(outDir,inName + '-thumb' + ext);
    var outPathMed = path.join(outDir,inName + '-med' + ext);
    var outPath = path.join(outDir,inName + ext);

    /* TODO: should replace this with the async version, but I don't have the patients for that right now */
    fs.ensureDirSync(outDir);

    /* setup input picture */
    var pipeline = sharp(inPath).rotate().normalise();

    var taken = pipeline.metadata().then(metadata => {
        var exif = exifReader(metadata.exif);
        //console.log('picture taken ts ' + exif.exif.DateTimeOriginal);
        return exif.exif.DateTimeOriginal;
    });

    var thumb = pipeline.clone()
        .resize(236, 236)
        .sharpen()
        .jpeg({"quality":80,"progressive":true})
        .toFile(outPathThumb)
        .then(info => {
            var result = {"src": '/' + outPathThumb.replace(/\\/g,'/'), "w": info.width, "h": info.height};
            //console.log(JSON.stringify(result));
            return result;
        })
        .catch(err => {
            console.error(err);
            throw new Error('when creating med picture: ' + outPathThumb);
        });


    var med = pipeline.clone()
        .resize(1200, 1200)
        .max()
        .jpeg({"quality":80,"progressive":true})
        .toFile(outPathMed)
        .then(info => {
            var result = {"src": '/' + outPathMed.replace(/\\/g,'/'), "w": info.width, "h": info.height};
            //console.log(JSON.stringify(result));
            return result;
        })
        .catch(err => {
            console.error(err);
            throw new Error('when creating med picture: ' + outPathMed);
        });

    var orig = pipeline.clone()
        .resize(2048, 2048)
        .max()
        .jpeg({"quality":70,"progressive":true})
        .toFile(outPath)
        .then(info => {
            var result = {"src": '/' + outPath.replace(/\\/g,'/'), "w": info.width, "h": info.height};
            //console.log(JSON.stringify(result));
            return result;
        })
        .catch(err => {
            console.error(err);
            throw new Error('when creating med picture: ' + outPath);
        });

    return Promise.all([taken,thumb, med, orig])
        .then(data => {
            console.log('all images created for ' + inName + ext);
            var result = {
                "gallery": gallery,
                "file_name": file_name,
                "taken": data[0],
                "thumb": data[1],
                "med": data[2],
                "orig": data[3]
            }
            return result;
        })
        .catch(err => {
            console.error(err.message)
            process.exit(1);
            // might want to do better error reporting but bailing out completely on any error works for now
        });
};