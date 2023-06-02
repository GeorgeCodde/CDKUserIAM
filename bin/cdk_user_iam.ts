#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkUserIamStack } from '../lib/cdk_user_iam-stack';
require('dotenv').config({path: './.env'})

const app = new cdk.App();
new CdkUserIamStack(app, 'CdkUserIamStack', {
  stackName: 'CdkUserIamStack',
  env: {
    region: process.env.REGION ,
    account: process.env.ACCOUNT
  }
});