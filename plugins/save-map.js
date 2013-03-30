var path = require("path"),
    fs = require("fs");

module.exports = function(location) {
  return function(game) {
    var save_interval = setInterval(function() {
      Object.keys(game.map.chunks).forEach(function(k) {
        if (!game.map.chunks[k].dirty) { return; }

        console.log("Saving chunk " + k);

        fs.writeFile(path.join(location, Buffer(k).toString("base64")), game.map.chunks[k].data, function(err) {
          if (err) {
            console.warn(err);
            return;
          }

          game.map.chunks[k].dirty = false;
          game.map.chunks[k].data = null;
         fs.writeFile(path.join(location, Buffer(k).toString("base64"), '.json'), JSON.stringify(game.map.chunks[k]), function(err) {
          if (err) {
            console.warn(err);
            return;
          } 
          });
        });
      });
    }, 10000);
  };
};
