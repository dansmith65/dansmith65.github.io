/*! customized initialization script
*/
var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.querySelectorAll('[data-index]'),
            numNodes = thumbElements.length,
            items = [],
            a,
            img,
            src,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {
            a = thumbElements[i];
            img = a.childNodes[0];

            src = a.getAttribute('href').replace(/\.jpg$/,'-med.jpg');
            size = a.getAttribute('data-size-med').split('x');

            // create slide object
            item = {
                pid: a.getAttribute('id'),
                src: src,
                fsrc: a.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10),
                el: img
            };

            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closestParent = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailClick = function(e) {
        e = e || window.event;
        var eTarget = e.target || e.srcElement;
        
        // onclick is bound to gallery container, so only act when an image is clicked
        if(eTarget.tagName.toUpperCase() === 'IMG') {
            var img = eTarget;
        } else {
            //console.log('eTarget',eTarget);
            return true;
        }

        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var a = closestParent(img, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'A');
        });

        var gallery = closestParent(img, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'DIV');
        });

        var index = a.getAttribute('data-index');

        if(index) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, gallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&gid=gallery-name&pid=DSC_4106.JPG)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
            params = {};

        if(hash.length < 12) {return params;}

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {continue;}
            var pair = vars[i].split('=');
            if(pair.length < 2) {continue;}
            params[pair[0]] = pair[1];
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        //console.log('openPhotoSwipe', index, galleryElement, disableAnimation, fromURL);
        var pswpElement = document.querySelectorAll('.pswp')[0],
            pswp,
            options,
            items,
            downloadAttrSupported = ("download" in document.createElement("a")),
            shareButtons = [];

        items = parseThumbnailElements(galleryElement);

        shareButtons.push({id:'open', label:'Open Full-Size', url:'{{raw_image_url}}'});
        if(downloadAttrSupported) {
            shareButtons.push({id:'download', label:'Download Full-Size', url:'{{raw_image_url}}', download:true});
        }

        options = {
            history: true,
            galleryPIDs: true,
            galleryUID: galleryElement.getAttribute('id'),
            bgOpacity: 0.9,
            clickToCloseNonZoomable: false,
			shareButtons: shareButtons,
			getImageURLForShare: function(shareButtonData) {
				return pswp.currItem.fsrc || '';
            },
            getThumbBoundsFn: function(index) {
                var thumbnail = items[index].el,
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(),
                    ratio = items[index].w/items[index].h,
                    x, y, w;

                if (ratio > 1) {
                    w = rect.width * ratio;
                    y = rect.top + pageYScroll;
                    x = rect.left - (w - rect.width) / 2;
                    // console.log('wider than thumbnail',x,y,w);
                } else {
                    w = rect.width;
                    y = rect.top + pageYScroll - ((rect.height / ratio) - rect.height) / 2;
                    x = rect.left;
                    // console.log('narrower than thumbnail',x,y,w);
                }

                return {x:x, y:y, w:w};
            }
        };

        options.index = parseInt(index, 10);

        // exit if index not found
        if( isNaN(options.index) ) {return;}

        if(disableAnimation) {options.showAnimationDuration = 0;}

        // Pass data to PhotoSwipe and initialize it
        pswp = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        pswp.init();

        // Close when tapping on background
        pswp.framework.bind( pswp.scrollWrap , 'pswpTap', function(e) {
            var tapped = e.target.className;
            //console.log(tapped);
            if (tapped == 'pswp__item' || tapped == 'pswp__zoom-wrap' ) {
                pswp.close();
            }
        });
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );
    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].onclick = onThumbnailClick;
    }

    // Parse URL and open gallery if it contains #&gid=gallery-name&pid=DSC_4106.JPG
    var hashData = photoswipeParseHash();
    if(hashData.gid) {
        var galleryElement = document.getElementById(hashData.gid);
        if(hashData.pid) {
            var index = document.getElementById(hashData.pid).getAttribute('data-index');
        } else {
            var index = 0; // default to first picture in the gallery
        }
        if(galleryElement && index >= 0) {
            openPhotoSwipe( index,  galleryElement, true, true );
        }
    }
};

// execute above function
initPhotoSwipeFromDOM('.picture-gallery');
