var restify = require('restify');
var fs = require('fs');

module.exports = function (root, apikey) {
  var server = restify.createServer({
    name: 'snyk-mock-server',
    version: '1.0.0'
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  [
    root + '/verify/callback',
    root + '/verify/token'
  ].map(function (url) {
    server.post(url, function (req, res) {
      if (req.params.api) {
        if (req.params.api === apikey) {
          return res.send({
            ok: true,
            api: apikey,
          });
        }
      }

      if (req.params.token) {
        return res.send({
          ok: true,
          api: apikey,
        });
      }

      res.status(401);
      res.send({
        ok: false,
      });
    });
  });


  server.get(root + '/vuln/npm/:module/:version', function (req, res, next) {
    res.send(req.params);
    return next();
  });

  server.get(root + '/vuln/npm/:module', function (req, res, next) {
    var module = req.params.module;
    var body = fs.readFileSync(__dirname + '/fixtures/cli-test-results/' + module, 'utf8');
    res.send(JSON.parse(body));
    return next();
  });

  server.put(root + '/monitor/npm', function (req, res) {
    res.send({
      id: 'test',
    });
  });

  return server;
};