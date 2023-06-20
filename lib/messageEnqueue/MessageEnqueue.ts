import { Table } from "aws-cdk-lib/aws-dynamodb";
import {
  DynamoDBStreamSource,
  Pipe,
  PipeInputTransformation,
  PipeSourceStartingPosition,
  SqsTarget,
} from "@raphaelmanke/aws-cdk-pipes-rfc";
import { Construct } from "constructs";
import { Queue } from "aws-cdk-lib/aws-sqs";

export class MessageEnqueue extends Construct {
  public readonly queue: Queue;
  constructor(scope: Construct, id: string, props: { table: Table }) {
    super(scope, id);

    const source = new DynamoDBStreamSource(props.table, {
      startingPosition: PipeSourceStartingPosition.TRIM_HORIZON,
    });

    this.queue = new Queue(this, "Queue", {});

    const target = new SqsTarget(this.queue, {
      inputTemplate: PipeInputTransformation.fromJson({
        id: "<$.dynamodb.NewImage.id.S>",
      }),
    });

    const pipe = new Pipe(this, "Pipe", {
      source,
      target,
    });
  }
}
