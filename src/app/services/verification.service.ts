import { Injectable } from '@angular/core';
import { ValidationError } from '../model/reporting/validation-error.model';
import { Submission } from '../model/events/submission.model';
import { AtomicEvent } from '../model/events/atomic-event.model';
import { CompositEvent } from '../model/events/composit-event.model';
import { SubmittedEvent } from '../model/events/event.model';
import {ValidationReport} from '../model/reporting/validation-report.model';

@Injectable()
export class VerificationService {

    constructor() {}

    /**
     * Validates the provided JSON file.
     */
    public validate(filename: string, json: string): ValidationReport {
        const errors = [];
        let result = null;

        /* Try to parse the JSON file. */
        try {
            result = <Submission>JSON.parse(json);
        } catch (e) {
            errors.push(new ValidationError('error', `Failed to parse JSON due to an error; ${e.message}.`));
            return new ValidationReport(filename, false, errors);
        }

        /* Perform basic sanity checks. */
        let ret: [boolean, ValidationError[]] = this.validateBasic(result);
        errors.push(...ret[1]);
        if (ret[0]) {
            return new ValidationReport(filename, false, errors);
        }

        /* Perform check of the event structure. */
        ret = this.validateEventStructure(result);
        errors.push(...ret[1]);
        if (ret[0]) {
            return new ValidationReport(filename, false, errors);
        }

        /* Return all the validation errors. */
        return new ValidationReport(filename, true, errors);
    }

    /**
     * Performs validation of the basic event data structure.
     *
     * @param result The Submission object that should be checked.
     */
    private validateEventStructure(result: Submission): [boolean, ValidationError[]] {
        const errors = [];
        let abort = false;
        let last = -1;
        result.events.forEach((event, index) => {

            /* Check event timestamp. */
            if (!event.timestamp) {
                errors.push(new ValidationError('error', `Event ${index} is missing a timestamp!`));
                abort = true;
            } else if (event.timestamp >= result.timestamp) {
                errors.push(new ValidationError('warn', `The timestamp of Event ${index} lies after the submission timestamp!`));
            }

            /* Check if timestamps are growing monotonically. */
            if (last > -1) {
                if (event.timestamp < last) {
                    errors.push(new ValidationError('warn', `The timestamp of Event ${index} precedes the timestamp of Event ${index}-1!`));
                }
            }
            last = event.timestamp;

            /* Make type specific checks. */
            if (this.isAtomic(event)) {

            } else if (this.isComposit(event)) {
                if (event.actions.length <= 1) {
                    errors.push(new ValidationError('warn', `The Event ${index} is a composit event but does contain less than one action!`));
                }
            } else {
                errors.push(new ValidationError('error', `The Event ${index} does neither conform to being an atomic nor a composit event!`));
                abort = true;
            }
        });
        return [abort, errors];
    }


    /**
     * Performs validation of the basic submission data structure.
     *
     * @param result The Submission object that should be checked.
     */
    private validateBasic(result: Submission): [boolean, ValidationError[]] {
        const errors = [];
        let abort = false;
        if (!result.teamId) {
            errors.push(new ValidationError('error', 'Team ID is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Team ID is ${result.teamId}`));
        }
        if (!result.memberId) {
            errors.push(new ValidationError('error', 'Member ID is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Member ID is ${result.memberId}`));
        }
        if (!result.timestamp) {
            errors.push(new ValidationError('error', 'Timestamp is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Timestamp is ${result.memberId}`));
        }
        if (!result.type) {
            errors.push(new ValidationError('error', 'Submission type is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Submission type is ${result.type}`));
        }
        if (!result.events) {
            errors.push(new ValidationError('error', 'The events element is null!'));
            abort = true;
        } else if (result.events.length === 0) {
            abort = true;
            errors.push(new ValidationError('warn', `The submission does not contain any events.`));
        } else {
            errors.push(new ValidationError('info', `The submission contains ${result.events.length} events.`));
        }
        return [abort, errors];
    }

    /**
     * Checks if the provided event is an AtomicEvent.
     *
     * @param event The SubmittedEvent to check.
     */
    private isAtomic(event: SubmittedEvent): event is AtomicEvent {
        return (<AtomicEvent>event).category !== undefined && (<AtomicEvent>event).type !== undefined;
    }

    /**
     * Checks if the provided event is a CompositEvent.
     *
     * @param event The SubmittedEvent to check.
     */
    private isComposit(event: SubmittedEvent): event is CompositEvent {
        return (<CompositEvent>event).actions !== undefined;
    }
}
