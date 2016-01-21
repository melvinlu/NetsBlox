// Scripts panel for the table
// TODO
TableScriptsMorph.prototype = new ScriptsMorph();
TableScriptsMorph.prototype.constructor = TableScriptsMorph;
TableScriptsMorph.uber = ScriptsMorph.prototype;

function TableScriptsMorph(owner) {
    this.init(owner);
    this.sockets = owner.sockets;
}

TableScriptsMorph.prototype.reactToDropOf = function(droppedMorph, hand) {
    var serializer = new SnapSerializer(),
        xml = serializer.serialize(droppedMorph);

    this.sockets.sendMessage(['table-edit', 'new', xml].join(' '));
    ScriptsMorph.uber.reactToDropOf.call(this, droppedMorph, hand);
};

// Overrides
// On drop...
// id the block
// TODO
// send a message to the server to create the given block (don't create it!)
// TODO

// On move...
// id the block
// TODO
// send a message to the server to update the given block
// TODO

// On delete...
// id the block
// TODO
// send a message to the server to delete the given block
// TODO

// The server will respond update events (block created, removed, updated)
// On create message received, create the given block
// TODO

// On update message received, update the given block (move, set new parent)
// TODO

// On remove message received, remove the given block
// TODO
