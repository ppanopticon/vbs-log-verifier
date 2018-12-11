import {ValidationError} from './validation-error.model';

export class ValidationReport {
    constructor(public readonly filename: string, public readonly success: boolean, public errors: ValidationError[]) {}

    /**
     *
     */
    get numErrors(): number {
        return this.errors.filter(f => f.level === 'error').length;
    }

    /**
     *
     */
    get numWarnings(): number {
        return this.errors.filter(f => f.level === 'warn').length;
    }

    /**
     *
     */
    get numInfos(): number {
        return this.errors.filter(f => f.level === 'info').length;
    }
}