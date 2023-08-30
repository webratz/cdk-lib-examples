import { App, Stack } from 'aws-cdk-lib';
import { Match, Template, Annotations } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { SmartStack, SmartStackIdentfieable, SmartStackProps, isSmartStack } from '../../src/stack/SmartStack';

describe('SmartStack', () => {
    function getTestAssets(props: Partial<SmartStackProps>) {
        const app = new App();
        const stack = new SmartStack(app, 'TestStack', { teamName: 'DummyTeam', ...props });
        const dummyBucket = new Bucket(stack, 'DummyBucket');
        const template = Template.fromStack(stack);
        return { template, stack, app, dummyBucket };
    }

    test('stack has no error annotations', () => {
        const { stack } = getTestAssets({});
        const annotations = Annotations.fromStack(stack);
        annotations.hasNoError('*', Match.anyValue());
    });

    test('Access Construct property directly', () => {
        const { stack } = getTestAssets({});
        expect(stack.teamName).toBe('DummyTeam');
    });

    test('Access function directly', () => {
        const { stack } = getTestAssets({ stackName: 'DummyName' });
        expect(stack.coolFunction()).toBe('DUMMYNAME');
    });

    test('Access Construct property from resource', () => {
        const { dummyBucket } = getTestAssets({});

        const stack = SmartStack.of(dummyBucket) as SmartStack;
        // only works because we are lucky and this is actually a smart stack, but we can't be sure.
        expect(stack.teamName).toBe('DummyTeam');
    });

    // Works, but i can't be sure its actually a SmartStack
    test('Access Construct property from resource', () => {
        const { dummyBucket } = getTestAssets({});

        const stack = SmartStack.of(dummyBucket) as SmartStack;
        expect(stack.teamName).toBe('DummyTeam');
    });

    test.failing('DOES NOT WORK Access Construct property from resource on non SmartStack', () => {
        const { app } = getTestAssets({});
        const vanillaStack = new Stack(app, 'VanillaStack');
        const dummyBucket = new Bucket(vanillaStack, 'DummyBucket');

        const stack = SmartStack.of(dummyBucket) as SmartStack;
        expect(stack.teamName).toBe('DummyTeam'); // this is undefined!
    });

    test('SmartStack is being detected', () => {
        const app = new App();
        const stack = new SmartStackIdentfieable(app, 'TestStack', { teamName: 'DummyTeam' });
        expect(isSmartStack(stack)).toBeTruthy();
    });

    test('Non SmartStack is not being detected', () => {
        const app = new App();
        const stack = new Stack(app, 'TestStack');
        expect(isSmartStack(stack)).toBeFalsy();
    });

    // TODO you can ensure its a dummystack by checking property
});
