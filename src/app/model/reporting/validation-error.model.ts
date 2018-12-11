export class ValidationError {
    constructor(public readonly level: Level, public readonly message: string) {}
}
export type Level = 'warn' | 'error' | 'info';
