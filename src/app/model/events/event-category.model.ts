export type EventCategory = 'text' | 'image' | 'sketch' | 'filter' | 'browsing' | 'cooperation';

export const EventCategories: EventCategory[] = ['text', 'image', 'sketch', 'filter', 'browsing', 'cooperation'];


/* */
export const CategoryTypeMap = new Map<EventCategory, string[]>();
CategoryTypeMap.set('text', ['metadata', 'ocr', 'asr', 'concept', 'localizedobject', 'caption']);
CategoryTypeMap.set('image', ['globalfeatures', 'localfeatures', 'feedbackmodel']);
CategoryTypeMap.set('sketch', ['color', 'edge', 'motion', 'semanticsegmentation']);
CategoryTypeMap.set('filter', ['b/w', 'dominantcolor', 'resolution']);
CategoryTypeMap.set('browsing', ['rankedlist', 'videosummary', 'temporalcontext', 'videoplayer', 'exploration', 'toollayout', 'explicitsort', 'resetall']);
CategoryTypeMap.set('cooperation', []);