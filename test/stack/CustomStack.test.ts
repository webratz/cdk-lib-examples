import { App } from 'aws-cdk-lib';
import { Match, Template, Annotations } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CustomStack, CustomStackProps } from '../../src/stack/CustomStack';

describe('CustomStack', () => {
    function getTestAssets(props: Partial<CustomStackProps>) {
        const app = new App();
        const stack = new CustomStack(app, 'TestStack', { teamName: 'DummyTeam', ...props });
        const dummyBucket = new Bucket(stack, 'DummyBucket');
        const template = Template.fromStack(stack);
        return { template, stack, app, dummyBucket };
    }

    test('stack has no error annotations', () => {
        const { stack } = getTestAssets({});
        const annotations = Annotations.fromStack(stack);
        annotations.hasNoError('*', Match.anyValue());
    });

    test('Env name is reflected in StackName', () => {
        const { stack } = getTestAssets({ envName: 'dev' });
        expect(stack.stackName).toBe('dev-TestStack');
    });
});
