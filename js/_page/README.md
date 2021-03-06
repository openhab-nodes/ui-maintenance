# Modifications

This library has been modified and is not meant to be upstream updated anymore!

Modifications:
* page.js: replaceContent - Support animation
* page.js: replaceNavReferences - Support link[rel="prev"] etc links in header
* page.js: addNewStyles/removeOldStyles instead of replaceStyle to prevent jerkiness/element jumps on page change

# @oom/page-loader

Javascript library to load pages using ajax and replace the content in the current page. It also can change the title, the url, css and javascript. You can use this library to improve the page load speed and create beautiful page transitions. It has the following features:

* No dependencies
* Superlight
* It can be used also with forms, not only links.
* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Built with ES6, so you may need a transpiler for old browser support

Other libraries with a similar purpose are [barba.js](https://github.com/luruke/barba.js/), [turbolinks](https://github.com/turbolinks/turbolinks) or [highway](https://github.com/Dogstudio/highway). The main aim of page-loader is to be lighter and less magical, in order to be more flexible and customizable.

## Install

Requirements:

* NPM or Yarn to install [the package and the dependencies](https://www.npmjs.com/@oom/page-loader)
* It uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for the http requests, so you can use a [fetch polyfill](https://github.com/github/fetch) and a [Promise polyfill](https://github.com/taylorhakes/promise-polyfill) to have [support for old browsers](https://caniuse.com/#feat=fetch)

```sh
npm install @oom/page-loader
```

## Usage

### HTML

Let's start with the following html code:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Page title</title>
    <link rel="stylesheet" href="styles.css">
    <script src="scripts.js"></script>
</head>
<body>
    <nav class="menu">
        <a href="section1.html">Section 1</a>
        <a href="section2.html">Section 2</a>
        <a href="section3.html">Section 3</a>
    </nav>
    <main class="content">
        <h1>This is the first section</h1>

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </main>
</body>
</html>
```

### Javascript

Use javascript for a complete experience:

```js
import Navigator from '@oom/page-loader';

//Create the navigator passing a callback executed to load new pages
// Loader: The object that load the new page
// Event: The event that starts the callback (click, submit, etc)

const nav = new Navigator((loader, event) => 
    //Load the page
    loader.load()
        .then(page =>
            page.replaceStyles()                      //Load the new css styles defined in <head> not present currently
                .then(page => page.replaceScripts())  //Load the new js files defined in <head> not present currently
                .then(page => replaceContent('main')) //Replace the <main> element
        )
);

//Init the navigation, capturing all clicks in links and form submits
nav.init();

//Optionally, you can filter links and forms to disable this behaviour
nav.addFilter(el => !el.classList.contains('no-loader'));

//For example, to disable forms:
nav.addFilter(el => el.tagName !== 'FORM');

//You can go manually to other url when you want
nav.go('https//example.com/page2.html');

//Or submit a form via ajax
const form = document.getElementById('my-form');
nav.submit(form);
```

### Page

A page instance contains the info about the loaded page. It has the following methods and properties:

```js
new Navigator(loader => {
    loader.load()
        .then(page => {
            page.replaceContent('#content'); //Replace an element in the document by the same element in the page
            page.appendContent('#content');  //Append the children of an element in the page to the same element in the document
            page.removeContent('#content > .unwanted');  //Remove content from the document
            page.replaceStyles();             //Change the css styles used in the new page (<link rel="stylesheet"> in <head>). Returns a Promise
            page.replaceScripts();            //Change the js styles used in the new page (<script src="..."> in <head>). Returns a Promise
            page.querySelector('p');         //Performs a document.querySelector in the page. Throws an exception on empty result
            page.querySelectorAll('p');      //Performs a document.querySelectorAll in the page. Throws an exception on empty result

            page.dom;                        //Returns a HTMLDocument with the content of the page
        })
});
```

By default, the `loader.html` object includes the property `html` with the html code to be reused.


## Demo

To run the demo, just clone this repository, enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`

There's an online demo here: https://oom-components.github.io/page-loader/
