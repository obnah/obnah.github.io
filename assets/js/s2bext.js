
Vue.component('s2bext-navi', {
	template: '<div>A Customer Component!</div>'
})


var s2bext = new Vue({
	el: '#s2bext',
	data: {
		message: 'hello world.'
	}
})

var app3 = new Vue({
	el: '#app-3',
	data: {
		seen: false
	}
})
