const _ = require('lodash');
const queryString = require('query-string');
const Promise = require('bluebird');
let request = require('request');

let url = 'https://www.googleapis.com/books/v1/volumes?q=';

/**
 *  Connect to Google Books API
 *  url {string} - URL to request information from
 */
function apiRequest(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, resp, body) => {
      if (err) return reject(err);
      if (resp.statusCode == 200){
        let data = JSON.parse(body);
        if ("items" in data){
          return resolve(parseBook(data));
        } else {
          return reject(new Error("No books found"));
        }  
      }
    })
  })
}
/**
 * Parse the data returned from the Google Books API
 * data {object} - object in "items" array from Google Books API, keys may change
 */
function parseBook(data) {
  let info = data.items.map((obj) => {
    let book = _.pick(obj.volumeInfo, [
      'title', 'subtitle', 'authors', 'publisher', 'publishedDate', 'description',
      'industryIdentifiers', 'pageCount', 'printType', 'categories', 'averageRating',
      'ratingsCount', 'maturityRating', 'language', 'infoLink'
    ]);
    _.extend(book, {
      id: obj.id,
      link: obj.volumeInfo.canonicalVolumeLink,
      thumbnail: _.get(obj, 'volumeInfo.imageLinks.thumbnail'),
      images: _.pick(obj.volumeInfo.imageLinks, ['smallThumbnail', 'thumbnail', 'small', 'medium', 'large', 'extraLarge'])
    });
    return book;
  })
  return info;
};

/**
 *  Creates the Google Book Search Class
 *  @Constructor
 *  @param {string} apikey - apikey from https://console.developers.google.com
 */
class GBS {
  
  constructor(apikey) {
    this.apiKey = apikey;
  }
  
  /**
   *  Most Flexible search, requires Query.q
   *  query {object} - An object that allows "intitle", "inauthor", "inpublisher", "subject", "isbn", "lccn", "oclc"
   *  options {object} - Requires a limit and an offset key
   *  * limit {number} - The maximum number of results to return (between 1 and 40)
   *  * offset {number} - The number of results to offset to allow for pagination
   */
  search(query, options){
    let self = this,
        qType = ["intitle", "inauthor", "inpublisher", "subject", "isbn", "lccn", "oclc"],
        offset,
        limit;
    return new Promise((resolve, reject) => {
      if (!query || !('q' in query)) {
        return reject(new Error('Query is required'));
      }
      
      if (options.offset < 0 || (!"offset" in options) || typeof options.offset === 'undefined') {
        return reject(new Error('Offset must be 0 or greater.'));
      } 
      
      if (options.limit < 1 || options.limit > 40 || !("limit" in options) || typeof options.limit === 'undefined') {
        return reject(new Error('You must set limit to be between 1 and 40.'));
      } 
      
      let uri = url + query.q;
      qType.forEach((type) => {
        if (type in query){
          uri += '+'+type+':'+query[type];
        }
      });
      uri += "&startIndex="+options.offset;
      uri += "&maxResults="+options.limit;
      uri += "&key="+self.apiKey;

      return resolve(apiRequest(uri));
    })
  }
  
  /**
   * Only search for books using the title
   *  title {string} - The title of the book
   *  options {object} - Requires a limit and an offset key
   *  * limit {number} - The maximum number of results to return (between 1 and 40)
   *  * offset {number} - The number of results to offset to allow for pagination
   */
  searchByTitle(title, options){  
    return new Promise((resolve, reject) => {
      if (!title) {
        return reject(new Error('Title is required'));
      }
      
      if (options.offset < 0 || (!"offset" in options) || typeof options.offset === 'undefined') {
        return reject(new Error('Offset must be 0 or greater.'));
      } 
      
      if (options.limit < 1 || options.limit > 40 || !("limit" in options) || typeof options.limit === 'undefined') {
        return reject(new Error('You must set limit to be between 1 and 40.'));
      } 
      
      let uri = url+title+"&intitle="+title;
      uri += "&startIndex="+options.offset;
      uri += "&maxResults="+options.limit;
      uri += "&key="+this.apiKey;
      return resolve(apiRequest(uri));
    })
  }
  
  
}

module.exports = function(apiKey){ return new GBS(apiKey)};