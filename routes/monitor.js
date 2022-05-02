const { Router } = require('express');
const router = Router();
const containersManager = require('../services/containersManager');
const containersMonitor = require('../services/containersMonitor');

function getResult(req) {
  req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return req.body;
}

/**
 * GET /
 */
router.get('/', function (req, res) {
  //res.send('<input type="submit" value="Добавить новую задачу" formaction="server.js" formmethod="post">')
  res.render('index', { title: 'Monitor' });
  //res.end('Supervizer server v' + common.pkg.version)
});

router.post('/auth', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/monit\n - receive: ' + JSON.stringify(req.body) + '\n' )
  //  let monitApps = JSON.parse(JSON.stringify(main.monit(getResult(req))['data']))
  res.end(JSON.stringify(main.Authenticate(getResult(req))));
  // console.log(JSON.stringify(main.monit(getResult(req)))[0])

  //res.end(JSON.stringify(main.monit(getResult(req))))
  //res.end(JSON.stringify(main.monit(getResult(req))))
});

/**
 * POST /app/start
 */
router.post('/app/start', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /app/start\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.startContainer(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
  // const result =main.start(getResult(req))
  // res.end(JSON.stringify(result))
});

/**
 * POST /app/stop
 */
router.post('/app/stop', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /app/stop\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.stopContainer(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
  // res.end(JSON.stringify(main.stop(getResult(req))))
});

/**
 * POST /apps/list
 */
router.post('/apps/list', function (req, res) {
  //	console.log( '[request]:\n' + ' - path: /apps/list\n - receive: ' + JSON.stringify(req.body) + '\n' )
  /* let apps= main.list(getResult(req)).data
    res.render('index', {
        title: 'Monitor',
        isIndex: true,
        isList:true,
        apps: apps
    })*/
  containersMonitor.list(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

router.post('/apps/monit', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/monit\n - receive: ' + JSON.stringify(req.body) + '\n' )
  //  let monitApps = JSON.parse(JSON.stringify(main.monit(getResult(req))['data']))
  /*res.render('index', {
        title: 'Monitor',
        isIndex: true,
        isMonit: true,
        monitApps: monitApps
    })*/
  // console.log(JSON.stringify(main.monit(getResult(req)))[0])
  containersMonitor.monit(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /config/load
 */
router.post('/config/load', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )

  res.end(JSON.stringify(main.load(getResult(req))));
});

// router.post('/config/crashsend', function (req, res) {
//
//     //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )
//     main.SetCrashSend(getResult(req)).then(result=>{
//         res.end(JSON.stringify(result))
//     })
//
// })
//
// router.post('/config/exitsend', function (req, res) {
//
//     //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )
//     main.SetExitSend(getResult(req)).then(result=>{
//         res.end(JSON.stringify(result))
//     })
// })
// router.post('/config/closesend', function (req, res) {
//
//     //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )
//     main.SetCloseSend(getResult(req)).then(result=>{
//         res.end(JSON.stringify(result))
//     })
// })
// router.post('/config/getsettings', function (req, res) {
//
//     //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )
//     main.GetSettings(getResult(req)).then(result=>{
//         res.end(JSON.stringify(result))
//     })
//
// })

router.post('/apps/groups', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/load\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.getListGroup(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
  //res.end(JSON.stringify(main.getListGroup(getResult(req))))
});
/**
 * PUT /apps
 */
router.put('/apps', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps\n - receive: ' + JSON.stringify(req.body) + '\n' )
  req.body.app.enabled = JSON.parse(req.body.app.enabled);
  req.body.app.stopped = JSON.parse(req.body.app.stopped);
  req.body.app.attempted = JSON.parse(req.body.app.attempted);
  req.body.app.enabled = JSON.parse(req.body.app.enabled);
  req.body.app.created = JSON.parse(req.body.app.created);
  req.body.app.keep = JSON.parse(req.body.app.keep);
  req.body.app.watch.enabled = JSON.parse(req.body.app.watch.enabled);
  req.body.app.watch.excludes = [];
  res.end(JSON.stringify(main.add(getResult(req))));
});

/**
 * POST /app
 */
router.post('/app', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /app\n - receive: ' + JSON.stringify(req.body) + '\n' )
  res.end(JSON.stringify(main.set(getResult(req))));
});

/**
 * POST /apps/start
 */
router.post('/apps/start', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/start\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.startAll(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /apps/stop
 */
router.post('/apps/stop', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/stop\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.stopAll(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});
/**
 * POST /role
 */
router.post('/role', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/stop\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.getRole(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
  // var response = main.getRole(getResult(req))
});
/**
 * POST /role
 */
router.post('/config/setemail', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/stop\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.SetEmail(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
  // var response = main.getRole(getResult(req))
});

/**
 * POST /config/save
 */
router.post('/config/save', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  res.end(JSON.stringify(main.save(getResult(req))));
});

module.exports = router;
