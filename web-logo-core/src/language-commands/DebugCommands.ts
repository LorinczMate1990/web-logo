import { turtleCommandPubSub } from "../pubsub/pubsubs.js";
import { InterceptableMemory, ArgType, CommandControl, ExecutableFactory, isExecutableFactory, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types.js";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser.js";
import { expressionEval } from "../expressionEval/expressionEval.js";

export default class DebugCommands {
  @Arguments({max: 1, front: [ "numeric"]})
  static async tick(args: ArgType, memory : InterceptableMemory) {
    const prevTick = (args.length == 1)?args[0] as number:0;
    return {
      returnValue: performance.now()-prevTick,
    } as CommandControl;
  }
}