import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./Api.Lambda";
import * as validateBodyModule from "./validateBody";
import * as repository from "./storeOrder";

it("Return 400 if no body is provided", async () => {
  // Arrange
  const event = { body: undefined } as unknown as APIGatewayProxyEvent;

  // Act
  const result = await handler(event);

  // Assert
  expect(result.statusCode).toEqual(400);
  expect(result.body).toEqual(JSON.stringify({ message: "Missing body" }));
});

it("Return 200 if body is valid", async () => {
  // Arrange
  const validationSpy = jest.spyOn(validateBodyModule, "validateBody");
  validationSpy.mockResolvedValueOnce({ id: "123" });
  const repositorySpy = jest.spyOn(repository, "storeOrder");
  repositorySpy.mockResolvedValueOnce({ id: "123" });
  const event = { body: '{"id": "123"}' } as unknown as APIGatewayProxyEvent;

  // Act
  const result = await handler(event);

  // Assert
  expect(result.statusCode).toEqual(200);
  expect(result.body).toEqual(JSON.stringify({ id: "123" }));
});

it("Return 400 if body is invalid", async () => {
  // Arrange
  const validationSpy = jest.spyOn(validateBodyModule, "validateBody");
  validationSpy.mockRejectedValueOnce(new Error("Invalid body"));
  const event = { body: "{invalid: json" } as unknown as APIGatewayProxyEvent;

  // Act
  const result = await handler(event);

  // Assert
  expect(result.statusCode).toEqual(400);
  expect(result.body).toEqual(JSON.stringify({ message: "Invalid body" }));
});
