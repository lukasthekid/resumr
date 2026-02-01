import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CoverLetterData,
  CoverLetterUser,
  CoverLetterJob,
} from '@/types/coverLetter';

/**
 * Cover Letter Store State
 */
interface CoverLetterState {
  coverLetterData: CoverLetterData | null;
  isInitialized: boolean;
}

/**
 * Cover Letter Store Actions
 */
interface CoverLetterActions {
  // Initialize/Load cover letter data
  setCoverLetterData: (data: CoverLetterData) => void;
  resetCoverLetterData: () => void;

  // User info updates
  updateUser: (field: keyof CoverLetterUser, value: string | null) => void;
  setUser: (user: CoverLetterUser) => void;

  // Job info updates
  updateJob: (field: keyof CoverLetterJob, value: string | number | null) => void;
  setJob: (job: CoverLetterJob) => void;

  // Date update
  setDate: (date: string) => void;

  // Body content update
  setBodyHtml: (html: string) => void;
}

/**
 * Combined Store Type
 */
type CoverLetterStore = CoverLetterState & CoverLetterActions;

/**
 * Cover Letter Store
 * 
 * A Zustand store for managing cover letter data throughout the application.
 * Provides granular update actions for each section of the cover letter.
 */
export const useCoverLetterStore = create<CoverLetterStore>()(
  devtools(
    (set) => ({
      // Initial State
      coverLetterData: null,
      isInitialized: false,

      // ============================================================
      // INITIALIZATION & RESET
      // ============================================================

      setCoverLetterData: (data: CoverLetterData) =>
        set(
          {
            coverLetterData: data,
            isInitialized: true,
          },
          false,
          'setCoverLetterData'
        ),

      resetCoverLetterData: () =>
        set(
          {
            coverLetterData: null,
            isInitialized: false,
          },
          false,
          'resetCoverLetterData'
        ),

      // ============================================================
      // USER INFO
      // ============================================================

      updateUser: (field: keyof CoverLetterUser, value: string | null) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                user: {
                  ...state.coverLetterData.user,
                  [field]: value,
                },
              },
            };
          },
          false,
          `updateUser/${field}`
        ),

      setUser: (user: CoverLetterUser) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                user,
              },
            };
          },
          false,
          'setUser'
        ),

      // ============================================================
      // JOB INFO
      // ============================================================

      updateJob: (field: keyof CoverLetterJob, value: string | number | null) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                job: {
                  ...state.coverLetterData.job,
                  [field]: value,
                },
              },
            };
          },
          false,
          `updateJob/${field}`
        ),

      setJob: (job: CoverLetterJob) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                job,
              },
            };
          },
          false,
          'setJob'
        ),

      // ============================================================
      // DATE
      // ============================================================

      setDate: (date: string) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                date,
              },
            };
          },
          false,
          'setDate'
        ),

      // ============================================================
      // BODY CONTENT
      // ============================================================

      setBodyHtml: (html: string) =>
        set(
          (state) => {
            if (!state.coverLetterData) return state;
            return {
              coverLetterData: {
                ...state.coverLetterData,
                bodyHtml: html,
              },
            };
          },
          false,
          'setBodyHtml'
        ),
    }),
    {
      name: 'cover-letter-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for common use cases
 */

// Get the entire cover letter data
export const useCoverLetterData = () =>
  useCoverLetterStore((state) => state.coverLetterData);

// Get initialization status
export const useIsCoverLetterInitialized = () =>
  useCoverLetterStore((state) => state.isInitialized);

// Get specific sections
export const useCoverLetterUser = () =>
  useCoverLetterStore((state) => state.coverLetterData?.user);

export const useCoverLetterJob = () =>
  useCoverLetterStore((state) => state.coverLetterData?.job);

export const useCoverLetterBodyHtml = () =>
  useCoverLetterStore((state) => state.coverLetterData?.bodyHtml);

// Get specific actions
export const useCoverLetterActions = () =>
  useCoverLetterStore((state) => ({
    setCoverLetterData: state.setCoverLetterData,
    resetCoverLetterData: state.resetCoverLetterData,
    updateUser: state.updateUser,
    updateJob: state.updateJob,
    setBodyHtml: state.setBodyHtml,
  }));
