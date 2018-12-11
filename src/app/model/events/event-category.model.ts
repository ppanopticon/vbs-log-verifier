export type EventCategory = 'Text' | 'Image' | 'Sketch' | 'Filter' | 'Browsing' | 'Cooperation';

export const EventCategories: EventCategory[] = ['Text', 'Image', 'Sketch', 'Filter', 'Browsing', 'Cooperation'];

export const CategoryTypeMap = {
    'Text' : ['metadata', 'OCR', 'ASR', 'concept', 'localizedObject', 'caption'],
    'Image' : ['globalFeatures', 'localFeatures', 'feedbackModel'],
    'Sketch' : ['color', 'edge', 'motion', 'semanticSegmentation'],
    'Filter' : ['b/w', 'dominantColor', 'resolution'],
    'Browsing' : ['rankedList', 'videoSummary', 'temporalContext', 'videoPlayer', 'exploration', 'toolLayout', 'explicitSort', 'resetAll'],
    'Cooperation' : []
};
