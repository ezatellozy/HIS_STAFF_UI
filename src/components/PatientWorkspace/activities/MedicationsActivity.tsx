import React from 'react';
import { Patient } from '../../../types/his';
import { MedicationsWorkspace } from '../medications/MedicationsWorkspace';

interface MedicationsActivityProps {
  patient: Patient;
}

export const MedicationsActivity: React.FC<MedicationsActivityProps> = ({ patient }) => {
  return <MedicationsWorkspace patient={patient} />;
};
