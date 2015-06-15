var m = require('../build/m-react');
module.exports = m.createComponent({
  getInitialState: function(){
    return {title: 'RenderComponent'};
  },
  render: function(props, state){
    return {tag:'div', attrs:{class:props.className, title:state.title},children:[props.children]};
  }
});