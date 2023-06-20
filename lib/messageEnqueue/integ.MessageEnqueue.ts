import { App, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { ExpectedResult, IntegTest } from "@aws-cdk/integ-tests-alpha";
import { MessageEnqueue } from "./MessageEnqueue";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Match } from "aws-cdk-lib/assertions";

// Arrange
const app = new App();
const stack = new Stack(app, "MessageEnqueueTest");
const table = new Table(stack, "Table", {
  partitionKey: { name: "id", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  stream: StreamViewType.NEW_AND_OLD_IMAGES,
  removalPolicy: RemovalPolicy.DESTROY,
});
const constructUnderTest = new MessageEnqueue(stack, "MessageEnqueue", {
  table,
});

const tests = new IntegTest(app, "DbToSqs", {
  testCases: [stack],
});

// Act
const randomId = Math.random().toString(36).substring(7);
const putItemInDatabase = tests.assertions.awsApiCall("DynamoDB", "putItem", {
  TableName: table.tableName,
  Item: {
    id: { S: randomId },
  },
});

// Assert
const receiveMessagesFromQueue = tests.assertions.awsApiCall(
  "SQS",
  "receiveMessage",
  {
    QueueUrl: constructUnderTest.queue.queueUrl,
    WaitTimeSeconds: 20,
  }
);
const queueMessageExpectation = ExpectedResult.objectLike({
  Messages: [
    {
      Body: JSON.stringify({ id: randomId }),
    },
  ],
});
putItemInDatabase.next(
  receiveMessagesFromQueue.expect(queueMessageExpectation).waitForAssertions({
    totalTimeout: Duration.seconds(60),
  })
);
