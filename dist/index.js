'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ghComments;
var fs = require('fs');
var request = require('request');

/**
 * Get the json of articles whose issues has already been created
 */
function getArticlesJSON(options) {
  return new Promise(function (resolve, reject) {
    if (fs.existsSync(options.jsonPath)) {
      fs.readFile(options.jsonPath, function (err, data) {
        if (err) return reject(err);

        return resolve(JSON.parse(data));
      });
    } else {
      resolve({});
    }
  });
}

/**
 * Save the updated json of articles whose issues has already been created
 */
function saveArticlesJSON(createdIssues, options) {
  return new Promise(function (resolve, reject) {
    var data = JSON.stringify(createdIssues, null, 2);

    fs.writeFile(options.jsonPath, data, function (err) {
      if (err) return reject(err);

      return resolve();
    });
  });
}

function createIssues(articles, createdIssues, options) {
  var withoutIssue = articles.filter(function (article) {
    return !createdIssues[article[options.idProperty]];
  });

  if (!withoutIssue.length) {
    console.log('All articles have a related Github issue for comments.');
    return Promise.resolve(createdIssues);
  }

  var requests = withoutIssue.map(function (article) {
    return new Promise(function (resolve, reject) {
      var requestOptions = {
        method: 'POST',
        url: 'https://api.github.com/repos/' + options.username + '/' + options.repo + '/issues',
        body: options.getIssue(article),
        json: true,
        headers: {
          Authorization: 'token ' + options.token,
          'User-Agent': options.username
        }
      };

      request(requestOptions, function (error, response, body) {
        if (error) return reject(error);
        if (response.statusCode >= 400) return reject(body);

        resolve(body);
      });
    });
  });

  return Promise.all(requests).then(function (responses) {
    withoutIssue.forEach(function (article, index) {
      var articleId = article[options.idProperty];
      var issueId = responses[index].number;
      createdIssues[articleId] = { issueId: issueId };
      console.log('Created issue #' + issueId + ' for article ' + articleId + '.');
    });

    return createdIssues;
  });
}

var defaultOptions = {
  jsonPath: 'gh-comments.json',
  idProperty: 'id',
  getIssue: function getIssue(article) {
    return {
      title: 'Comments: ' + article.title,
      body: 'This issue is reserved for comments to **' + article.title + '**. Leave a comment below and it will be shown in the blog page.',
      labels: ['comments']
    };
  }
};

/**
 * Create a Github issue for every article without a comments issue yet
 *
 * @param {Array<any>} articles List of articles
 * @param {Object} options Options
 * @param {string} options.idProperty Article property to use as unique id
 * @param {string} options.jsonPath Path to the JSON file where articles issue ids are stored
 * @param {Function} options.getIssue Returns the issue data based on the article
 * @param {string} options.username Github username
 * @param {string} options.repo Github repository name
 * @param {string} options.token Github OAuth token
 *
 * @returns {Promise}
 */
function ghComments(articles, userOptions) {
  var options = Object.assign({}, defaultOptions, userOptions);

  return getArticlesJSON(options).then(function (createdIssues) {
    return createIssues(articles, createdIssues, options);
  }).then(function (createdIssues) {
    saveArticlesJSON(createdIssues, options);
    return createdIssues;
  });
}
