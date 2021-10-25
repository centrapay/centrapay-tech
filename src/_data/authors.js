'use strict';

class Author {

  constructor(props) {
    this.id = props.id;
    this.name = props.name;
    this.twitterHandle = props.twitter;
    this.linkedInHandle = props.linkedIn;
    this.img = props.img;
  }

  static make(props) {
    return new Author(props);
  }

  get twitterUrl() {
    return `https://twitter.com/${this.twitterHandle}`;
  }

  get linkedInUrl() {
    return `https://www.linkedin.com/in/${this.linkedInHandle}/`;
  }
}

const authorsList = [
  {
    id: 'nathan',
    name: 'Nathan Jones',
    twitter: '_ncjones',
    linkedIn: 'nathan-c-jones',
    img: '/img/nathan-bfde749b7bf5332e977dc6f3da9ba51b.jpg',
  }
].map(Author.make);

const authorsById = {};
authorsList.forEach(a => authorsById[a.id] = a);

module.exports = {
  list: authorsList,
  byId: authorsById,
};
