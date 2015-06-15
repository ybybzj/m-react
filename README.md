Introduction
======
mReact is a fork library of [Mithril](https://lhorie.github.io/mithril/getting-started.html), which is  a client-side Javascript MVC framework and provides a templating engine with a virtual DOM diff implementation for performant rendering, utilities for high-level modelling via functional composition, as well as support for routing and componentization.

For people used to [React](https://facebook.github.io/react/)(by facebook), Mithril is just a little bit quirky. And sometimes, we just need a pure render engine with a virtual DOM diff implementation. React though is great, is too big for mobile site(around 80k by gzip).

Hence, here is the "mReact". 
* Only 7.7k by gzipped.
* Similar usage to React, include lifecycle methods, createCompoenet factory method(similar to createClass)
* Support MSX syntax(similar to JSX) by using [MSX by Jonathan Buchanan](https://github.com/insin/msx)
* Support Event Delegation(propperty name start with 'ev')

Usage
------
code:
```javascript
    var m = require('m-react');
    var MyComponent = m.createComponent({
        render: function(props, state){
            return (
                <div>
                    <input type={"text"} evChange={this.onChange)}/>
                    <p backgroundColor={props.backgroundColor}>{state.date}</p>
                </div>
            );
        },
        getInitialState: function(){
            return {
                date: (new Date).toString()
            };
        },
        onChange: function(ev){
            console.log(ev.currentTarget);
            console.log(ev.originalEvent);
        },
        componentDidMount: function(){
            var self = this;
            this.timer = setInterval(function(){
                self.setState({
                    date: (new Date).toString()
                });               
            },1000);
        },
        componentWillUnmount: function(){
            clearTimeout(this.timer);
        }
        
    });
    
    m.mount(document.body, <MyComponent backgroundColor="yellow"/>);
```
output html:
```html
    <body>
         <div>
            <input type="text"/>
            <p style="background-color:yellow">Wed May 27 2015 15:01:23 GMT+0800 (CST)</p>
        </div>
    </body>
```
