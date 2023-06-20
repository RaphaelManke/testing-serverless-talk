import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct, Node } from "constructs";
import { Api } from "./api/Api";
import { MessageEnqueue } from "./messageEnqueue/MessageEnqueue";

export class TestingServerless extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, "Table", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    new Api(this, "Api", {
      table,
    });

    new MessageEnqueue(this, "MessageEnqueue", {
      table,
    });
  }
}
