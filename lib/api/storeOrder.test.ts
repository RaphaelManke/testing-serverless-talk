import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { storeOrder } from "./storeOrder";
import {
  startDb,
  createTables,
  setup,
  deleteTables,
  stopDb,
} from "jest-dynalite";
process.env.AWS_REGION = "";
process.env.TABLE_NAME = "Orders";
process.env.AWS_ACCESS_KEY_ID = "DEFAULT_ACCESS_KEY";
process.env.AWS_SECRET_ACCESS_KEY = "DEFAULT_SECRET";

jest.setTimeout(10000);
let dynamodb: DynamoDB;

beforeAll(async () => {
  setup(__dirname);
  await startDb();
  await createTables();
  dynamodb = new DynamoDB({
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  });
});
afterAll(async () => {
  dynamodb.destroy();
  await deleteTables();
  await stopDb();
});

it("should store order", async () => {
  // Arrange
  const order = {
    orderId: "123",
  };
  // Act
  const result = await storeOrder(order, dynamodb);
  // Assert
  expect(result).toEqual({ id: "123" });
  const { Item } = await dynamodb.getItem({
    TableName: "Orders",
    Key: {
      id: { S: "123" },
    },
  });
  expect(Item).toEqual({ id: { S: "123" } });
});
