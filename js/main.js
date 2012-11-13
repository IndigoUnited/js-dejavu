$(document).ready(function () {
    // Highlight code
    hljs.initHighlightingOnLoad();

    // Get perf results from browserscope
    Browserscope.update();
});

// Browserscore object
// Fetches the perf results and draws the graph
(function () {

    var drawChart, fetchData,
        key = 'agt1YS1wcm9maWxlcnINCxIEVGVzdBidz-oRDA',
        cb = '_' + parseInt(Math.random() * 1e9, 10);

    drawChart = function (json) {
        var browserName, browser, testName, test, line, browserResults, data,
            chartEl = $('.benchmark'),
            chart = new google.visualization.BarChart(chartEl.get(0)),
            results = json.results,
            lines = [],
            headerHash = {},
            header = ['Browser'],
            max = 0,
            val;

        for (browserName in results) {
            if (results.hasOwnProperty(browserName)) {
                browser = results[browserName];
                line = [browserName];
                browserResults = browser.results;
                for (testName in browserResults) {
                    if (browserResults.hasOwnProperty(testName)) {
                        if (!headerHash[testName]) {
                            headerHash[testName] = 1;
                            header.push(testName);
                        }
                        test = browserResults[testName];
                        val = parseInt(test.result, 10);
                        if (max < val) {
                            max = val;
                        }
                        line.push(val);
                    }
                }
                lines.push(line);
            }
        }

        data = [header].concat(lines);
        max += 3 * 1e6;

        chartEl.removeClass('loading');
        chart.draw(google.visualization.arrayToDataTable(data), {
            title: json.category_name,
            backgroundColor: '#000',
            tooltip: {
                textStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 14,
                    color: 'black'
                }
            },
            legend: {
                position: 'top',
                alignment: 'start',
                textStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 14,
                    color: 'white'
                },
                pagingTextStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 14,
                    color: 'white'
                },
                scrollArrows: {
                    activeColor: '#8C008C',
                    inactiveColor: '#250025'
                }
            },
            chartArea: {
                top: 70,
                left: 125,
                right: 0,
                bottom: 0,
                width: 455,
                height: 600
            },
            vAxis: {
                baselineColor: '#8C008C',
                textStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 14,
                    color: 'white'
                }
            },
            hAxis: {
                title: 'ops per second (higher is better)',
                baselineColor: '#8C008C',
                viewWindowMode: 'explicit',
                viewWindow: {
                    max: max
                },
                titleTextStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 15,
                    color: 'white'
                },
                textStyle: {
                    fontName: 'Source Sans Pro',
                    fontSize: 14,
                    color: 'white'
                },
                gridlines: {
                    color: '#250025'
                }
            }
        });
    };

    window[cb] = function (response) {
        drawChart(response);
    };

    fetchData = function () {
        var script = document.createElement('script'),
            first = document.getElementsByTagName('script')[0];

        script.async = 1;
        script.src = '//www.browserscope.org/user/tests/table/' + key +
            '?v=3&o=json&callback=' + cb;
        first.parentNode.insertBefore(script, first);
    };

    window.Browserscope = {
        update: fetchData
    };
}());