export interface EmergencyContact {
  label: string;
  tel: string;
  display: string;
}

/**
 * Institution-level config — update this single object to switch MindLine to a
 * different institution. Do NOT build multi-tenant routing or per-institution
 * auth; a single config object is sufficient for the pilot.
 */
export const INSTITUTION = {
  name: 'MUST',
  fullName: 'Mbarara University of Science and Technology',
  counsellingUnitLabel: 'MUST Counselling Unit',
  contacts: [
    { label: 'MUST Counselling Unit', tel: '+256787401865', display: '0787401865' },
    { label: 'Campus Emergency Line', tel: '+256787401865', display: '+256 0787401865' },
  ] as EmergencyContact[],
} as const;
