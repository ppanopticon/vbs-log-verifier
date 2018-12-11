import {EventCategory} from './event-category.model';
import {SubmittedEvent} from './event.model';

export interface AtomicEvent extends SubmittedEvent {
    category: EventCategory;
    type: string;
    value?: string;
    attributes?: string;
}

