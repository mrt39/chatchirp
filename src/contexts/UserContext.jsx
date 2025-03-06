import { createContext } from 'react';

// context for user data and selected person in messaging
export const UserContext = createContext({
  selectedPerson: (null),
  currentUser: (null),
  setSelectedPerson: () => {},
});