import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmergencyContact {
  label: string;
  tel: string;
  display: string;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  fullName: string;
  counsellingUnitLabel: string;
  staffEmailDomain: string;
  staffSampleEmail: string;
  contacts: EmergencyContact[];
  location: string;
}

export const INSTITUTION_PRESETS: Record<string, InstitutionInfo> = {
  MUST: {
    id: 'MUST',
    name: 'MUST',
    fullName: 'Mbarara University of Science and Technology',
    counsellingUnitLabel: 'MUST Counselling Unit',
    staffEmailDomain: 'must.ac.ug',
    staffSampleEmail: 'counselling@must.ac.ug',
    contacts: [
      { label: 'MUST Counselling Unit', tel: '+256787401865', display: '0787401865' },
      { label: 'Campus Emergency Line', tel: '+256787401865', display: '+256 0787401865' },
    ],
    location: 'Mbarara, Uganda',
  },
  MAK: {
    id: 'MAK',
    name: 'Makerere',
    fullName: 'Makerere University',
    counsellingUnitLabel: 'Makerere Guidance & Counselling Centre',
    staffEmailDomain: 'mak.ac.ug',
    staffSampleEmail: 'counselling@mak.ac.ug',
    contacts: [
      { label: 'MAK Counselling Centre', tel: '+256700000001', display: '0700 000 001' },
      { label: 'MAK Campus Security', tel: '+256700000002', display: '0700 000 002' },
    ],
    location: 'Kampala, Uganda',
  },
  KYU: {
    id: 'KYU',
    name: 'Kyambogo',
    fullName: 'Kyambogo University',
    counsellingUnitLabel: 'Kyambogo Counselling & Wellness Unit',
    staffEmailDomain: 'kyu.ac.ug',
    staffSampleEmail: 'counselling@kyu.ac.ug',
    contacts: [
      { label: 'KYU Counselling Line', tel: '+256700000003', display: '0700 000 003' },
      { label: 'KYU Emergency Desk', tel: '+256700000004', display: '0700 000 004' },
    ],
    location: 'Banda, Kampala',
  },
  UCU: {
    id: 'UCU',
    name: 'UCU',
    fullName: 'Uganda Christian University',
    counsellingUnitLabel: 'UCU Mentorship & Counselling Center',
    staffEmailDomain: 'ucu.ac.ug',
    staffSampleEmail: 'counselling@ucu.ac.ug',
    contacts: [
      { label: 'UCU Mentorship & Support', tel: '+256700000005', display: '0700 000 005' },
      { label: 'UCU Campus Clinic', tel: '+256700000006', display: '0700 000 006' },
    ],
    location: 'Mukono, Uganda',
  },
  GULU: {
    id: 'GULU',
    name: 'Gulu',
    fullName: 'Gulu University',
    counsellingUnitLabel: 'Gulu University Student Support Unit',
    staffEmailDomain: 'gu.ac.ug',
    staffSampleEmail: 'counselling@gu.ac.ug',
    contacts: [
      { label: 'Gulu Student Support', tel: '+256700000007', display: '0700 000 007' },
      { label: 'Gulu Emergency Desk', tel: '+256700000008', display: '0700 000 008' },
    ],
    location: 'Gulu, Uganda',
  },
};

interface InstitutionState {
  currentId: string;
  hasSelectedCampus: boolean;
  setInstitution: (id: string) => void;
  markCampusSelected: () => void;
  getCurrentInstitution: () => InstitutionInfo;
}

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set, get) => ({
      currentId: 'MUST',
      hasSelectedCampus: false,
      setInstitution: (id: string) => {
        if (INSTITUTION_PRESETS[id]) {
          set({ currentId: id, hasSelectedCampus: true });
        }
      },
      markCampusSelected: () => set({ hasSelectedCampus: true }),
      getCurrentInstitution: () => {
        const id = get().currentId;
        return INSTITUTION_PRESETS[id] || INSTITUTION_PRESETS.MUST;
      },
    }),
    {
      name: 'mindline_institution',
    }
  )
);
