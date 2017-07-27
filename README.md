# gh-issues-for-comments

[![npm](https://img.shields.io/npm/v/gh-issues-for-comments.svg)](https://www.npmjs.com/package/gh-issues-for-comments)

Automatically open a **Github issue as blog comments** for every articles of your blog. It also creates a `gh-comments.json` file to keep track of created issues for future executions and to open issues only for new articles.

This package is useful if you have a statically generated blog, such as [Jekyll](https://jekyllrb.com) or [Metalsmith](http://www.metalsmith.io), and you want to use Github issues as comments instead of the evil `Disqus`. For more details read [Replacing Disqus with Github Comments](http://donw.io/post/github-comments/) or [Using GitHub Issues for Blog Comments](http://artsy.github.io/blog/2017/07/15/Comments-are-on/)

## Install

```
npm install gh-issues-for-comments --save
```

## Usage

```javascript
import ghComments from 'gh-issues-for-comments';

// Array of articles with any shape you like, for example obtained from Markdown files. 
// If you use default options each article must have 'id' and 'title' properties
const articles = [
  { id: 1, title: 'Hello world' }, 
  { id: 2, title: 'Hello world 2' }
];

ghComments(articles, {
  username: 'jiayihu',
  repo: 'blog',
  token: '123GithubOAuthToken',
})
  .then(createdIssues => console.log(createdIssues))
  .catch(error => console.error('Error with issues creation', error));
```

## API

### ghComments(articles, options): Promise

Create a Github issue for every article without a comments issue yet. Returns a `Promise` with the updated map with `<article, issueId>` pairs. It's the same object saved in `gh-comments.json`.

`articles` is an `Array` of articles objects with any shape. Each article will be used to return the data for its issue in `getIssue(article)` option.

`options` has the following shape:

- **options.username** (*required*)
  
  Type: `string`
  
  Github username

- **options.repo** (*required*)
  
  Type: `string`
  
  Github repository name

- **options.token** (*required*)
  
  Type: `string`
  
  Github OAuth access token. Read [here](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) for more details. The only `scope` needed by the package is `public_repo`.

- **options.idProperty** (*optional*)
  
  Type: `string`

  Default value: `id`
  
  Article property to use as unique id. If an id is not available, it's recommended to use something meaninful but not likely to change like the filepath or title.

- **options.jsonPath** (*optional*)
  
  Type: `string`

  Default value: `gh-comments.json`
  
  Path to the JSON file where articles issue ids are stored

- **options.getIssue** (*optional*)
  
  Type: `Function`

  Default value: 
  ```javascript
  function getIssue(article) {
    return {
      title: `Comments: ${article.title}`,
      body: `This issue is reserved for comments to **${article.title}**. Leave a comment below and it will be shown in the blog page.`,
      labels: ['comments'],
    };
  }
  ```
  
  Returns the issue data based on the article. If you want the article name, in the issue body, to be linked you can use the following value:

  ```javascript
  function getIssue(article) {
    const formattedTitle = article.title.replace(/\s/g, '-').toLowerCase();
    const articleUrl = url.resolve('http://blog.jiayihu.net', formattedTitle);

    return {
      title: `Comments: ${article.title}`,
      body: `This issue is reserved for comments to [${article.title}](${articleUrl}). Leave a comment below and it will be shown in the blog page.`,
      labels: ['comments'],
    };
  },
  ```
