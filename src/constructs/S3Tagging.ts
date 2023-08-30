import { Aspects, IAspect, Stack, Tags } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct, IConstruct } from 'constructs';

/**
 * Actual aspect that adds a tag to all S3 buckets
 */
export class S3TaggerAspect implements IAspect {
    public visit(node: IConstruct): void {
        if (node instanceof s3.CfnBucket) {
            Tags.of(node).add('myCustomS3Tag', 'hasAValue');
            // add more useful checks for your use case
        }
    }
}

/**
 * One way to add the Aspect to your setup and reach everything else in it.
 * Depending on your expectactions this should be set to another scope (eg construct or even App)
 */
export class S3Tagging extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        const stack = Stack.of(this);
        Aspects.of(stack).add(new S3TaggerAspect());
    }
}
