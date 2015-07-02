module.exports = {
  data: {
    temp: 10
  },
  facets: {
    celsius: {
      cursors: {
        temp: 'temp'
      },
      get: function(data) {
        return data.temp - 273.15;
      }
    },
    fahrenheit: {
      cursors: {
        temp: 'temp'
      },
      get: function(data) {
        var value = data.temp;
        return (value / 5 * (value - 273.15)) + 32;
      }
    }
  },
  options: {
    syncwrite: true
  }
};