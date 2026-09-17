import { Patient, Appointment, ConsultationRecord, LabOrder, PrescriptionItem } from '../types/his';

/**
 * Generates an HL7 FHIR Release 4 (R4) compliant JSON Bundle
 * for the selected Patient and Clinical Encounter.
 */
export function generateFhirR4Bundle(
  patient: Patient,
  appointment?: Appointment,
  consultation?: ConsultationRecord,
  labOrders: LabOrder[] = []
): any {
  const timestamp = new Date().toISOString();
  const entries: any[] = [];

  // 1. FHIR Patient Resource
  const patientResource = {
    resourceType: 'Patient',
    id: patient.id,
    meta: {
      versionId: '1',
      lastUpdated: timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
    },
    identifier: [
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical Record Number'
            }
          ]
        },
        system: 'urn:careglobal:hospital:mrn',
        value: patient.mrn
      },
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NNxxx',
              display: 'National Identification Number'
            }
          ]
        },
        system: 'urn:iso:std:iso:3166',
        value: patient.nationalId
      }
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: patient.fullNameAr,
        family: patient.fullNameAr.split(' ').slice(-1)[0] || '',
        given: patient.fullNameAr.split(' ').slice(0, -1)
      },
      {
        use: 'usual',
        text: patient.fullNameEn,
        family: patient.fullNameEn.split(' ').slice(-1)[0] || '',
        given: patient.fullNameEn.split(' ').slice(0, -1)
      }
    ],
    telecom: [
      {
        system: 'phone',
        value: patient.phone,
        use: 'mobile'
      },
      {
        system: 'email',
        value: patient.email,
        use: 'home'
      }
    ],
    gender: patient.gender === 'male' ? 'male' : 'female',
    birthDate: patient.dob,
    address: [
      {
        use: 'home',
        text: patient.address,
        city: 'الرياض / القاهرة',
        country: 'SA'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'C',
                display: patient.emergencyContact.relation
              }
            ]
          }
        ],
        name: {
          text: patient.emergencyContact.name
        },
        telecom: [
          {
            system: 'phone',
            value: patient.emergencyContact.phone
          }
        ]
      }
    ]
  };

  entries.push({
    fullUrl: `urn:uuid:${patient.id}`,
    resource: patientResource
  });

  // 2. FHIR Coverage Resource (Insurance)
  const coverageResource = {
    resourceType: 'Coverage',
    id: `cov-${patient.id}`,
    status: 'active',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'HIP',
          display: 'health insurance plan'
        }
      ],
      text: patient.insuranceProvider
    },
    subscriberId: patient.insurancePolicyNo,
    beneficiary: {
      reference: `Patient/${patient.id}`,
      display: patient.fullNameEn
    },
    class: [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/coverage-class',
              code: 'plan'
            }
          ]
        },
        value: patient.insuranceClass,
        name: `Coverage ${patient.insuranceCoveragePercent}%`
      }
    ]
  };

  entries.push({
    fullUrl: `urn:uuid:cov-${patient.id}`,
    resource: coverageResource
  });

  // 3. FHIR Appointment Resource (Booking & Check-in Tracking)
  if (appointment) {
    const appointmentResource = {
      resourceType: 'Appointment',
      id: `apt-${appointment.id}`,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Appointment']
      },
      identifier: [
        {
          system: 'urn:careglobal:hospital:ticket',
          value: appointment.ticketNo
        }
      ],
      status:
        appointment.status === 'completed'
          ? 'fulfilled'
          : appointment.status === 'checked_in' ||
            appointment.status === 'triage_pending' ||
            appointment.status === 'triage_completed' ||
            appointment.status === 'with_doctor'
          ? 'arrived'
          : 'booked',
      participant: [
        {
          actor: {
            reference: `Patient/${patient.id}`,
            display: patient.fullNameEn
          },
          status: 'accepted'
        }
      ],
      start: appointment.appointmentTime,
      description: appointment.chiefComplaint
    };

    entries.push({
      fullUrl: `urn:uuid:apt-${appointment.id}`,
      resource: appointmentResource
    });

    // 4. FHIR Encounter Resource (Clinical Visit Lifecycle: planned -> arrived -> triaged -> in-progress -> finished)
    const encounterResource = {
      resourceType: 'Encounter',
      id: appointment.id,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Encounter']
      },
      identifier: [
        {
          system: 'urn:careglobal:hospital:ticket',
          value: appointment.ticketNo
        }
      ],
      status:
        appointment.status === 'completed'
          ? 'finished'
          : appointment.status === 'with_doctor'
          ? 'in-progress'
          : appointment.status === 'triage_completed' || appointment.status === 'triage_pending'
          ? 'triaged'
          : appointment.status === 'checked_in'
          ? 'arrived'
          : 'planned',
      appointment: [
        {
          reference: `Appointment/apt-${appointment.id}`
        }
      ],
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'Ambulatory / Outpatient Clinic'
      },
      subject: {
        reference: `Patient/${patient.id}`,
        display: patient.fullNameEn
      },
      reasonCode: [
        {
          text: appointment.chiefComplaint
        }
      ],
      period: {
        start: appointment.consultationStartedAt || appointment.appointmentTime,
        end: appointment.consultationEndedAt
      }
    };

    entries.push({
      fullUrl: `urn:uuid:${appointment.id}`,
      resource: encounterResource
    });

    // 4. FHIR Observations (Vital Signs with LOINC standard codes)
    if (appointment.vitals) {
      const v = appointment.vitals;

      const vitalObservations = [
        {
          loinc: '8480-6',
          display: 'Systolic blood pressure',
          value: v.bpSystolic,
          unit: 'mmHg',
          unitCode: 'mm[Hg]'
        },
        {
          loinc: '8462-4',
          display: 'Diastolic blood pressure',
          value: v.bpDiastolic,
          unit: 'mmHg',
          unitCode: 'mm[Hg]'
        },
        {
          loinc: '8867-4',
          display: 'Heart rate',
          value: v.pulseRate,
          unit: 'beats/minute',
          unitCode: '/min'
        },
        {
          loinc: '8310-5',
          display: 'Body temperature',
          value: v.temp,
          unit: 'degrees C',
          unitCode: 'Cel'
        },
        {
          loinc: '9279-1',
          display: 'Respiratory rate',
          value: v.respiratoryRate,
          unit: 'breaths/minute',
          unitCode: '/min'
        },
        {
          loinc: '2708-6',
          display: 'Oxygen saturation in Arterial blood by Pulse oximetry',
          value: v.spo2,
          unit: '%',
          unitCode: '%'
        }
      ];

      vitalObservations.forEach(obs => {
        entries.push({
          fullUrl: `urn:uuid:obs-${appointment.id}-${obs.loinc}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-${appointment.id}-${obs.loinc}`,
            status: 'final',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: obs.loinc,
                  display: obs.display
                }
              ],
              text: obs.display
            },
            subject: {
              reference: `Patient/${patient.id}`
            },
            encounter: {
              reference: `Encounter/${appointment.id}`
            },
            effectiveDateTime: v.recordedAt,
            valueQuantity: {
              value: obs.value,
              unit: obs.unit,
              system: 'http://unitsofmeasure.org',
              code: obs.unitCode
            }
          }
        });
      });
    }
  }

  // 5. FHIR Condition Resources (ICD-10-CM Diagnoses)
  if (consultation && consultation.icd10Codes) {
    consultation.icd10Codes.forEach((icd, idx) => {
      entries.push({
        fullUrl: `urn:uuid:cond-${consultation.id}-${idx}`,
        resource: {
          resourceType: 'Condition',
          id: `cond-${consultation.id}-${idx}`,
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed',
                display: 'Confirmed'
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'encounter-diagnosis',
                  display: 'Encounter Diagnosis'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: icd.code,
                display: icd.titleEn
              }
            ],
            text: icd.titleAr
          },
          subject: {
            reference: `Patient/${patient.id}`
          },
          recordedDate: consultation.createdAt
        }
      });
    });
  }

  // 6. FHIR MedicationRequest Resources (Prescriptions)
  if (consultation && consultation.prescriptions) {
    consultation.prescriptions.forEach(rx => {
      entries.push({
        fullUrl: `urn:uuid:medrx-${rx.id}`,
        resource: {
          resourceType: 'MedicationRequest',
          id: rx.id,
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: 'RXNORM-CODE',
                display: rx.genericName
              }
            ],
            text: rx.drugName
          },
          subject: {
            reference: `Patient/${patient.id}`
          },
          dosageInstruction: [
            {
              text: `${rx.dose} - ${rx.frequency} لمدة ${rx.duration}`,
              route: {
                text: rx.route
              },
              patientInstruction: rx.instructions
            }
          ]
        }
      });
    });
  }

  return {
    resourceType: 'Bundle',
    id: `bundle-his-${patient.id}-${Date.now()}`,
    meta: {
      lastUpdated: timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle']
    },
    type: 'document',
    timestamp: timestamp,
    total: entries.length,
    entry: entries
  };
}
