const { Router } = require('express');
const router = Router();
const containersManager = require('../services/containersManager');
const containersMonitor = require('../services/containersMonitor');
const imagesService = require('../services/imagesService')
const multer = require("multer");

function getResult(req) {
  req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return {...req.body,...req.params,...req.query};
}

/**
 * GET /
 */
router.get('/', function (req, res) {
  //res.send('<input type="submit" value="Добавить новую задачу" formaction="server.js" formmethod="post">')
  res.render('index', { title: 'Monitor' });
  //res.end('Supervizer server v' + common.pkg.version)
});

/**
 * GET /containers
 */
router.get('/containers', function (req, res) {
  containersMonitor.list(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

// /**
//  * PUT /containers
//  */
// router.put('/containers', function (req, res) {
//   //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
//   imagesService.addImage(req).then((result) => {
//     res.end(JSON.stringify(result));
//   });
// });

/**
 * POST /containers/start
 */
router.post('/containers/start', function (req, res) {
  containersManager.startContainers(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/stop
 */
router.post('/containers/stop', function (req, res) {
  containersManager.stopContainers(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/monit
 */
router.post('/containers/monit', function (req, res) {
  containersMonitor.monit(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /images
 */
router.get('/images', function (req, res) {
  imagesService.list(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /images
 */
router.post('/images', multer({dest:"uploads"}).single("image"), function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  imagesService.addImage(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /app
 */
router.post('/app', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /app\n - receive: ' + JSON.stringify(req.body) + '\n' )
  res.end(JSON.stringify(main.set(getResult(req))));
});

/**
 * POST /role
 */
router.post('/role', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /apps/stop\n - receive: ' + JSON.stringify(req.body) + '\n' )
  main.getRole(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });

});

/**
 * POST /role
 */
router.post('/config/setemail', function (req, res) {
  main.SetEmail(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

module.exports = router;
