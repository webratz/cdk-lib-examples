import { Stack, App } from 'aws-cdk-lib';
import { Match, Template, Annotations } from 'aws-cdk-lib/assertions';
import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { CustomBucket, CustomBucketProps } from '../../src/constructs';

describe('Private S3 Bucket Security configuration', () => {
    function getTestAssets(props: Partial<CustomBucketProps>) {
        const app = new App();
        const stack = new Stack(app, 'TestStack');
        const bucket = new CustomBucket(stack, 'TestBucket', props);
        const template = Template.fromStack(stack);
        return { template, stack, app, bucket };
    }

    test('stack has no error annotations', () => {
        const { stack } = getTestAssets({});
        const annotations = Annotations.fromStack(stack);
        annotations.hasNoError('*', Match.anyValue());
    });

    test('Public access is blocked', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::Bucket', {
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true,
            },
        });
    });

    test('SSE Alorithm is KMS', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::Bucket', {
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        BucketKeyEnabled: Match.anyValue(),
                        ServerSideEncryptionByDefault: {
                            KMSMasterKeyID: Match.anyValue(),
                            SSEAlgorithm: 'aws:kms',
                        },
                    },
                ],
            },
        });
    });

    test('Bucket key is enabled', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::Bucket', {
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        BucketKeyEnabled: true,
                        ServerSideEncryptionByDefault: Match.anyValue(),
                    },
                ],
            },
        });
    });

    test('Bucket key is enabled, even when user overrides', () => {
        const { template } = getTestAssets({ bucketKeyEnabled: false });

        template.hasResourceProperties('AWS::S3::Bucket', {
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        BucketKeyEnabled: true,
                        ServerSideEncryptionByDefault: Match.anyValue(),
                    },
                ],
            },
        });
    });

    test('Bucket policy enforces usage of SSL', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::BucketPolicy', {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    {
                        Action: 's3:*',
                        Condition: {
                            Bool: {
                                'aws:SecureTransport': 'false',
                            },
                        },
                        Effect: 'Deny',
                        Principal: {
                            AWS: '*',
                        },
                        Resource: Match.anyValue(),
                    },
                ]),
                Version: Match.anyValue(),
            },
        });
    });

    test('Versioning is enabled', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::Bucket', {
            VersioningConfiguration: {
                Status: 'Enabled',
            },
        });
    });

    test('Default lifecycle rule is created', () => {
        const { template } = getTestAssets({});

        template.hasResourceProperties('AWS::S3::Bucket', {
            LifecycleConfiguration: {
                Rules: Match.arrayWith([
                    {
                        NoncurrentVersionExpiration: {
                            NoncurrentDays: 7,
                        },
                        Status: 'Enabled',
                    },
                ]),
            },
        });
    });

    test('Update and Deletion policy is set to retain', () => {
        const { template } = getTestAssets({});

        template.hasResource('AWS::S3::Bucket', {
            UpdateReplacePolicy: 'Retain',
            DeletionPolicy: 'Retain',
        });
    });
    test('Public access is blocked, even if set otherwise by user', () => {
        const { template } = getTestAssets({ blockPublicAccess: BlockPublicAccess.BLOCK_ACLS });

        template.hasResourceProperties('AWS::S3::Bucket', {
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true,
            },
        });
    });
});
