var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.getElementsByTagName('a'),
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
                src: src,
                msrc: src,
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
    var closestChild = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.childNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;
        
        var img = closestChild(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'IMG');
        });
        console.log("img",img);
        
        var a = closestParent(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'A');
        });
        console.log("a",a);

        var gallery = closestParent(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'DIV');
        });
        console.log("gallery",gallery);

        var pid = a.getAttribute('data-pswp-pid');
        console.log("pid",pid);

        if(pid) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( pid, gallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
            history: true,
            galleryPIDs: true,

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('id'),

            tapToClose: true,

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el,
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(),
                    ratio = items[index].w/items[index].h,
                    x, y, w;

                if (ratio > 1) {
                    // wider than thumbnail
                    w = rect.width * ratio;
                    y = rect.top + pageYScroll;
                    x = rect.left - (w - rect.width) / 2;
                } else {
                    w = rect.width;
                    y = rect.top + pageYScroll - ((rect.height / ratio) - rect.height) / 2;
                    x = rect.left;
                }

                return {x, y, w};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        var links = galleryElements[i].getElementsByTagName('a');
        for (var j = 0; j < links.length; j++) {
            links[j].setAttribute('data-pswp-pid', j);
            links[j].onclick = onThumbnailClick;
        }
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    var galleryElement = document.getElementById(hashData.gid);
    if(hashData.pid && hashData.gid && galleryElement) {
        openPhotoSwipe( hashData.pid ,  galleryElement, true, true );
    }
};

// execute above function
initPhotoSwipeFromDOM('.picture-gallery');
