mReact is a fork library of [Mithril](https://lhorie.github.io/mithril/getting-started.html), which is  a client-side Javascript MVC framework and provides a templating engine with a virtual DOM diff implementation for performant rendering, utilities for high-level modelling via functional composition, as well as support for routing and componentization.

For people used to React(by facebook), Mithril is just a little bit quirky. And sometimes, we just need a pure render engine with a virtual DOM diff implementation. React though is great, is too big for mobile site(around 80k by gzip).

Hence, here is the "mReact". 
* Only 14k by minified.
* Similar usage to React, include lifecycle methods, createCompoenet factory method(similar to createClass)
* support MSX syntax(similar to JSX) companioned by  [MSX by Jonathan Buchanan](https://github.com/insin/msx)