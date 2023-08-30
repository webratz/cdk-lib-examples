import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CustomBucket } from '../../../src';

export class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        // create resource twice to ensure no names overlap
        new CustomBucket(this, 'MyCustomBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
        });
        new CustomBucket(this, 'MyCustomBucket2', {
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
const app = new App();
const testCase = new TestStack(app, 'CdkIntegMultiBucketStack', {});

new IntegTest(app, 'BucketIntegTest', {
    testCases: [testCase],
    // stackUpdateWorkflow: false,
});

app.synth();
