var SF = require('@zj/s-flow');
// var createPage = require('./createPageComponent')
var page = require('./page.msx');
var m = mReact;

var app = SF({
  state: require('./state'),
  signal: require('./signal'),
  watch: require('./update')
});
app.init();
var container = document.getElementById('container');
m.mount(container, m.component(page, {sf: app}));