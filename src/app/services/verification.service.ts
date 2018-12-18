import { Injectable } from '@angular/core';
import { ValidationError } from '../model/reporting/validation-error.model';
import { Submission } from '../model/events/submission.model';
import { AtomicEvent } from '../model/events/atomic-event.model';
import { CompositEvent } from '../model/events/composit-event.model';
import { SubmittedEvent } from '../model/events/event.model';
import {ValidationReport} from '../model/reporting/validation-report.model';
import {CategoryTypeMap, EventCategories, EventCategory} from '../model/events/event-category.model';

@Injectable()
export class VerificationService {

    constructor() {}

    /**
     * Validates the provided JSON file.
     *
     * @param filename The filename (for identification purposes).
     * @param json The raw JSON string.
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
        ret = this.validateCompositEvents(result);
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
    private validateCompositEvents(result: Submission): [boolean, ValidationError[]] {
        const errors = [];
        let abort = false;
        let last = -1;
        result.events.forEach((event, index) => {

            /* Check event timestamp. */
            if (!event.timestamp) {
                errors.push(new ValidationError('error', `Event ${index} is missing a timestamp!`));
                abort = true;
            } else if (event.timestamp >= result.timestamp) {
                errors.push(new ValidationError('warn', `The timestamp of event #${index} lies after the submission timestamp!`));
            }

            /* Check if timestamps are growing monotonically. */
            if (last > -1) {
                if (event.timestamp < last) {
                    errors.push(new ValidationError('warn', `The timestamp of event #${index} precedes the timestamp of event #${index-1}!`));
                }
            }
            last = event.timestamp;


            if (this.isComposit(event)) {
                const error = this.validateCompositEvent(event, `${index}`);
                if (error[0]) {
                    abort = true;
                }
                errors.push(...error[1]);
            } else if (this.isAtomic(event)) {
                const error = this.validateAtomicEvent(event, `${index}`);
                if (error) {
                    errors.push(error);
                    if (error.level === 'error') {
                        abort = true;
                    }
                }
            } else {
                errors.push(new ValidationError('error', `The event #${index} does neither conform to being an atomic nor a composit event!`));
                abort = true;
            }
        });
        return [abort, errors];
    }


    /**
     * Validates a CompositEvent.
     *
     * @param event The CompositEvent that is being validated.
     * @param index The index of the CompositEvent.
     */
    private validateCompositEvent(event: CompositEvent, index: string): [boolean, ValidationError[]] {
        const errors = [];
        let abort = false;

        /* Check if CompositEvent consists of at least two AtomicEvents. */
        if (event.actions.length <= 1) {
            errors.push(new ValidationError('warn', `The event #${index} is a composit event but does contain less than one action!`));
        }

        /* Check each AtomicEvent. */
        event.actions.forEach((e, i) => {
            const error = this.validateAtomicEvent(e, `${index}.{$i}`);
            if (error) {
                errors.push(error);
                if (error.level === 'error') {
                    abort = true;
                }
            }
        });

        /* Return validation results. */
        return [abort, errors];
    }


    /**
     * Validates an AtomicEvent.
     *
     * @param event The AtomicEvent that is being validated.
     * @param index The index of the AtomicEvent.
     */
    private validateAtomicEvent(event: AtomicEvent, index: string): ValidationError {
        /* Check if EventCategory is defined. */
        if (!event.category) {
            return new ValidationError('error', `The event #${index}'s category is not defined.`);
        }

        /* Check if the EventType is one of the pre-defined types. */
        if (EventCategories.indexOf(<EventCategory>event.category.toLowerCase()) === -1) {
            return new ValidationError('error', `The provided category '${event.category}' for event #${index} is not one of the predefined types.`);
        }

        /* Check if EventType is defined. */
        if (!event.type || !(event.type instanceof Array) || event.type.length === 0) {
            return new ValidationError('error', `The event #${index}'s type is not properly defined.`);
        }

        /* Check if the EventType is one of the pre-defined types. */
        const types = CategoryTypeMap.get(<EventCategory>event.category.toLowerCase());
        if (types.length > 0) {
            const fail = event.type.map(s => s.toLowerCase()).filter(c => types.indexOf(c) === -1).join(',');
            if (fail.length > 0) {
                return new ValidationError('warn', `The provided types '${fail}' for event #${index} are not contained in the list of predefined types. Please check with VBS organizers.`);
            }
        }

        /* Everything passed! */
        return null;
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
            errors.push(new ValidationError('error', 'Submission timestamp is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Submission timestamp is ${result.timestamp}`));
        }
        if (!result.type) {
            errors.push(new ValidationError('error', 'Submission type is missing!'));
            abort = true;
        } else {
            errors.push(new ValidationError('info', `Submission type is '${result.type}'`));
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
