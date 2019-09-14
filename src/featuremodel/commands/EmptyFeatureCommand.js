export function EmptyFeatureCommand() { }

EmptyFeatureCommand.prototype.perform = function() { }

export var defaultFeatureCommands = [new EmptyFeatureCommand(), new EmptyFeatureCommand(), new EmptyFeatureCommand()];

