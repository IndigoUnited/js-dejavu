/*jshint regexp:false*/
/*global Documentation, Browserscope*/

// Website version
if (!window.siteVersion) {
    window.siteVersion = +(new Date());
}

// Documentation parsing
(function () {
    var leftColumnEl,
        rightColumnEl,
        isPhone,
        hash;

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

    // Reach to hash chages
    function reactToHash() {
        var newHash = location.hash.replace(/#(section\-)?/, '');
        if (hash === newHash) {
            return;
        }

        hash = newHash;
        if (hash) {
            $.smoothScroll({ scrollTarget: '#' + newHash });
        }
    }

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

        var title = getBlockTitle(els),
            headerEl = els.eq(0),
            el,
            slug = title.replace(/\s+/g, '-').replace(/\?/g, '').toLowerCase(),
            aEl = $('<a href="#' + slug + '" id="' + slug + '"></a>').append($('<span></span>'));

        els = els.not(headerEl);
        aEl.children().empty();
        headerEl = aEl.children().eq(0);
        Array.prototype.unshift.call(els, aEl.get(0));
        el = parseBlock(els),
        headerEl.addClass('block-header block-header-' + slug);

        aEl.after($('<div class="clearfix"></div>'));

        switch (title) {
        case 'dejavu':
        case 'Features':
        case 'Getting started':
        case 'Syntax':
            leftColumnEl.append(el);
            break;
        case 'Performance':
        case 'Why another?':
            rightColumnEl.append(el);
            break;
        case 'Benchmarks':
            el.find('p').each(function (i, p) {
                p.innerHTML = p.innerHTML
                    .replace(/\{\{graph\}\}/, '<span class="benchmark chart loading"></span>')
                    .replace(/\{\{graph_mobile\}\}/, '<span class="benchmark-mobile chart loading"></span>');
            });
            rightColumnEl.append(el);
            break;
        default:
            if (leftColumnEl.height() <= rightColumnEl.height()) {
                leftColumnEl.append(el);
            } else {
                rightColumnEl.append(el);
            }
        }

        // Finally add smooth scroll (for the headers)
        aEl.smoothScroll({
            afterScroll: function () {
                hash = slug;
                location.hash = '#section-' + slug;
            }
        });
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

        el.find('hr').remove();                // Remove all hr's
        el.find('a').attr('target', '_blank'); // All links should open a new window

        children = el.children(),
        length = children.length,
        els = [];

        for (x = 0; x < length; x += 1) {
            curr = children.get(x);
            tag = curr.tagName.toLowerCase();
            if ((tag === 'h1' || tag === 'h2') && els.length) {
                addBlock(els);
                els = [];
            }

            els.push(curr);
        }

        if (els.length) {
            addBlock(els);
        }

        reactToHash();
        $(window).on('hashchange', reactToHash);
    }

    window.Documentation = {
        parse: parseDoc
    };
}());


// Browserscore object
// Fetches the perf results and draws the graph
(function () {

    var testId = 'agt1YS1wcm9maWxlcnINCxIEVGVzdBjk7qoTDA',
        cb = '_' + parseInt(Math.random() * 1e9, 10),
        // The blacklist below is due to unstable versions of browsers that should not
        // yet be accounted for
        browserBlacklist = []; // /Firefox 17\./ -> Example of an entry

    function browserIsBlacklisted(browser) {
        var i,
            totalBlacklisted = browserBlacklist.length;

        for (i = 0; i < totalBlacklisted; i += 1) {
            if (browserBlacklist[i].test(browser)) {
                return true;
            }
        }

        return false;
    }

    function drawChart(title, results, el) {
        var browserName, browser, testName, test, line, browserResults, data,
            chart = new google.visualization.BarChart(el.get(0)),
            lines = [],
            headerHash = {},
            header = ['Browser'],
            max = 0,
            val;

        // TODO: add ops/sec to the tooltip
        // TODO: put M

        // Generate data for the graph
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
                left: 125,
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
    }


    window[cb] = function (response) {
        var results = response.results,
            key,
            split,
            mobile = ['android', 'ipad', 'iphone'],
            browserVersions = {},
            newResults = {};

        // Parse non-mobile browsers
        // Only keep the most recent browser in the results
        for (key in results) {
            split = key.split(' ');
            // Skip mobile and blacklisted browsers
            if ($.inArray(split[0].toLowerCase(), mobile) !== -1 || browserIsBlacklisted(key)) {
                continue;
            }
            newResults[key] = results[key];
        }

        // Draw the chart
        drawChart(response.category_name, newResults, $('.benchmark'));

        // Parse mobile browsers
        // Only keep the most recent browser in the results
        newResults = {};
        browserVersions = {};
        for (key in results) {
            split = key.split(' ');
            // Include mobile, but exclude blacklisted browsers
            if ($.inArray(split[0].toLowerCase(), mobile) === -1 || browserIsBlacklisted(key)) {
                continue;
            }
            newResults[key] = results[key];
        }

        // Draw the chart
        drawChart(response.category_name, newResults, $('.benchmark-mobile'));
    };

    function fetchData() {
        var script = document.createElement('script'),
            first = document.getElementsByTagName('script')[0];

        script.async = 1;
        script.src = '//www.browserscope.org/user/tests/table/' + testId +
            '?v=3&o=json&callback=' + cb;
        first.parentNode.insertBefore(script, first);
    }

    window.Browserscope = {
        update: fetchData
    };
}());


$(document).ready(function () {
    // Download the tmpl
    var promise = $.ajax('tmpl/doc.tmpl?v=' + siteVersion, {
        timeout: 15000
    }),
        contentEl = $('#content');

    promise.complete(function () {
        contentEl.removeClass('loading');
    });
    promise.fail(function () {
        contentEl.find('.left').html('Oops, something went wrong.');
    });
    promise.success(function () {
        // Parse it
        Documentation.parse(promise.responseText);

        // Highlight code
        // Do not highlight in <=IE8 because highlightjs throws errors on it
        if (!$.browser.msie || $.browser.version > 8)  {
            var blocks = $('pre code'),
                length = blocks.length,
                x;

            for (x = 0; x < length; x += 1) {
                hljs.highlightBlock(blocks.get(x));
            }
        }

        // Get perf results from browserscope
        Browserscope.update();
    });
});