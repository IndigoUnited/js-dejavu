/*global Documentation, Browserscope*/

// Documentation parsing
(function () {
    var leftColumnEl,
        rightColumnEl,
        foundPerformance;

    function parseBlock(els) {
        var blockEl = $('<div class="block"></div>');
        blockEl.append(els);

        return blockEl;
    }

    function getBlockTitle(els) {
        var first = els.get(0),
            tag = first.tagName.toLowerCase();

        if (tag === 'h1' || tag === 'h2') {
            return first.innerHTML;
        }

        return null;
    }

    function addBlock(els) {
        els = $(els);

        if (leftColumnEl.height() < rightColumnEl.height()) {
            leftColumnEl.append(parseBlock(els));
        } else {
            rightColumnEl.append(parseBlock(els));
        }

        if (!foundPerformance && getBlockTitle(els) === 'Performance') {
            foundPerformance = true;
            addBlock($('<h2>Benchmarks</h2><p>You can run the <a href="http://jsperf.com/oop-benchmark/58" target="_blank">benchmark</a> yourself. Note that the benchmark below compares dejavu with libraries that do not provide many of the features that dejavu does. For more details, please consult the libraries documentation.</p><div class="benchmark chart loading"></div><div class="mobile">Mobile</div><div class="benchmark-mobile chart loading"></div>'));
        }
    }

    function parseDoc(str) {
        leftColumnEl = $('#content .left'),
        rightColumnEl = $('#content .right');

        var el = $('<div style="display: none"></div>').html(str),
            children,
            length,
            els,
            x,
            tag,
            curr;

        el.find('p').eq(0).remove();    // Remove first paragraph (the build status image)
        el.find('hr').remove();         // Remove all hr's

        children = el.children(),
        length = children.length,
        els = [],
        foundPerformance = false;

        for (x = 0; x < length; x += 1) {
            curr = children.get(x);
            tag = curr.tagName.toLowerCase();
            if ((tag === 'h1' || tag === 'h2' || tag === 'h3') && els.length) {
                addBlock(els);
                els = [];
            }

            els.push(curr);
        }

        if (els.length) {
            addBlock(els);
        }
    }

    window.Documentation = {
        parse: parseDoc
    };
}());


// Browserscore object
// Fetches the perf results and draws the graph
(function () {

    var drawChart, fetchData,
        key = 'agt1YS1wcm9maWxlcnINCxIEVGVzdBidz-oRDA',
        cb = '_' + parseInt(Math.random() * 1e9, 10);

    drawChart = function (title, results, el) {
        var browserName, browser, testName, test, line, browserResults, data,
            chart = new google.visualization.BarChart(el.get(0)),
            lines = [],
            headerHash = {},
            header = ['Browser'],
            max = 0,
            val;

        // TODO: add ops/sec to the tooltip
        // TODO: put M

        // Generate data for the
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
        el.removeClass('loading');
        chart.draw(google.visualization.arrayToDataTable(data), {
            title: null,
            backgroundColor: '#000',
            fontName: 'Source Sans Pro',
            fontSize: 14,
            chartArea: {
                top: 70,
                left: 85,
                right: 0,
                bottom: 0,
                width: 455,
                height: el.height() - 140
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
        var results = response.results,
            key,
            browserName,
            split,
            mobile = ['android', 'ipad', 'iphone'],
            browserVersions = {},
            newResults = {};

        // Parse non-mobile browsers
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

        // Draw the chart
        drawChart(response.category_name, newResults, $('.benchmark'));

        // Parse mobile browsers
        // Only keep the most recent browser in the results
        newResults = {};
        browserVersions = {};
        for (key in results) {
            split = key.split(' ', 2);
            browserName = split[0];
            // Skip mobile
            if (mobile.indexOf(browserName.toLowerCase()) === -1) {
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

        // Draw the chart
        drawChart(response.category_name, newResults, $('.benchmark-mobile'));
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


$(document).ready(function () {

    // Download the tmpl
    var promise = $.get('tmpl/doc.tmpl', {
        timeout: 15000
    });
    promise.fail(function () {
        $('#content .left').html('Oops, something went wrong.');
    });
    promise.success(function () {
        // Parse it
        Documentation.parse(promise.responseText);

        // Highlight code
        var blocks = $('pre code'),
            length = blocks.length,
            x;

        for (x = 0; x < length; x += 1) {
            hljs.highlightBlock(blocks.get(x));
        }

        // Get perf results from browserscope
        Browserscope.update();
    });
});