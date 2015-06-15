'use strict';
require('node-msx').install();
var test = require('tape');
var m = require('../build/m-react');
var render = require('./index');
var Component = require('./component');
test('render', function(t) {
  t.equal(render(m('span', 'content')),
    '<span>content</span>', 'should render tag');
  t.equal(render(m('.foo', 'content')),
    '<div class="foo">content</div>', 'should render classname');
  t.equal(render(m('#bar', 'content')),
    '<div id="bar">content</div>', 'should render id');
  t.equal(render(m('br')), '<br>', 'should render short nodes when no children');
  t.equal(render(m('span', {
    'data-foo': 'bar',
    selected: 'selected'
  })), '<span data-foo="bar" selected="selected"></span>', 'should render attributes');
  t.equal(render(m('ul', 'huhu')), '<ul>huhu</ul>', 'should render string');
  t.equal(render([m('span', 'foo'), m('div', 'bar')]),
    '<span>foo</span><div>bar</div>', 'should render arrays');
  t.equal(render(m('span', m('div'))), '<span><div></div></span>', 'should render children');
  t.equal(render(m('span', {
    onmousemove: function(event) {}
  })), '<span></span>', 'should not render events');
  t.equal(render(m('span', {
    style: {
      paddingLeft: '10px',
      color: 'red'
    }
  })), '<span style="padding-left:10px;color:red"></span>', 'should render children');
  t.equal(render(m('div', [
    1,
    m('span'),
    "2"
  ])), '<div>1<span></span>2</div>', 'should render numbers as text nodes');
  t.equal(render(m('div', 0)), '<div>0</div>');
  t.equal(render(m('div', false)), '<div>false</div>');
  t.equal(render(m('div', { a: true})), '<div a></div>');
  t.equal(render(m('div', { a: false})), '<div></div>');
  t.equal(render(m.component(Component, {className: 'component'}, [m('span','RenderComponent')]), 0), '<div class="component"><span>RenderComponent</span></div>');
  t.end();
});
