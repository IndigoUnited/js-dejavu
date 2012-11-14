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
            browserVersions = {},
            newResults = {},
            split,
            max = 0,
            key,
            val,
            mobile = ['android', 'ipad', 'iphone'];

        // Only keep the most recent browser in the results
        for (key in results) {
            split = key.split(' ', 2);
            browserName = split[0];
            // Skip mobile
            if (mobile.indexOf(browserName.toLowerCase()) !== -1) {
                continue;
            }
            split[1] = parseInt(split[1], 10);
            if ((browserVersions[browserName] || 0) < split[1]) {
                browserVersions[browserName] = split[1];
                newResults[browserName] = results[key];
            }
        }

        // Add the version to the browser names
        for (key in newResults) {
            newResults[key + ' ' + browserVersions[key]] = newResults[key];
            delete newResults[key];
        }

        results = newResults;

        // TODO: add mobile
        // TODO: add ops/sec to the tooltip
        // TODO: put M

        // Process data
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
            fontName: 'Source Sans Pro',
            fontSize: 14,
            chartArea: {
                top: 70,
                left: 85,
                right: 0,
                bottom: 0,
                width: 455,
                height: 375
            },
            tooltip: {
                textStyle: {
                    color: 'black'
                }
            },
            legend: {
                position: 'top',
                alignment: 'start',
                textStyle: {
                    color: 'white'
                },
                pagingTextStyle: {
                    color: 'white'
                },
                scrollArrows: {
                    activeColor: '#8C008C',
                    inactiveColor: '#250025'
                }
            },
            vAxis: {
                baselineColor: '#8C008C',
                textStyle: {
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
                    fontSize: 15,
                    color: 'white'
                },
                textStyle: {
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