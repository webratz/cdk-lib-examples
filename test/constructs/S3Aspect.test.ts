import { Stack, App, Aspects } from 'aws-cdk-lib';
import { Match, Template, Annotations } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { S3Aspect } from '../../src/constructs';

describe('Aspect applies Tag to S3 Buckets', () => {
    function getTestAssets() {
        const app = new App();
        const stack = new Stack(app, 'TestStack');
        const bucket = new Bucket(stack, 'TestBucket');
        Aspects.of(stack).add(new S3Aspect());
        const template = Template.fromStack(stack);
        return { template, stack, app, bucket };
    }

    test('stack has no error annotations', () => {
        const { stack } = getTestAssets();
        const annotations = Annotations.fromStack(stack);
        annotations.hasNoError('*', Match.anyValue());
    });

    test('Version config is enabled', () => {
        const { template } = getTestAssets();

        template.hasResourceProperties('AWS::S3::Bucket', {
            VersioningConfiguration: {
                Status: 'Enabled',
            },
        });
    });
});
