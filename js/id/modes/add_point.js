iD.modes.AddPoint = function() {
    var mode = {
        id: 'add-point',
        title: 'Point',
        description: 'Restaurants, monuments, and postal boxes are points.'
    };

    mode.enter = function() {
        var map = mode.map,
            history = mode.history,
            controller = mode.controller;

        map.hoverEnable(false);

        map.hint('Click on the map to add a point.');

        map.surface.on('click.addpoint', function() {
            var node = iD.Node({loc: map.mouseCoordinates(), _poi: true});

            history.perform(
                iD.actions.AddNode(node),
                'added a point');

            controller.enter(iD.modes.Select(node));
        });

        map.keybinding().on('⎋.addpoint', function() {
            controller.exit();
        });
    };

    mode.exit = function() {
        mode.map.hoverEnable(true);
        mode.map.hint(false);
        mode.map.surface.on('click.addpoint', null);
        mode.map.keybinding().on('⎋.addpoint', null);
    };

    return mode;
};
