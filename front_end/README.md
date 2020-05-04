### Getting Started

1. `npm install`

2. `npm start`

3. should be served in localhost:3000

### If you find the infamous gateway error
1. putty into amazon web service virtual computer

2. type `sudo node /var/www/backend/team-gold/backend/dist/server.js &`


### !!We are not using mithril anymore!!

### What is Mithril and what the hell is virtual DOM?

Mithril is a framework very very similar to react, and like react, it has a concept of "virtual dom".
A virtual dom (VDOM) is a representation of html document (DOM), as a plain javascript object. Since the DOM
is a tree of html elements, so is our virtual dom representation tree of javascript objects. 

The first time a virtual DOM tree is rendered, 
it is used as a blueprint to create a html document tree that matches its structure.

Typically, virtual DOM trees are then recreated every render cycle, which normally occurs in 
response to event handlers or to data changes. Mithril diffs this new virtual DOM tree against its previous 
virtual DOM tree and only modifies DOM elements in spots where there are changes.

It may seem wasteful to recreate virtual DOM tree so frequently, but as it turns out, modern JavaScript engines 
can create hundreds of thousands of objects in less than a millisecond. On the other hand, modifying 
the actual DOM is several orders of magnitude more expensive than creating vnodes.  

For that reason, Mithril uses a sophisticated and highly optimized virtual DOM diffing algorithm to minimize 
the amount of DOM updates.


### What is JSX?

JSX is a syntax extension that enables you to write HTML tags interspersed with JavaScript.

Whenever we ask mithril framework to display somehting, we send it a JSX.
This JSX is actually syntactic convinience to mithril function calls.
Whenever we run our bundler by `npm run rollup`, big part of what happens
is unwrapping that JSX syntax to mithril function calls:
So, `<div>Hello world</div>` is converted to `mithril('div', 'hello world')`
and `<div><p>Hello world</p></div>` is converted to `mithril('div', [ mithril('p', 'hello world') ])`


### Main benefit of using a VDOM Framework (Mithril, React, etc.) is that it makes state driven UI code easy to write:

 If we tried state driven code in jquery:
 ```javascript
  state.onChange = function(state) {
    if (this was called first time) {
      create ui and initialize event listeners
    } else if (should i update) {
      update ui
    } else if (should i destroy) {
      destroy ui and uninitialize event listeners
    }
  }
```

  this may seem trivial, but just to give you an idea:
  Here is what managing list of items looks like, which could be filtered by typing on input box:

```javascript
  //View
  export class View {

    constructor(state) {
      this.rootEl = $(`
        <div>
          <input id="filter"/>
          <ul id="list"></ul>
        </div>
      `);
      this.state = state;
      this.isListInitialized = false;
    }

    start() {
      $('body')
        .empty()
        .append(this.rootEl);

      const state = this.state;

      //note this is also a major setback of manipulating DOM directly:
      //u HAVE TO make sure that listeners are initialized once and exactly once.
      //thus wrapping that listener initialization logic in start() method call
      $('#filter')
        .on('input', e => {
          state.setFilterText(e.target.value);
        });

      $('#list > li')
        .on('click', () => {
          const el = $(this);
          const id = parseInt(el.attr('data-schoolId'));
          state.setSelectedSchool(id);
        });
      
      state.onSchoolListFiltered = schools => {
        this.setFilteredSchools(schools);
      };

      state.onFilterChange = filter => {
        $('#filter').val(filter)
      }
    }

    setFilteredSchools(schools) {
      if (this.isListInitialized) {
        //update list
        $('#list > li')
          .each(function() {
            const el = $(this);
            const dataSchoolId = parseInt(el.attr('data-schoolId'));
            const shouldShow = filteredIds.indexOf(dataSchoolId) >= 0;
            if (shouldShow) {
              el.animate({
                height: 'show',
                padding: 'show'
              })
            } else {
              el.animate({
                height: 'hide',
                padding: 'hide'
              })
            }
          });
      } else {
        this.isListInitialized = false;
        //create list
        
        const els = schools.map(school => `
          <li data-schoolId=${school.id}>${school.name}</li>`).join('');

        $('#list').empty().append(els);
      }
    }

    clear() {
      //destroy view
      $('body')
        .empty();

      //TODO: remove listeners from the state as well
    }
  }

  //this will be used in as:
  const view = new View(state);
  view.start();
```

  While with Mithril we will do something like

```javascript
  const View = ({ state }) => {
    //note that i am initializing onclick handler on every call to this function
    //no matter, mithril will take care.
    const listItems = state.schools.map(school => (
      <li onclick={() => state.setSelectedSchool(school.id)}>{school.name}</li>
    ))
    <div>
      <input oninput={e => { state.setFilter(e.target.value) }} value={state.filter}>
      <ul>
        {listItems}
      </ul>
    </div>
  }

  //this will be used as

  state.onSchoolListFiltered = schools => {
    render(View({state}));
  };

  state.onFilterChange = schools => {
    render(View({state}));
  };
```
As u can see in mithril case, i am blindly rendering no matter what state change is.
render is call to mithril library

Basically, I found it impossibly difficult trying to manage complex UI/state code like dialogs, loading screen, modals, etc in Jquery like imperative style.  
Mithril documentation says it well, "The reason Mithril goes to such great lengths to support a rendering model that recreates the 
entire virtual DOM tree on every render is to provide a declarative API, a style of rendering that makes it drastically easier to manage UI complexity.".