import { useInstitutionStore, INSTITUTION_PRESETS, type EmergencyContact } from '../stores/institutionStore';

export type { EmergencyContact };

/**
 * Hook to get the active institution with automatic component re-rendering
 * when the campus is switched anywhere in the app.
 */
export function useCurrentInstitution() {
  const currentId = useInstitutionStore((s) => s.currentId);
  return INSTITUTION_PRESETS[currentId] || INSTITUTION_PRESETS.MUST;
}

/**
 * Dynamic INSTITUTION object. Reads the active institution from useInstitutionStore
 * so existing call sites throughout the app dynamically reflect the chosen campus.
 */
export const INSTITUTION = {
  get name() {
    return useInstitutionStore.getState().getCurrentInstitution().name;
  },
  get fullName() {
    return useInstitutionStore.getState().getCurrentInstitution().fullName;
  },
  get counsellingUnitLabel() {
    return useInstitutionStore.getState().getCurrentInstitution().counsellingUnitLabel;
  },
  get contacts() {
    return useInstitutionStore.getState().getCurrentInstitution().contacts;
  },
  get staffEmailDomain() {
    return useInstitutionStore.getState().getCurrentInstitution().staffEmailDomain;
  },
  get staffSampleEmail() {
    return useInstitutionStore.getState().getCurrentInstitution().staffSampleEmail;
  },
};
