const ChartJSImage = require('chart.js-image');
const { getStatsContainers } = require('./dbService');
const { getContainerInfoDocker } = require('./dockerService');
const { getSuccess } = require('./responseService');
const { getShortContainersID } = require('../utils/stringUtils');
const { list } = require('./containersMonitor');

const rusContainersStatesHistoryLabels = ['Старты', 'Остановки', 'Паузы', 'Возобновления', 'Рестарты'];
const engContainersStatesHistoryLabels = ['Starts', 'Stops', 'Pauses', 'Unpauses', 'Restarts'];

const rusContainersStatusesLabels = ['Создан', 'Запущен', 'Перезапуск', 'Завершён', 'Приостановлен', 'Мёртв'];

const engContainersStatusesLabels = ['Created', 'Running', 'Restarting', 'Exited', 'Paused', 'Dead'];

function getBarChartStateStatsURL(containersStats, lang) {
  const dataset = containersStats.map((containerStats) => {
    const stats = containerStats.stats;
    return {
      label: containerStats.name,
      data: [stats.startTimes, stats.stopTimes, stats.pauseTimes, stats.unpauseTimes, stats.restartTimes],
    };
  });
  const isEng = lang === 'en';
  const chart = ChartJSImage()
    .chart({
      type: 'bar',
      data: {
        labels: isEng ? engContainersStatesHistoryLabels : rusContainersStatesHistoryLabels,
        datasets: dataset,
      },
      options: {
        title: {
          display: true,
          text: isEng ? 'History stats' : 'История статусов',
        },
      },
    })
    .backgroundColor('white')
    .width(500) // 500px
    .height(300); // 300px

  return chart.toURL();
}
//  'Created','Running','Restarting','Exited','Paused','Dead',
function getDoughnutChartNowStateURL(containersStats, lang) {
  const isEng = lang === 'en';
  const chart = ChartJSImage()
    .chart({
      type: 'doughnut',
      data: {
        labels: isEng ? engContainersStatusesLabels : rusContainersStatusesLabels,
        datasets: [
          {
            label: 'Dataset 1',
            data: [
              containersStats.created,
              containersStats.running,
              containersStats.restarting,
              containersStats.exited,
              containersStats.paused,
              containersStats.dead,
            ],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: isEng ? 'Current statuses stats' : 'Текущая статистика статусов',
        },
      },
    })
    .backgroundColor('white')
    .width(500) // 500px
    .height(300); // 300px

  return chart.toURL();
}

async function getDataForPdf(params, req) {
  const rawContainersStats = await getStatsContainers(params.containersId);
  const containersNames = await Promise.all(
    rawContainersStats.map(
      async (containerStats) => (await getContainerInfoDocker(getShortContainersID(containerStats.id))).Name,
    ),
  );
  const historyContainersStats = rawContainersStats.map((containerStats, index) => {
    return { ...containerStats, name: containersNames[index] };
  });
  const containersStatsNow = (await list(req)).data.reduce(
    (acc, curr) => {
      return { ...acc, [curr.status]: ++acc[curr.status] };
    },
    {
      created: 0,
      running: 0,
      restarting: 0,
      exited: 0,
      paused: 0,
      dead: 0,
    },
  );

  const barChartStateStatsURL = getBarChartStateStatsURL(historyContainersStats, params.lang);
  const doughnutChartNowStateURL = getDoughnutChartNowStateURL(containersStatsNow, params.lang);

  return getSuccess({
    barChartHistoryStateStatsURL: barChartStateStatsURL,
    doughnutChartNowState: doughnutChartNowStateURL,
    stats: containersStatsNow,
  });
}

module.exports.getDataForPdf = getDataForPdf;
