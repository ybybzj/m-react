Introduction
======
mReact is a fork library of [Mithril](https://lhorie.github.io/mithril/getting-started.html), which is  a performant and compact client-side Javascript MVC framework and provides a templating engine with a virtual DOM diff implementation for performant rendering.

For people used to [React](https://facebook.github.io/react/)(by facebook), Mithril may feels a little bit quirky. And sometimes, I just need a pure render engine with a virtual DOM diff implementation. React is great, but is too big in some cases.

Thereby, here is the "mReact", a small React-like library, thanks to Mithril.
* Only 8.6k by gzipped.
* Usage resembles React, include lifecycle methods, `createComponent` factory method(similar to `createClass`)
* Support MSX syntax(similar to JSX) by using [MSX by Jonathan Buchanan](https://github.com/insin/msx)
* Support Event Delegation(use 'ev' plus camel Case event name as attribute, and events donot bubble by default, call "ev.startPropagation" to bubble)
* Support Server Rendering, and dom will be reserved properly during client code execution.
* Support cascade rendering

I'm not trying to build a drop-in replacement for React, just mimic the taste. Parts of Mithril other than rendering are removed. So how to manage routing or model layer is all up to you.

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
on server:
```javascript
    var renderToString = require('m-react/renderToString');
    var outputHTML = renderToString(m.component(MyComponent, {backgroundColor: 'yellow'}), 0);//add second param to enable dom reservation in browser, do not pass this parameter if only want to output pure html string
    ...
```
output html:
```html
    <div data-mref="0">
        <input type="text" data-mref="0"/>
        <p style="background-color:yellow" data-mref="1">Wed May 27 2015 15:01:23 GMT+0800 (CST)</p>
    </div>
```

JS API
------
## m.createComponent(options, mixins)

Return a component that is passed into `m.render/m.mount` as the first parameter.

### defaultProps

`Object` The default values for the component's properites.

### getInitialProps(props)

`Function`  Invoked after component is initiated, and merged properties is passed in, and should return the final properties object of the component.

### getInitialState(props)

`Function`  Invoked after `getInitialProps`, prepare the initial value of the component's state object.

### setState(state, isSilent)

`Function` Reset component's state object, passed in state object will be merge into current component state object. And if no second parameter is passed in, component will rerender itself. Otherwise, if `isSilent` is true, component will not rerender.

### componentWillMount

`Function` Invoke before component's dom is first created yet not inserted into the dom tree.

### componentDidMount(el)

`Function` Invoke after component's dom is inserted into the dom tree for the first time.

### componentWillUpdate(el, oldProps, oldState)

`Function` Invoke before each time component applying the diff rendering.

### componentDidUpdate(el, oldProps, oldState)

`Function` Invoke after applying the diff rendering.

### compoenetWillDetached(el)

`Function` Invoke before component's dom is removed from the dom tree.

### componentWillUnmount(e)

`Funtion` Invoke before component is unmounted.

### shouldComponentUpdate(oldProps, oldState)

`Function` Invoke before rendering, check the return boolean to decide whether to perform the diff rendering.

## m.mount(dom, vNode, forceRecreation)

`Function` Clear vNodes mounted onto the `dom`, remount `vNode` onto the dom, recreate dom if `forceRecreation` is true.

## m.render(root, vNode, forceRecreation, force)

`Function` Perform diff rendering on the root dom, recreate dom if `forceRecreation` is true, render immediately if `force` is true.
Examples
------
TodoMVC:  [https://github.com/ybybzj/m-react-todomvc](https://github.com/ybybzj/m-react-todomvc)

Performance
------
TodoMVC Perf Comparison:  [http://ybybzj.github.io/m-react-todomvc-perf/](http://ybybzj.github.io/m-react-todomvc-perf/)
