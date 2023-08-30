import { Duration, Tags } from 'aws-cdk-lib';
import { Alias } from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

/**
 * This extends the existing bucket properties with our own settings, hiding the actual implementation
 */
export interface CustomBucketPropsHidden {
    /**
     * Set to true if DataAccess can interact with the bucket
     * @default false
     */
    readonly dataAccessEnabled?: boolean;

    /**
     * Should bucket versioning be enabled
     */
    readonly versioned?: boolean;
}

/**
 * Create a private / internal S3 Bucket with all required settings to be compliant
 * The defaults can not be overriden out of the boy by a user in this example

 */
export class CustomBucketHidden extends Construct {
    public readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: CustomBucketPropsHidden = {}) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, 'CustomBucketHidden', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryptionKey: Alias.fromAliasName(this, 'KmsKeyAlias', 'data'),
            bucketKeyEnabled: true,
            versioned: props.versioned ?? true,
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
