import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { AbstractMemory, ArgType, CommandControl, ExecutableFactory, isExecutableFactory, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser";
import { expressionEval } from "../expressionEval/expressionEval";

export default class DebugCommands {
  @Arguments({max: 1, front: [ "numeric"]})
  static async tick(args: ArgType, memory : AbstractMemory) {
    const prevTick = (args.length == 1)?args[0] as number:0;
    return {
      returnValue: performance.now()-prevTick,
    } as CommandControl;
  }
}