/**
 * Copy files from node_modules to project files.
 * 
 * @AUTHOR Daniel Smith dan@dansmith65.com
 */

const fs = require('fs-extra');

//npm update -D photoswipe

fs.copy('node_modules/photoswipe/dist/photoswipe.min.js', '_includes/js/photoswipe.min.js', err => {
    if (err) return console.error(err);
    console.log('photoswipe.min.js copied');
})

fs.copy('node_modules/photoswipe/dist/photoswipe-ui-default.min.js', '_includes/js/photoswipe-ui-default.min.js', err => {
    if (err) return console.error(err);
    console.log('photoswipe-ui-default.min.js copied');
})

fs.copy('node_modules/photoswipe/dist/photoswipe-ui-default.js', '_includes/js/photoswipe-ui-default.js', err => {
    if (err) return console.error(err);
    console.log('photoswipe-ui-default.js copied');
})

fs.pathExists('_sass/photoswipe', (err, exists) => {
    if (err) return console.error(err);
    if (exists) {
        console.log("scss already existed, so it wasn't touched");
    } else {
        fs.copy('node_modules/photoswipe/src/css', '_sass/photoswipe', err => {
            if (err) return console.error(err);
            console.log('scss copied');
        })
    }
})

fs.copy('_sass/photoswipe/default-skin/preloader.gif', 'assets/photoswipe/preloader.gif', err => {
    if (err) return console.error(err);
    console.log('preloader.gif copied');
})

fs.copy('_sass/photoswipe/default-skin/default-skin.png', 'assets/photoswipe/default-skin.png', err => {
    if (err) return console.error(err);
    console.log('default-skin.png copied');
})

fs.copy('_sass/photoswipe/default-skin/default-skin.svg', 'assets/photoswipe/default-skin.svg', err => {
    if (err) return console.error(err);
    console.log('default-skin.svg copied');
})
