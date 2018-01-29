---
---
{% include js/elasticlunr.min.js %}

index = elasticlunr(function () {
	this.addField('title');
	this.addField('tags');
	this.addField('keywords');
	this.addField('content');
});

{% for post in site.posts %}
index.addDoc({
  id       : {{ forloop.index }},
  title    : {{ post.title | jsonify }},
  tags     : {{ post.tags | join: ', ' | jsonify }},
  keywords : {{ post.keywords | join: ', ' | jsonify }},
  excerpt  : {{ post.excerpt | strip_html | normalize_whitespace | jsonify }},
  content  : {{ post.content | strip_html | normalize_whitespace | jsonify }},
  url      : "{{ post.url | relative_url }}",
  date     : "{{ post.date | date: site.date_format }}"
});
{% endfor %}


var template_tag = '<a class="post-tag" href="/blog/tags/%tag%/">%tag%</a> ';
var template_li = ' \
<li><article> \
  <header><h2><a href="%url%"><span>%title%</span></a></h2></header> \
  <footer class="post-footer"> \
    <time><a href="/blog/%year%/" title="All posts in %year%">%date%</a></time> \
    <span class="post-tags">%tags%</span> \
  </footer> \
  <div>%excerpt%<a href="%url%">...keep reading</a></div> \
</article></li> \
';
