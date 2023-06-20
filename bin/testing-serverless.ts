#!/usr/bin/env node
import "source-map-support/register";
import { TestingServerless } from "../lib/testing-serverless";
import { App } from "aws-cdk-lib";

const app = new App();

new TestingServerless(app, "TestingServerless", {});
