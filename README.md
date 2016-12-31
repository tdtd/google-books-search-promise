# google-books-search-promise
A promisified wrapper for Google Books search API
### Install
  npm install google-books-search-promise

### Require
let gbs = require('google-books-search-promise')('API Key');

### Methods
- search {function} - In depth search function, that supports Multiple query options.
- searchByTitle {function} - Search for a specific title using only a string.

### gbs.search
 - query
 
 Only query.q is required
```javascript
  query {
    q : '(String) Search for volumes that contain this text string.'
    intitle: '(String) Returns results where the text following this keyword is found in the title.'
    inauthor: '(String) Returns results where the text following this keyword is found in the author.'
    inpublisher: '(String) Returns results where the text following this keyword is found in the publisher.'
    subject: '(String) Returns results where the text following this keyword is listed in the category list of the volume.'
    isbn: '(String) Returns results where the text following this keyword is the ISBN number.'
    lccn: '(String) Returns results where the text following this keyword is the Library of Congress Control Number.'
    oclc: '(String) Returns results where the text following this keyword is the Online Computer Library Center number.'
  }
```

- options

  Both options are required
```javascript
  options {
    offset : '(Number) Offset number for pagination'
    limit: '(Number) The maximum number of entries to return. must be between 1 and 40'
  }
```

```javascript
gbs.search(query, options)
  .then(result => {
    console.log(result);
  })
  .catch( error => {
    console.log(error);
  });
  ```
  
### gbs.searchByTitle
 - title

```javascript
  title {string}
```

- options

  Both options are required
```javascript
  options {
    offset : '(Number) Offset number for pagination'
    limit: '(Number) The maximum number of entries to return. must be between 1 and 40'
  }
```

```javascript
gbs.searchByTitle(title, options)
  .then(result => {
    console.log(result);
  })
  .catch( error => {
    console.log(error);
  });
  ```