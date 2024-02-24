type Commands = Command[];

class Command {
    label : string;
    arguments : (string | Commands)[];

    constructor(label : string) {
        this.label = label;
        this.arguments = [];
    }

    addArgument(argument : string | Commands) {
        this.arguments.push(argument);
    }
}

/**
 * This is not a classical tokenization, it makes a basic preprocessing, too.
 * The syntax of this dialect is the following:
 * [COMMAND LABEL] argument1 (argument 2 which contains spaces) { ... This contains additional commands ... } \n
 * So every command has a label. For example: forward
 * The labels are followed by zero or more arguments
 *      An argument can be a single word (string literal, number, expression without space) or multiple words in parenthesis, like ( 3  <  2)
 *      An argument can be a series of commands. These commands must be between { and }. 
 */

export default function toCommandList(tokens : string[], tracers : Tracer[]) : Commands {
    let state : "command" | "arguments" = "command";
    let ret : Commands = [];
    for (let i=0; i<tokens.length; ++i) {
        let token = tokens[i];
        if (token == "{") {
            // I have to find its closing pair
        }
    }

}