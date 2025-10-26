// Mock engineer data for assignment
export const ENGINEER_TYPES = {
  L1: 'L1 Engineer',
  NOC: 'NOC Engineer',
  FIELD: 'Field Engineer',
};

export const mockEngineers = [
  { id: 'ENG001', name: 'Alice Johnson', type: ENGINEER_TYPES.L1 },
  { id: 'ENG002', name: 'Bob Smith', type: ENGINEER_TYPES.NOC },
  { id: 'ENG003', name: 'Charlie Brown', type: ENGINEER_TYPES.L1 },
  { id: 'ENG004', name: 'Diana Prince', type: ENGINEER_TYPES.FIELD },
  { id: 'ENG005', name: 'Edward Norton', type: ENGINEER_TYPES.NOC },
  { id: 'ENG006', name: 'Fiona Green', type: ENGINEER_TYPES.FIELD },
  { id: 'ENG007', name: 'George Wilson', type: ENGINEER_TYPES.L1 },
  { id: 'ENG008', name: 'Hannah Lee', type: ENGINEER_TYPES.FIELD },
];

export const getEngineerById = (id) => {
  return mockEngineers.find(engineer => engineer.id === id);
};

export const getEngineersByType = (type) => {
  return mockEngineers.filter(engineer => engineer.type === type);
};

export const searchEngineers = (query) => {
  if (!query) return mockEngineers;
  const lowercaseQuery = query.toLowerCase();
  return mockEngineers.filter(engineer => 
    engineer.name.toLowerCase().includes(lowercaseQuery) ||
    engineer.id.toLowerCase().includes(lowercaseQuery) ||
    engineer.type.toLowerCase().includes(lowercaseQuery)
  );
};
