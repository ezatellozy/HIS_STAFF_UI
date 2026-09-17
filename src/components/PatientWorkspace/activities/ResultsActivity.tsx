import React from 'react';
import { Patient } from '../../../types/his';
import { ResultsWorkspace } from '../results/ResultsWorkspace';

interface ResultsActivityProps {
  patient: Patient;
}

export const ResultsActivity: React.FC<ResultsActivityProps> = ({ patient }) => {
  return <ResultsWorkspace patient={patient} />;
};
