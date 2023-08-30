import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CustomBucket } from '../../../src';

const bucketName = 'cdk-integ-test-custombucket';
export class TestStack extends Stack {
    resource: IBucket;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.resource = new CustomBucket(this, 'MyCustomBucket', {
            bucketName: bucketName,
            removalPolicy: RemovalPolicy.DESTROY,
        }).bucket;
    }
}
const app = new App();
const testCase = new TestStack(app, 'CdkIntegBucketStack', {});

const integ = new IntegTest(app, 'BucketIntegTest', {
    testCases: [testCase],
    // stackUpdateWorkflow: false,
});

const message = integ.assertions.awsApiCall('S3', 'listObjectsV2', { Bucket: bucketName });
message.provider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['s3:ListObjectsV2', 's3:ListObjects', 's3:ListBucket'],
    Resource: ['*'],
});

message.expect(
    ExpectedResult.objectLike({
        Name: bucketName,
    }),
);

app.synth();
