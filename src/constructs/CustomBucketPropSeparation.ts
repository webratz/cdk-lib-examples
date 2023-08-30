import { Duration, Tags } from 'aws-cdk-lib';
import { Alias } from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
 * This extends the existing bucket properties with our own settings
 */
export interface CustomBucketPropsSeparated {
    /**
     * Set to true if DataAccess can interact with the bucket
     * @default false
     */
    readonly dataAccessEnabled?: boolean;

    /**
     * Properties of original Bucket
     */
    readonly bucketProps?: Partial<s3.BucketProps>;
}

/**
 * Create a private / internal S3 Bucket with all required settings to be compliant
 * The defaults can not be overriden out of the boy by a user in this example

 */
export class CustomBucketSeparated extends Construct {
    public bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: CustomBucketPropsSeparated = {}) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, 'CustomBucket', {
            ...props.bucketProps, // whatever the user sets in props, if its set below it will be overwritten
            // basic settings for really all S3 Buckets that are private
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryptionKey: Alias.fromAliasName(this, 'KmsKeyAlias', 'data'),
            bucketKeyEnabled: true,
            versioned: true,
        });

        Tags.of(this.bucket).add('dataAccess:enabled', String(props.dataAccessEnabled));

        // delete everything after 7 days that is not the latest version
        // only useful if versioning is enabled as in our case
        this.bucket.addLifecycleRule({
            enabled: true,
            noncurrentVersionExpiration: Duration.days(7),
        });
    }
}
