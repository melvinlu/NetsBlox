// jshint esnext: true
'use strict';

var fs = require('fs'),
    SIF_HEADER = '(function(globals) {\nvar modules = modules || {}',
    SIF_FOOTER = '})(this);';

module.exports = {
    createSIF: (src, globals) => {
        globals = globals || [];
        return [
            SIF_HEADER,
            src,
            globals
                .map(name => `globals.${name} = ${name};`)
                .join('\n'),
            SIF_FOOTER
        ].join('\n');
    },

    getSource: (paths) => {
        return paths
            .map(name => fs.readFileSync(name, 'utf8'))
            .join('\n');
    }
};
