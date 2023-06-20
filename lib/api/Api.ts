import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class Api extends Construct {
  constructor(scope: Construct, id: string, props: { table: Table }) {
    super(scope, id);

    const api = new RestApi(this, "Api", {});

    const lambda = new NodejsFunction(this, "Lambda", {
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });
    props.table.grantReadWriteData(lambda);

    const orderResource = api.root.addResource("orders");
    orderResource.addMethod("POST", new LambdaIntegration(lambda));
  }
}
