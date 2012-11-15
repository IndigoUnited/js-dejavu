/*jshint regexp:false*/
/*global Documentation, Browserscope*/

// Documentation parsing
(function () {
    var leftColumnEl,
        rightColumnEl,
        isPhone;

    isPhone = (function () {
        var uAgent = navigator.userAgent.toLowerCase(),
            isMobile = false;

        if (/android|tablet|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|dell streak|playbook|silk/.test(uAgent)) {
            isMobile = true;
        } else if (/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/.test(uAgent.substr(0, 4))) {
            isMobile = true;
        }

        if (!isMobile) {
            return false;
        }

        // Exclude if is tablet
        if (/ipad|android 3|dell streak|sch-i800|sgh-t849|gt-p1010|playbook|tablet|silk|kindle fire/.test(uAgent)) {
            return false;
        }

        return true;
    }());

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

        var title = getBlockTitle(els);

        switch (title) {
        case 'dejavu':
        case 'Features':
        case 'Getting started':
            leftColumnEl.append(parseBlock(els));
            break;
        case 'Performance':
            rightColumnEl.append(parseBlock(els));
            addBlock($('<h2>Benchmarks</h2><p>You can run the <a href="http://jsperf.com/oop-benchmark/58" target="_blank">benchmark</a> yourself. Note that the benchmark below compares dejavu with libraries that do not provide many of the features that dejavu does. For more details, please consult the libraries documentation.</p><div class="benchmark chart loading"></div><div class="mobile">Mobile</div><div class="benchmark-mobile chart loading"></div>'));
            break;
        case 'Benchmarks':
        case 'Why another?':
            rightColumnEl.append(parseBlock(els));
            break;
        default:
            if (leftColumnEl.height() <= rightColumnEl.height()) {
                leftColumnEl.append(parseBlock(els));
            } else {
                rightColumnEl.append(parseBlock(els));
            }
        }
    }

    function parseDoc(str) {
        // If is phone, the right column is actually the left column
        // After, we also remove the right column
        leftColumnEl = $('#content .left'),
        rightColumnEl = isPhone ? leftColumnEl : $('#content .right');

        if (isPhone) {
            $(document.body).addClass('phone');
            $('#content .right').remove();
        }

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
        els = [];

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
                width: el.width(),
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
    // TODO: add loader for the content

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