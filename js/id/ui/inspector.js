iD.Inspector = function() {
    var event = d3.dispatch('changeTags', 'changeWayDirection', 'update', 'remove', 'close', 'splitWay'),
        taginfo = iD.taginfo();

    function drawhead(selection) {
        selection.html('');
        selection.append('h2')
            .text(iD.util.friendlyName(selection.datum()));
        selection.append('a')
            .attr('class', 'permalink')
            .attr('href', function(d) {
                return 'http://www.openstreetmap.org/browse/' +
                d.type + '/' + d.osmId();
            })
            .text('View on OSM');
        if (selection.datum().type === 'way') {
            selection.append('a')
                .attr('class', 'permalink')
                .attr('href', '#')
                .text('Reverse Direction')
                .on('click', function(d) {
                    event.changeWayDirection(iD.Entity(d));
                });
        }
        if (selection.datum().type === 'node' && !selection.datum()._poi) {
            selection.append('a')
                .attr('class', 'permalink')
                .attr('href', '#')
                .text('Split Way')
                .on('click', function(d) {
                    event.splitWay(iD.Entity(d));
                });
        }
    }

    function inspector(selection) {
        selection.each(function(entity) {
            selection.html("").append('button')
                .attr('class', 'narrow close')
                .html("<span class='icon close'></span>")
                .on('click', function() {
                    event.close(entity);
                });

            selection.append('div')
                .attr('class', 'head inspector-inner').call(drawhead);

            var inspectorwrap = selection
                .append('ul')
                .attr('class', 'inspector-inner tag-wrap fillL2');

            inspectorwrap.append('h4').text('Edit tags');

            function removeTag(d) {
                draw(grabtags().filter(function(t) { return t.key !== d.key; }));
            }

            function draw(data) {

                function emptyTag(d) { return d.key === ''; }

                function pushMore(d, i) {
                    if (d3.event.keyCode === 9) {
                        var tags = grabtags();
                        if (i == tags.length - 1 && !tags.filter(emptyTag).length) {
                            draw(tags.concat([{ key: '', value: '' }]));
                        }
                    }
                }

                function bindTypeahead(d, i) {
                    var selection = d3.select(this);
                    selection.call(d3.typeahead()
                        .data(function(selection, callback) {
                            taginfo.values(selection.datum().key, function(err, data) {
                                callback(data.data);
                            });
                        }));
                }

                var li = inspectorwrap.selectAll('li')
                    .data(data);

                li.exit().remove();

                var row = li.enter()
                    .append('li')
                    .attr('class', 'tag-row');

                function eq(d) { return [d]; }

                var inputs = row
                    .selectAll('div.input-wrap')
                    .data(eq)
                    .enter()
                    .append('div')
                    .attr('class', 'input-wrap')
                    .each(function(d) {

                        var ffuuuck = d3.select(this).append('input');
                        /*
                            .datum(d)
                            .property('type', 'text')
                            .attr('class', 'key-key')
                            .on('keyup.update-key', function(d) {
                                console.log(d);
                                d.key = this.key;
                            });
                            */
                            console.log(ffuuuck, ffuuuck.datum(), data);

                            window.setTimeout(function() {
                                console.log(data, ffuuuck.datum());
                            }, 1000);

                        d3.select(this).append('input')
                            .datum(d)
                            .property('type', 'text')
                            .attr('class', 'value')
                            // .property('value', function(d, i) { return d.value; })
                            .on('keyup.update-value', function(d) {
                                d.value = this.value;
                            });
                            // .on('keydown.push-more', pushMore);
                            // .each(bindTypeahead);

                    });

                var removeBtn = row.append('button')
                    .attr('tabindex', -1)
                    .attr('class','remove minor')
                    .on('click', removeTag);

                removeBtn.append('span').attr('class', 'icon remove');

                var helpBtn = row.append('button')
                    .attr('tabindex', -1)
                    .attr('class', 'tag-help minor')
                    .append('a')
                        .attr('tabindex', -1)
                        .attr('target', '_blank')
                        .attr('href', function(d) {
                            return 'http://taginfo.openstreetmap.org/keys/' + d.key;
                        });

                helpBtn.append('span').attr('class', 'icon inspect');
            }

            function grabtags() {
                var grabbed = [];
                function grab(d) { if (d.key !== '') grabbed.push(d); }
                inspectorwrap.selectAll('li').each(grab);
                return grabbed;
            }

            function unentries(entries) {
                return d3.nest()
                    .key(function(d) { return d.key; })
                    .rollup(function(v) { return v[0].value; })
                    .map(entries);
            }

            var tags = d3.entries(_.clone(entity.tags));
            if (tags.length === 0) tags = d3.entries({'':''});
            draw(tags);

            selection.select('input').node().focus();

            selection.append('div')
                .attr('class', 'inspector-buttons').call(drawbuttons);

            function apply(entity) {
                event.changeTags(entity, unentries(grabtags()));
                event.close(entity);
            }

            function drawbuttons(selection) {
                selection.append('button')
                    .attr('class', 'apply wide action')
                    .html("<span class='icon icon-pre-text apply'></span><span class='label'>Apply</span>")
                    .on('click', apply);
                selection.append('button')
                    .attr('class', 'delete wide action fr')
                    .html("<span class='icon icon-pre-text delete'></span><span class='label'>Delete</span>")
                    .on('click', function(entity) { event.remove(entity); });
            }
        });
    }

    return d3.rebind(inspector, event, 'on');
};
