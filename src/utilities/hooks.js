import { useState, useEffect } from 'react';

//hook to manage message interactions 
export function useMessaging() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [messagesBetween, setMessagesBetween] = useState({});
  const [loading, setLoading] = useState(true);

  return {
    selectedPerson,
    setSelectedPerson,
    messagesBetween,
    setMessagesBetween,
    loading
  };
}