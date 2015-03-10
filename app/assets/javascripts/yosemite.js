var Yosemite = {
    controller: undefined,
    action: undefined,

    init: function(options) {
        Yosemite.controller = options.controller ? options.controller : undefined;
        Yosemite.action = options.action ? options.action : undefined;
        var className =
            Yosemite.controller.charAt(0).toUpperCase() + Yosemite.controller.slice(1) +
            Yosemite.action.charAt(0).toUpperCase() + Yosemite.action.slice(1);
        var controller = window[className];

        if (typeof(controller) != 'undefined' && controller.init) {
            controller.init();
        }
    }
};
