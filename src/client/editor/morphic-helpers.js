// This contains the morphic testing helpers to be loaded on the client
var Test = {};  // namespace

(function(global) {

    var MEMORY = {};

    var Selector = function(selector) {
    };

    // tl;dr selectors: '.CLASS_NAME', '#id', or '[attribute]'
    Selector.SELECTORS = /(\.[a-zA-Z_]{1}[a-zA-Z0-9_]*|#[a-zA-Z_]{1}[a-zA-Z0-9_]*|\[[a-zA-Z_]{1}[a-zA-Z0-9_]*\])/;

    Selector.prototype.parse = function(selector) {
    };

    Selector.prototype._select = function(root) {
        // Select on a single node (return [] of matches)
        var matches = [];
        // TODO
        return matches;
    };

    Selector.prototype.select = function(roots) {
        // For the given root node, find nodes that match
        return roots
            .map(root => this._select(root))
            .reduce((l1, l2) => l1.concat(l2), []);
    };

    var Select = function(selector, roots) {
        var match = selector.match(Selector.SELECTORS),
            s,
            selectors = [],
            nodes;

        while (match) {
            s = match[0];
            selectors.push(new Selector(s));
            selector = selector.substring(s.length);
            match = selector.match(Selector.SELECTORS);
        }

        // use the selectors in order on the root nodes
        nodes = roots;
        for (var i = 0; i < selectors.length; i++) {
            nodes = selectors[i].select(nodes);
        }
        return nodes;
    };

    global.MEMORY = MEMORY;
    global.Selector = Selector;

    new Select('.WorldMorph.IDE_Morph[controlBar]', []);

})(Test);
