/*
  __  __  _____ ____  _              _____ _                 
 |  \/  |/ ____|  _ \| |            / ____| |                
 | \  / | |  __| |_) | | ___   __ _| (___ | |_ ___  _ __ ___ 
 | |\/| | | |_ |  _ <| |/ _ \ / _` |\___ \| __/ _ \| '__/ _ \
 | |  | | |__| | |_) | | (_) | (_| |____) | || (_) | | |  __/
 |_|  |_|\_____|____/|_|\___/ \__, |_____/ \__\___/|_|  \___|
                               __/ |                         
                              |___/     

* MG Blogstore
*
* Copyright (c) 2017 Mad Genius Inc (https://madg.com)
*
* By Blake Watson (@blakewatson)
* Licensed under the MIT license.
*
* @link https://github.com/Mad-Genius/mg-blogstore
* @author Blake Watson
* @version 0.1.0
*/

function MGBlogStore(options) {
	this.options = this.mergeOptions(options);
	this.posts = [];
	this.currentPage = 1;
	this.totalPages = 1;
	this.perPage = this.options.perPage;
	this.stickyQuery = 'exclude=';
	this.categories = [];
	this.baseURL = this.options.baseURL;
	this.customQuery = this.options.customQuery;
}

MGBlogStore.prototype.getFirstPage = function(callback) {
	var store = this;
	var posts, numOfPostPages, categories;
	var stickyPosts = [];
	var postRequest, categoriesRequest;
	var stickyRequest = fetch(store.baseURL + '/posts?sticky=true&per_page=100&' + store.customQuery);
	
	store.postsURL = store.baseURL + '/posts?';

	return new Promise(function(resolve, reject) {
		stickyRequest.then(store.json).then(function(stickyResponse) {
			if(stickyResponse.length > 0) {
				// save sticky posts
				store.posts = [].concat(stickyResponse);

				var stickyIDList = stickyResponse.map(function(post, i) {
					return post.id;
				});

				// save sticky ids
				store.stickyQuery += stickyIDList.join(',');
			} else {
				// else clear out sticky exclude query param
				store.stickyQuery = '';
			}

			// get categories
			categoriesRequest = fetch(store.baseURL + '/categories?per_page=100');

			categoriesRequest.then(store.json).then(function(categoriesResponse) {
				// get categories from response
				store.categories = categoriesResponse;
				// get the first page of posts
				store.getPosts().then(function() {
					// all done, resolve the promise
					resolve(store);
				});
			});
		});
	});
};

MGBlogStore.prototype.getPosts = function() {
	var store = this;
	var url = store.postsURL;
	var queryParts = [];
	if(store.stickyQuery !== '') queryParts.push(store.stickyQuery);
	queryParts.push('page=' + store.currentPage);
	queryParts.push('per_page=' + store.perPage);
	queryParts.push(store.customQuery);
	url += store.makeQueryString(queryParts);

	return new Promise(function(resolve, reject) {
		fetch(url).then(function(response) {
			store.totalPages = response.headers.get('X-WP-TotalPages');
			store.currentPage++;
			return response.json();
		}).then(function(json) {
			store.posts = store.posts.concat(json);
			resolve();
		});
	});
};

MGBlogStore.prototype.getAllPages = function() {
	var store = this;
	return new Promise(function(resolve, reject) {
		function whileHavePosts() {
			if(store.currentPage <= store.totalPages) {
				store.getPosts().then(function() {
					whileHavePosts();
				});
			} else {
				resolve(store);
			}
		}
		whileHavePosts();
	});
};

MGBlogStore.prototype.makeQueryString = function(queryParts) {
	return queryParts.join('&');
};

MGBlogStore.prototype.mergeOptions = function(options) {
	var defaults = {
		perPage: 10,
		customQuery: '',
		baseURL: '/wp-json/wp/v2'
	};

	if(typeof options === 'object') {
		for(var option in defaults) {
			if(options.hasOwnProperty(option)) {
				defaults[option] = options[option];
			}
		}
	}

	return defaults;
}

MGBlogStore.prototype.json = function(response) {
	return response.json();
};
