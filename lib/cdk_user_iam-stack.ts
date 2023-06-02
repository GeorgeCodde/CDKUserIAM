import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkUserIamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Group:
    const group = new iam.Group(this, 'MyGroup', {
      groupName: 'jorgeGroup',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ReadOnlyAccess'),
      ]
    })
    
    // 👇 Create Managed Policy
   const loggingManagedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
     'CloudWatchReadOnlyAccess',
   );
  
    // 👇 Create Permissions Boundary
    const permissionsBoundary = new iam.ManagedPolicy(
      this,
      'example-permissions-boundary',
      {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            actions: ['sqs:*'],
            resources: ['*'],
          }),
        ],
      },
    );
    
    
    // User:
    const user = new iam.User(this, 'MyUser', {
      userName: 'jorgels120878',
      password: cdk.SecretValue.unsafePlainText('Jorgels120878$$'),
      passwordResetRequired: true,
      //password: cdk.SecretValue.plainText('Jorgels120878$$'), //Only for testing purposes
      managedPolicies: [loggingManagedPolicy],
      groups: [group],
      permissionsBoundary: permissionsBoundary,
    })


    /*  Agregando politicas a un usuario          */ 
    user.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    );

    // 👇 create an inline policy
    const inlinePolicy = new iam.Policy(this, 'cloudwatch-logs-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['logs:PutLogEvents'],
          resources: ['*'],
        }),
      ],
    });

    // 👇 attach the inline policy to the user
    user.attachInlinePolicy(inlinePolicy);
    /* ***********************************************/


    /*Agregando politicas a un usuario desde un json */
    
    const policyDocument = {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "FirstStatement",
            "Effect": "Allow",
            "Action": ["iam:ChangePassword"],
            "Resource": "*"
          },
          {
            "Sid": "SecondStatement",
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "*"
          },
          {
            "Sid": "ThirdStatement",
            "Effect": "Allow",
            "Action": [
              "s3:List*",
              "s3:Get*"
            ],
            "Resource": [
              "arn:aws:s3:::confidential-data",
              "arn:aws:s3:::confidential-data/*"
            ],
          }
        ]
    };
    const customPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const newPolicy = new iam.Policy(this, 'MyNewPolicy', {
      document: customPolicyDocument,
    });
    user.attachInlinePolicy(newPolicy);
    /*********************************************** */

  }
}
