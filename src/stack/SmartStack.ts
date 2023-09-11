import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { S3Aspect } from '../constructs/S3Aspect';

export interface SmartStackProps extends cdk.StackProps {
    /**
     * Name of team ownig this
     */
    readonly teamName: string;
}

/**
 * Stack that has additional features, can be nice, but tricky
 */
export class SmartStack extends cdk.Stack {
    readonly teamName: string;
    constructor(scope: Construct, id: string, props: SmartStackProps) {
        super(scope, id, props);
        this.teamName = props.teamName;
    }

    public coolFunction() {
        return this.stackName.toUpperCase();
    }
}

/**
 * Stack that has additional features, can be nice, but tricky
 */
export class SmartStackIdentfieable extends cdk.Stack {
    readonly smartStack: string = '34C79413-F87F-4C6F-B0C5-705EA614AB00';
    readonly teamName: string;
    constructor(scope: Construct, id: string, props: SmartStackProps) {
        super(scope, id, props);
        this.teamName = props.teamName;
        cdk.Aspects.of(this).add(new S3Aspect());
    }

    public coolFunction() {
        return this.stackName.toUpperCase();
    }
}

export function isSmartStack(construct: Construct): boolean {
    if ('smartStack' in construct) {
        const stack = construct as SmartStackIdentfieable;
        if (stack.smartStack === '34C79413-F87F-4C6F-B0C5-705EA614AB00') {
            return true;
        }
    }
    return false;
}
