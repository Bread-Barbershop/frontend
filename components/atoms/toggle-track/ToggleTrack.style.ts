export const TOGGLE_TRACK = {
  width: 72,
  height: 28,
  knobSize: 24,
  knobTravel: 44,
  knobShadow: [
    '1px 2px 3px rgba(0, 0, 0, 0.24)',
    'inset -1.5px -1.5px 0.5px -1px rgba(255, 255, 255, 1)',
    'inset 1.5px 1.5px 0.5px -1px rgba(255, 255, 255, 1)',
  ].join(', '),
  on: {
    borderColor: '#AACCFF',
    backgroundColor: '#F6FAFF',
    knobColor: '#E2EFFF',
    labelColor: '#1F72EF',
    shadow: 'inset 3px 2px 4px rgba(2, 43, 105, 0.32)',
  },
  off: {
    borderColor: '#FFC8C8',
    backgroundColor: '#FFFBFB',
    knobColor: '#FFDFDF',
    labelColor: '#FF5C5C',
    shadow: 'inset 3px 2px 4px rgba(2, 43, 105, 0)',
  },
};
