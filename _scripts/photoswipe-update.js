/**
 * Copy files from a GitRepo in another directory to project files.
 * 
 * @AUTHOR Daniel Smith dan@dansmith65.com
 */

const fs = require('fs-extra');

fs.copy('../../PhotoSwipe/dist/photoswipe.js', 'assets/js/src/photoswipe/photoswipe.js', err => {
    if (err) return console.error(err);
    console.log('photoswipe.js copied');
})

fs.copy('../../PhotoSwipe/dist/photoswipe-ui-default.js', 'assets/js/src/photoswipe/photoswipe-ui-default.js', err => {
    if (err) return console.error(err);
    console.log('photoswipe-ui-default.js copied');
})

fs.copy('../../PhotoSwipe/src/css', '_sass/photoswipe', err => {
    if (err) return console.error(err);
    console.log('scss copied');
})

fs.copy('_sass/photoswipe/default-skin/preloader.gif', 'assets/images/photoswipe/preloader.gif', err => {
    if (err) return console.error(err);
    console.log('preloader.gif copied');
})

fs.copy('_sass/photoswipe/default-skin/default-skin.png', 'assets/images/photoswipe/default-skin.png', err => {
    if (err) return console.error(err);
    console.log('default-skin.png copied');
})

fs.copy('_sass/photoswipe/default-skin/default-skin.svg', 'assets/images/photoswipe/default-skin.svg', err => {
    if (err) return console.error(err);
    console.log('default-skin.svg copied');
})
