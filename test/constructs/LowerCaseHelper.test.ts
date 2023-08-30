import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { LowerCaseHelper } from '../../src/constructs/SingletonConstruct';

describe('Lower Case Helper', () => {
    test('The lower case lambda itself is only created once', () => {
        const app = new App();
        const stack = new Stack(app, 'testStack');

        const cluster = new Cluster(stack, 'ECSCluster');
        LowerCaseHelper.lower(cluster, 'myString4', 'myString4');
        LowerCaseHelper.lower(cluster, 'myString5', 'myString5');

        LowerCaseHelper.lower(stack, 'myString1', 'myString1');
        LowerCaseHelper.lower(stack, 'myString2', 'myString2');
        LowerCaseHelper.lower(stack, 'myString3', 'myString4');

        const template = Template.fromStack(stack);
        template.resourceCountIs('AWS::Lambda::Function', 3); // 2 other lambdas + 1 actual lowerCase Lambda
        template.resourceCountIs('AWS::CloudFormation::CustomResource', 5);
    });

    test('The ServiceToken does not change', () => {
        const app = new App();
        const stack = new Stack(app, 'testStack');

        const cluster = new Cluster(stack, 'ECSCluster');
        LowerCaseHelper.lower(cluster, 'myString4', 'myString4');
        LowerCaseHelper.lower(cluster, 'myString5', 'myString5');

        const template = Template.fromStack(stack);

        template.hasResourceProperties('AWS::CloudFormation::CustomResource', {
            ServiceToken: {
                'Fn::GetAtt': ['FGEC1999ClcHelperLowerCaseProviderframeworkonEventD847CAA2', 'Arn'],
            },
        });
    });
});
