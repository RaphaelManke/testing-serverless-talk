import { DynamoDB } from "@aws-sdk/client-dynamodb";

export const storeOrder = async (
  order: { orderId: string },
  dynamodb: DynamoDB
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error("Missing TABLE_NAME environment variable");
  }

  await dynamodb.putItem({
    TableName: tableName,
    Item: {
      id: { S: order.orderId },
    },
  });

  return {
    id: order.orderId,
  };
};
