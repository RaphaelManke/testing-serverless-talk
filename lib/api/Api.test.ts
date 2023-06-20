import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Api } from "./Api";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

it("should have a post order route", () => {
  // Arrange
  const app = new App();
  const testStack = new Stack(app, "testStack");
  const table = new Table(testStack, "Table", {
    partitionKey: { name: "id", type: AttributeType.STRING },
  });
  new Api(testStack, "Api", { table });

  // Act
  const template = Template.fromStack(testStack);

  // Assert
  const apigateway = template.findResources("AWS::ApiGateway::RestApi");
  const orderResource = template.findResources("AWS::ApiGateway::Resource", {
    Properties: {
      PathPart: "orders",
      RestApiId: {
        Ref: Object.keys(apigateway)[0],
      },
    },
  });
  expect(orderResource).toMatchSnapshot();
  template.findResources("AWS::ApiGateway::Method", {
    Properties: {
      HttpMethod: "POST",
      RestApiId: {
        Ref: Object.keys(apigateway)[0],
      },
      ResourceId: {
        Ref: Object.keys(orderResource)[0],
      },
    },
  });
});

it("should give lambda access to table", () => {
  // Arrange
  const app = new App();
  const testStack = new Stack(app, "testStack");
  const table = new Table(testStack, "Table", {
    partitionKey: { name: "id", type: AttributeType.STRING },
  });
  const grantWriteSpy = jest.spyOn(table, "grantReadWriteData");
  new Api(testStack, "Api", { table });

  // Act
  const template = Template.fromStack(testStack);

  // Assert
  expect(grantWriteSpy).toBeCalledTimes(1);

  const lambda = template.findResources("AWS::Lambda::Function");
  expect(Object.values(lambda)[0].Properties.Environment)
    .toMatchInlineSnapshot(`
{
  "Variables": {
    "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1",
    "TABLE_NAME": {
      "Ref": "TableCD117FA1",
    },
  },
}
`);
});
