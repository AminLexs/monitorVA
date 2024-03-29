const { Router } = require('express');
const router = Router();
const containersManager = require('../services/containersManager');
const containersMonitor = require('../services/containersMonitor');
const imagesService = require('../services/imagesService');
const pdfService = require('../services/pdfService');
const authService = require('../services/authService');
const multer = require('multer');

function getResult(req) {
  req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return { ...req.body, ...req.params, ...req.query };
}

/** deprecated
 * GET /
 */
router.get('/', function (req, res) {
  res.render('index', { title: 'Monitor' });
});

/**
 * GET /containers
 */
router.get('/containers', function (req, res) {
  containersMonitor
    .list(req)
    .then((result) => {
      res.end(JSON.stringify(result));
    })
    .catch((err) => {
      res.status(500).end(JSON.stringify(err));
    });
});

/**
 * PUT /containers
 */
router.put('/containers', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.createContainerFromReq(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /container
 */
router.post('/container', multer({ dest: 'uploads' }).single('settings'), function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.createContainerFromFile(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/sendreport
 */
router.post('/containers/sendreport', multer({ dest: 'uploads' }).single('pdf'), function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.sendReport(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * DELETE /containers
 */
router.delete('/containers', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.deleteContainers(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

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
 * POST /containers/restart
 */
router.post('/containers/restart', function (req, res) {
  containersManager.restartContainers(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/pause
 */
router.post('/containers/pause', function (req, res) {
  containersManager.pauseContainers(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/unpause
 */
router.post('/containers/unpause', function (req, res) {
  containersManager.unPauseContainers(getResult(req)).then((result) => {
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
 * GET /container/:containerID
 */
router.get('/container/', function (req, res) {
  containersMonitor.getContainerInfo(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /container/logs
 */
router.get('/container/logs', function (req, res) {
  containersMonitor.getContainerLogs(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /container/exec
 */
router.post('/container/exec', function (req, res) {
  containersManager.runExec(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * PUT /container/update
 */
router.put('/container/update', function (req, res) {
  containersManager.updateContainerFromReq(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /container/recreate
 */
router.post('/container/recreate', function (req, res) {
  containersManager.recreateContainer(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * PUT /container/name
 */
router.put('/container/name', function (req, res) {
  containersManager.renameContainerFromReq(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /containers/pdf
 */
router.post('/containers/pdf', function (req, res) {
  pdfService.getDataForPdf(getResult(req), req).then((result) => {
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
router.post('/images', multer({ dest: 'uploads' }).single('image'), function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  imagesService.addImage(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * DELETE /images
 */
router.delete('/images', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  imagesService.deleteImages(getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * Get /images/checkname
 */
router.get('/images/checkname', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  imagesService.checkName(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * PUT /containers/observers
 */
router.put('/containers/observers', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.updateObserverSettings(req, getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /containers/observer
 */
router.get('/containers/observer', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  containersManager.getObserveSettingsUserForContainer(req, getResult(req)).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /users
 */
router.get('/users', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  authService.getUsers(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * PUT /user
 */
router.put('/user', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  authService.changeUserRole(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * POST /user
 */
router.post('/user', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  authService.createUser(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * DELETE /user
 */
router.delete('/user', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  authService.deleteUser(getResult(req), req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

/**
 * GET /user/role
 */
router.get('/user/role', function (req, res) {
  //console.log( '[request]:\n' + ' - path: /config/save\n - receive: ' + JSON.stringify(req.body) + '\n' )
  authService.getRoleFromRequest(req).then((result) => {
    res.end(JSON.stringify(result));
  });
});

module.exports = router;
