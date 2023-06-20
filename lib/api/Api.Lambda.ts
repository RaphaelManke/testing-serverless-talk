import { APIGatewayProxyEvent } from "aws-lambda";
import { validateBody } from "./validateBody";
import { storeOrder } from "./storeOrder";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const dynamodb = new DynamoDB({});
export const handler = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing body" }),
    };
  }
  let order;
  try {
    order = await validateBody(JSON.parse(event.body));
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid body" }),
    };
  }
  const orderEntity = await storeOrder(order, dynamodb);

  return {
    statusCode: 200,
    body: JSON.stringify({ ...orderEntity }),
  };
};
