import { CustomResource, Stack } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

/**
 * Will create a custom helper function to help lower casing strings within the template
 */
export class LowerCaseHelper extends Construct {
    /**
     * will return a lower cased string for the given input
     */
    public static lower(scope: Construct, id: string, inputString: string) {
        const stack = Stack.of(scope);
        const lcInstance =
            (stack.node.tryFindChild('FGEC1999ClcHelper') as LowerCaseHelper) ??
            new LowerCaseHelper(stack, 'FGEC1999ClcHelper'); // scope is stack here, not any other construct. always adding on fixed level in tree

        if (id.includes('${Token')) {
            throw new Error(`id contains a Token string: ${id}`);
        }

        // we need a custom suffix that is stable, to ensure for each value we get a unique resource id
        // We are using id as a stable suffix
        const lowerHelper = new CustomResource(scope, `LowerCase${id}`, {
            serviceToken: lcInstance.lowerCaseProvider.serviceToken,
            properties: {
                inputString: inputString,
            },
        });
        return lowerHelper.getAttString('transformedString');
    }
    public lowerCaseProvider: Provider;

    private constructor(scope: Construct, id: string) {
        super(scope, id);

        const lowerCaseHandler = new Function(this, 'MyFunction', {
            handler: 'index.handler',
            code: Code.fromInline(`
            return {
                Data: {
                    transformedString: event.ResourceProperties.inputString.toLowerCase(),
                },
            };
            `),
            runtime: Runtime.NODEJS_18_X,
        });

        this.lowerCaseProvider = new Provider(this, 'LowerCaseProvider', {
            onEventHandler: lowerCaseHandler,
            logRetention: RetentionDays.ONE_WEEK,
        });
    }
}
