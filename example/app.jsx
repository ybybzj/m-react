console.log(mithril);
var container = document.getElementById('container');
var m = mithril;
// var data = {temp: 10};
// function oninput(e){
//   console.log(e);
//   data.temp = e.target.value;
//   m.redraw();
// }
var MyApp = m.createComponent({
  render: function(props, state) {
    return (
      <div>
        <input oninput={this.oninput.bind(this)} value={state.temp}/>
        {"K"}
        <br/>
        <TemperatureConverter value={state.temp}>
          {"celsius:"}{this.kelvinToCelsius(state.temp)}
          <br/>
          {"fahrenheit:"}{this.kelvinToFahrenheit(state.temp)}
        </TemperatureConverter>
      </div>
    );
  },
  oninput: function(e){
    console.log(e);
    this.setState({
      temp: e.target.value
    });
  },
  getInitialState: function(){
    return {temp: 10};
  },
  kelvinToCelsius: function(value) {
    return value - 273.15;
  },
  kelvinToFahrenheit: function(value) {
    return (value / 5 * (value - 273.15)) + 32;
  }
});
var TemperatureConverter = m.createComponent({
  render: function(props, state) {
    return (
      <div ref="temp-converter">
        <div>{state.date}</div>
        {props.children}
      </div>
    );
  },
  getInitialState: function(){
    return {date: (new Date()).toString()};
  },
  componentDidMount:function(el){
    var self = this;
    this.timer = setInterval(function(){
      self.setState({
        date: (new Date()).toString()
      });
    },1000);
  },
  componentDidUpdate:function(el){
    console.log('componentDidUpdate');
    console.log(el);
    console.log(this.props.children);
  },
  componentWillUnmount: function(e){
    clearTimeout(this.timer);
  }
});
m.mount(document.body, MyApp);
// m("div", [
//       m("input", {
//         oninput: this.oninput.bind(this),
//         value: state.temp
//       }), "K",
//       m("br"),
//       state.temp == 11 ? null: m.component(TemperatureConverter, {
//         value: state.temp
//       },["celsius:", this.kelvinToCelsius(state.temp),
//         m("br"), "fahrenheit:", this.kelvinToFahrenheit(state.temp),
//       ])
//     ]);
//     m('div', {
    //   ref: 'temp-converter'
    // }, m('div', state.date),m('p',props.children));