# MG Blogstore

MG Blogstore fetches all posts from the WordPress REST API. It can get the first page of posts first, give you an opportunity to do something with those posts, and then make recursive calls to the API for the rest of the posts.

Only the `post` post type and its categories are supported, currently. It assumes REST API v2. There are a few configuration [options](#options), with more on the roadmap.

## Installation

```html
<script src="mg-blogstore.js"></script>
```

## Usage

```js
var blogStore = new MGBlogStore();

blogStore
    .getFirstPage()
    .then(function(store) {
        // do something with the first page of posts
        // you access store.posts and store.categories here
        return store.getAllPages(); // begin recursively getting more posts
    })
    .then(function(store) {
        // do something when all posts have been retrieved
    });
```

### The `MGBlogstore` instance

Your `MGBlogstore` instance has access to:

- `.posts`: an array of all the posts in the store at the given moment.
- `.categories`: an array of all the categories (max 100).

## Options

You can tell MG Blogstore how many posts per page you want. You can also pass a custom query string that will be appended to every request (for example if you were using the [REST API – Filter Fields](https://wordpress.org/plugins/rest-api-filter-fields/) plugin).

```js
var blogStore = new MGBlogStore({
    perPage: 30,
    customQuery: 'fields=id,title,link,date,excerpt.rendered,categories'
});
```