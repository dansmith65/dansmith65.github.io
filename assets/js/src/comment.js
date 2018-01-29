/* if this file is loaded asyncrynously, DOM may be loaded when it starts */
if (document.readyState == 'loading'){
	document.addEventListener("DOMContentLoaded",initializeComments);
} else {
	initializeComments();
}

function initializeComments(){
	/* hide additional form fields until first field becomes active */
	var additional = document.getElementById("comment-form-additional");
	var message = document.getElementById("comment-form-message");
	additional.classList.add('hidden');
	/* Finds y value of given object: http://stackoverflow.com/a/11986153/1327931 */
	function findPos(obj) {
		var curtop = 0;
		if (obj.offsetParent) {
			do {
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		return [curtop];
		}
	}
	var expandCommentForm = function(){
		additional.classList.remove('hidden');
		window.scroll(0,findPos(message.parentElement));
		message.removeEventListener('focus', expandCommentForm);
	};
	message.addEventListener('focus', expandCommentForm);
	/* increase height of textarea as user types */
	message.oninput = function(){
		var h = window.innerHeight;
		if ( h <= 400 ) {
			var maxRows = 5 ;
		} else if ( h <= 700 ) {
			var maxRows = 10 ;
		} else if ( h <= 900 ) {
			var maxRows = 15 ;
		} else {
			var maxRows = 25 ;
		}
		while (message.scrollHeight > message.clientHeight) {
			if (message.rows >= maxRows ) {break;};
			message.rows += 1;
		}
	};
};


/* http://mycodingtricks.com/javascript/submit-form-using-javascript-ajax/ */
function submit_comment(commentForm){
	/* change form style while processing */
	commentForm.classList.add('disabled');
	
	/* get data from form */
	var method = commentForm.getAttribute("method");
	var action = commentForm.getAttribute("action");
	var notice = commentForm.getElementsByClassName("notice")[0];
	var submit = document.getElementById("comment-form-submit");
	var submitText = submit.innerHTML;
	var data = serialize(commentForm);
	//console.log(data);
	
	/* Submit Form Using Ajax */
	submit.innerHTML = "Sending...";
	var http = new XMLHttpRequest();
	http.open(method,action,true);
	http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	http.onload = function() {
		console.log(http.responseText);
		if (http.status == 200) {
			notice.innerHTML = "Thanks for your input! It has been submitted for moderation." ;
			notice.className = 'notice success';
			submit.classList.add('hidden');
			/* keep the comment form disabled because I don't want another submition */
		} else {
			error_action();
		}
	};
	http.onerror = function(e) {
		console.log('error', e);
		error_action();
	};

	var error_action = function() {
		notice.innerHTML = "<strong>Error!</strong> Sorry, something went wrong.<p><small>" + http.responseText + "</small></p>" ;
		notice.className = 'notice danger';
		commentForm.classList.remove('disabled');
		submit.innerHTML = submitText ;
	};

	http.send(data);
	return false;
}


/* https://code.google.com/archive/p/form-serialize/*/
function serialize(form) {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
	var i, j, q = [];
	for (i = form.elements.length - 1; i >= 0; i = i - 1) {
		if (form.elements[i].name === "") {
			continue;
		}
		switch (form.elements[i].nodeName) {
		case 'INPUT':
			switch (form.elements[i].type) {
			case 'email':
			case 'url':
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'checkbox':
			case 'radio':
				if (form.elements[i].checked) {
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				}						
				break;
			case 'file':
				break;
			}
			break;			 
		case 'TEXTAREA':
			q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
			break;
		case 'SELECT':
			switch (form.elements[i].type) {
			case 'select-one':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			case 'select-multiple':
				for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
					if (form.elements[i].options[j].selected) {
						q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch (form.elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
				break;
			}
			break;
		}
	}
	return q.join("&");
}
