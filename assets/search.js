var index; /* set by search-index.js file, once it's loaded */

/**
 * icon is hidden by default and enabled by javascript
 * since it requires javascript to work
 */
var search = new function(){
    /* public functions: initialize */

    /* private functions */
    var open, close, loadContainer, performSearch, showNotice;

    /* elements */
    var icon, container, input, result_container, notice;
    
    /* variables */
    var json;

    this.initialize = function(){
        /* if this file is loaded asyncrynously, DOM may be loaded when it starts */
        if (document.readyState == 'loading'){
            document.addEventListener("DOMContentLoaded",search.initialize);
            return false;
        }
        icon = document.getElementsByClassName("site-search")[0];
        icon.addEventListener("click", open);
    };

    /**
     * open search window
     */
    open = function(){
        if (!container){loadContainer();}
        container.classList.remove("hidden");
        input.focus();
        document.body.classList.add('noscroll');
    };

    close = function(){
        container.classList.add("hidden");
        if (input.value.length == 0 && result_container) {
            result_container.innerHTML = '';
            notice.classList.add('hidden');
        }
        document.body.classList.remove('noscroll');
    };

    loadContainer = function(){
        var html = ' \
            <section id="search" class="hidden"> \
                <div class="wrapper"> \
                    <header id="search-header"> \
                        <input type="search" results=5 name="site-search" placeholder="whatcha lookin for?"> \
                        <span class="search-close"><svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg></span> \
                    </header> \
                    <p class="hidden notice"></p> \
                    <ul class="post-list"></ul> \
                </div> \
            </section> \
        ';
        document.body.insertAdjacentHTML('beforeend', html);

        /* download elasticlunr and it's index */
        var script = document.createElement('script');
        script.src = "/assets/search-index.js";
        script.onload = function(){
            console.timeEnd('elasticlunr-load');
        };
        console.time('elasticlunr-load');
        document.body.insertAdjacentElement('beforeend', script);

        container = document.getElementById("search");
        input = container.getElementsByTagName("input")[0];

        input.addEventListener("keyup", function(e){
            if (e.which == 27){             /* Esc key */
                close();
            } else if (e.which == 13) {     /* Enter key */
                performSearch();
                input.blur();
            } else if (input.value.length >= 3) {
                performSearch();
            } else {
                if (result_container) {
                    result_container.innerHTML = '';
                    notice.classList.add('hidden');
                }
            }
        });

        /* close when clicking on background */
        container.addEventListener("click", function(e){
            if (e.target == container | e.target == container.getElementsByTagName("header")[0]){
                close();
            } else {
                // console.debug('clicked on:', e.target);
            }
        });
        container.getElementsByClassName('search-close')[0].addEventListener("click", close);
    };

    performSearch = function(){
        console.time('search');
        var query = input.value;
        var results = index.search(query,{
            fields: {
                tags: {boost: 4, bool: "AND"},
                title: {boost: 3, bool: "AND"},
                keywords: {boost: 2, bool: "AND"},
                content: {boost: 1, bool: "AND"}
            },
            expand: true
        });
        console.timeEnd('search');
        console.time('display');
        if (results.length == 0) {
            var results_msg = 'no results';
        } else if (results.length == 1) {
            var results_msg = results.length + ' result';
        } else {
            var results_msg = results.length + ' results';
        }
        showNotice('info', results_msg );
        if (!result_container) {
            result_container = container.getElementsByClassName('post-list')[0];
        }
        result_container.innerHTML = '';
        var doc, html;
        for (var i = 0; i < results.length; i++) {
            doc = index.documentStore.getDoc(results[i].ref);
            // console.debug('performSearch', 'foreach', 'doc', doc);
            var html_tags = '';
            if (doc.tags) {
                var tags = doc.tags.split(', ');
                for (var j = 0; j < tags.length; j++) {
                    html_tags += template_tag.replace(/%tag%/g, tags[j])
                }
            }
            html = template_li.replace(/%year%/g, doc.date.substring(0,4))
                       .replace(/%date%/g, doc.date)
                       .replace(/%url%/g, doc.url)
                       .replace(/%title%/g, doc.title)
                       .replace(/%excerpt%/g, doc.excerpt)
                       .replace(/%tags%/g, html_tags) ;
            result_container.insertAdjacentHTML('beforeend', html);
        }
        console.timeEnd('display');
    };

    showNotice = function(level,message){
        if (!notice){
            notice = container.getElementsByClassName("notice")[0];
        }
        notice.className = 'notice ' + level;
        notice.innerHTML = message ;
    };
};

search.initialize();
