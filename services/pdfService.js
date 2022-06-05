const ChartJSImage = require('chart.js-image');
const { getMegabytes } = require('../utils/dataFormattingUtils');
const { getStatsContainers } = require('./dbService');
const { getContainerInfoDocker } = require('./dockerService');
const { getSuccess } = require('./responseService');
const { getShortContainersID } = require('../utils/stringUtils');
const { list } = require('./containersMonitor');
const { getStatsContainersFromDocker } = require('./containersMonitor');

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

function getMemoryAndCPUUsage(containersStats, lang) {
  const isEng = lang === 'en';
  const memoryChartsURLs = containersStats.map((containerStats) => {
    if (containerStats.mem) {
      console.log(typeof +getMegabytes(containerStats.mem));
      console.log(typeof +getMegabytes(containerStats.maxUsageMem - containerStats.mem));
      console.log(typeof +getMegabytes(containerStats.memLimit));
      const chartMem = ChartJSImage()
        .chart({
          type: 'bar',
          data: {
            labels: [isEng ? 'Megabyte' : 'Мегабайт'],
            datasets: [
              {
                label: isEng ? 'Used memory' : 'Использовано памяти',
                data: [+getMegabytes(containerStats.mem)],
              },
              {
                label: isEng ? 'Max memory usage' : 'Максимально использовано памяти',
                data: [+getMegabytes(containerStats.maxUsageMem - containerStats.mem)],
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: isEng ? 'Memory usage' : 'Использование памяти',
            },
            responsive: true,
            scales: {
              xAxes: [
                {
                  stacked: true,
                },
              ],
              yAxes: [
                {
                  stacked: true,
                  ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: +getMegabytes(containerStats.memLimit),
                  },
                },
              ],
            },
          },
        })
        .backgroundColor('white')
        .width(500) // 500px
        .height(300); // 300px
      return chartMem.toURL();
    }
  });
  const cpuChartsURLs = containersStats.map((containerStats) => {
    if (containerStats.mem) {
      const chartMem = ChartJSImage()
        .chart({
          type: 'bar',
          data: {
            labels: [isEng ? 'Percentages' : 'Проценты'],
            datasets: [
              {
                label: isEng ? 'CPU used' : 'Использовано ЦП',
                data: [containerStats.cpu],
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: isEng ? 'CPU usage' : 'Использование ЦП',
            },
            responsive: true,
            scales: {
              xAxes: [
                {
                  stacked: true,
                },
              ],
              yAxes: [
                {
                  stacked: true,
                  ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                  },
                },
              ],
            },
          },
        })
        .backgroundColor('white')
        .width(500) // 500px
        .height(300); // 300px
      return chartMem.toURL();
    }
  });

  return containersStats
    .map((containerStats, index) => {
      if (containerStats.mem) {
        return {
          name: containerStats.name,
          cpuChartURL: cpuChartsURLs[index],
          memoryChartURL: memoryChartsURLs[index],
        };
      }
    })
    .filter((item) => item);
}
async function getDataForPdf(params, req) {
  const rawContainersStats = await getStatsContainers(params.containersId);
  const shortContainersIds = rawContainersStats.map((containerStats) => getShortContainersID(containerStats.id));
  const containersInfoRaw = await Promise.all(
    rawContainersStats.map(async (containerStats, index) => await getContainerInfoDocker(shortContainersIds[index])),
  );
  const containersNames = containersInfoRaw.map((containerInfo) => containerInfo.Name);

  let barChartStateStatsURL;

  if (params.pdfParams.chartHistoryStateContainers) {
    const historyContainersStats = rawContainersStats.map((containerStats, index) => {
      return { ...containerStats, name: containersNames[index] };
    });
    barChartStateStatsURL = getBarChartStateStatsURL(historyContainersStats, params.lang);
  }

  let doughnutChartNowStateURL;
  let containersStatsNow;
  if (params.pdfParams.chartCurrentStateContainers) {
    containersStatsNow = (await list(req)).data.reduce(
      (acc, curr) => {
        if (params.containersId.includes(curr.Id)) {
          return { ...acc, [curr.status]: ++acc[curr.status] };
        } else {
          return { ...acc };
        }
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
    doughnutChartNowStateURL = getDoughnutChartNowStateURL(containersStatsNow, params.lang);
  }

  let containersInfo = [];
  if (params.pdfParams.detailContainersInfo) {
    containersInfo = containersInfoRaw.map((containerInfo) => ({
      name: containerInfo.Name.slice(1),
      containerInfo: containerInfo,
    }));
  }

  let containersChartsURLs = [];
  if (params.pdfParams.chartsUsedResourceContainers) {
    const containersStats = await getStatsContainersFromDocker(shortContainersIds);
    containersChartsURLs = getMemoryAndCPUUsage(containersStats, params.lang);
    if (containersInfo.length) {
      containersInfo = containersInfo.map((containerInfo) => {
        const foundContainersURLs = containersChartsURLs.find((element) => element.name === containerInfo.name);
        if (foundContainersURLs) {
          return Object.assign(containerInfo, {
            cpuChartURL: foundContainersURLs.cpuChartURL,
            memoryChartURL: foundContainersURLs.memoryChartURL,
          });
        }
        return containerInfo;
      });
    } else {
      containersInfo = containersChartsURLs;
    }
  }

  return getSuccess({
    containersInfo,
    barChartHistoryStateStatsURL: barChartStateStatsURL,
    doughnutChartNowState: doughnutChartNowStateURL,
    stats: containersStatsNow,
  });
}

module.exports.getDataForPdf = getDataForPdf;
