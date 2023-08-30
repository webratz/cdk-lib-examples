import * as cdk from 'aws-cdk-lib';
import { DefaultStackSynthesizer, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface CustomStackProps extends cdk.StackProps {
    /**
     * Optional. Identifier used for stack name
     */
    readonly deploymentIdentifier?: string;

    /**
     * Name of environment
     */
    readonly envName?: string;

    /**
     * Name of team ownig this
     */
    readonly teamName?: string;
}

/**
 * Example Custom Stack with custom naming
 * Problems: Name pattern can never be changed, unless cached / stored somewhere
 */
export class CustomStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: CustomStackProps) {
        const idlist = [props?.envName, props?.deploymentIdentifier, id]
            .filter((elem) => elem !== undefined)
            .filter((elem) => elem !== '');

        const standardName = idlist.join('-');

        // we limit the string to a max of 60, as we need another 64 for the sha and the maximum length we can have for docker is 128 characters
        const assetPrefix = `${standardName}`.toLowerCase().substring(0, 60) + '-';

        super(scope, id, {
            env: props?.env,
            synthesizer: new DefaultStackSynthesizer({
                dockerTagPrefix: assetPrefix,
                bucketPrefix: assetPrefix,
                qualifier: 'myFancyQualifier', // this needs to match what was set during bootstrap
            }),
            ...props,
            stackName: props?.stackName ?? standardName,
        });

        // TODO add example aspect
        if (props?.teamName) {
            Tags.of(this).add('OwningTeam', props.teamName);
        }
    }
}
