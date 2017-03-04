document.addEventListener("DOMContentLoaded",function(){
	/* hide additional form fields until first field becomes active */
	var commentFormAdditional = document.getElementById("comment-form-additional");
	var commentFormMessage = document.getElementById("comment-form-message");
	commentFormAdditional.classList.add('hidden');
	var commentFormMessageOnFocusDone = false;
	commentFormMessage.onfocus = function(){
		if (!commentFormMessageOnFocusDone) {
			commentFormAdditional.classList.remove('hidden');
			commentFormMessageOnFocusDone = true;
		}
	};
	commentFormMessage.oninput = function(){
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
		while (commentFormMessage.scrollHeight > commentFormMessage.clientHeight) {
			if (commentFormMessage.rows >= maxRows ) {break;};
			commentFormMessage.rows += 1;
		}
	};
});


/* http://mycodingtricks.com/javascript/submit-form-using-javascript-ajax/ */
function submit_comment(commentForm){
	/* change form style while processing */
	commentForm.classList.add('disabled');
	
	/* get data from form */
	var method = commentForm.getAttribute("method");
	var action = commentForm.getAttribute("action");
	var notice = commentForm.getElementsByClassName("notice");
	notice = notice[0];
	var submit = document.getElementById("comment-form-submit");
	var submitText = submit.innerHTML;
	var data = serialize(commentForm);
	//console.log(data);
	
	/* Submit Form Using Ajax */
	submit.innerHTML = "Sending...";
	var http = new XMLHttpRequest();
	http.open(method,action,true);
	http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	/* TODO: use try/catch?  http://help.dottoro.com/ljppxrti.php */
	http.onload = function() {
		console.log(http.responseText);
		if (http.status == 200) {
			/* success */
			notice.innerHTML = "Thanks for your input! It has been submitted for moderation." ;
			notice.classList.remove('danger');
			notice.classList.add('success');
			notice.classList.remove('hidden');
			submit.classList.add('hidden');
			/* keep the comment form disabled because I don't want another submition */
		} else {
			/* show error */
			notice.innerHTML = "<strong>Error!</strong> Sorry, something went wrong.<p><small>" + http.responseText + "</small></p>" ;
			notice.classList.remove('success');
			notice.classList.add('danger');
			notice.classList.remove('hidden');
			commentForm.classList.remove('disabled');
			submit.innerHTML = submitText ;
		}
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