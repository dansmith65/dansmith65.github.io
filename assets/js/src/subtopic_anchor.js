function subtopicAnchor (selector) {
	var els = document.querySelectorAll(selector),
		id,
		a;
	for(var i = 0, l = els.length; i < l; i++) {
		id = els[i].getAttribute('id');
		if(id) {
			a = document.createElement('a');
			a.className = 'subtopic_anchor';
			a.href = '#' + id;
			a.innerText = '#';
			els[i].appendChild(a);
		}
	}
}

subtopicAnchor('h2, h3, h4, h5, h6');
