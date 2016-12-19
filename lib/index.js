const _ = require('lodash');
const queryString = require('query-string');
const Promise = require('bluebird');
let request = require('request');

let url = 'https://www.googleapis.com/books/v1/volumes?';

class GBS {
  
  constructor(apikey) {
    this.apiKey = apikey;
  }
  
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
      
      let uri = url + 'q='+ query.q;
      qType.forEach((type) => {
        if (type in query){
          uri += '+'+type+':'+query[type];
        }
      });
      uri += "&startIndex="+options.offset;
      uri += "&maxResults="+options.limit;
      uri += "&key="+self.apiKey;
      request(uri, (err, resp, body) => {
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
  
}

function parseBook(data) {
  let info = data.items.map((obj) => {
    let book = _.pick(obj.volumeInfo, [
      'title', 'subtitle', 'authors', 'publisher', 'publishedDate', 'description',
      'industryIdentifiers', 'pageCount', 'printType', 'categories', 'averageRating',
      'ratingsCount', 'maturityRating', 'language'
    ]);
    _.extend(book, {
      id: obj.id,
      link: obj.volumeInfo.canonicalVolumeLink,
      thumbnail: _.get(obj, 'volumeInfo.imageLinks.thumbnail'),
      images: _.pick(obj.volumeInfo.imageLinks, ['small', 'medium', 'large', 'extraLarge'])
    });
    return book;
  })
  return info;
};


module.exports = function(apiKey){ return new GBS(apiKey)};