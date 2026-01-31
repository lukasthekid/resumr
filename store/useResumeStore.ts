import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ResumeData,
  ResumePersonalInfo,
  ResumeEducation,
  ResumeWorkExperience,
  ResumeProject,
  ResumeSkills,
  ResumeExtracurricular,
} from '@/types/resume';

/**
 * Resume Store State
 */
interface ResumeState {
  resumeData: ResumeData;
  isInitialized: boolean;
}

/**
 * Resume Store Actions
 */
interface ResumeActions {
  // Initialize/Load resume data
  setResumeData: (data: ResumeData) => void;
  resetResumeData: () => void;

  // Personal info updates
  updatePersonal: (field: keyof ResumePersonalInfo, value: string) => void;
  setPersonal: (personal: ResumePersonalInfo) => void;

  // Work experience updates
  updateWorkExperience: (
    index: number,
    field: keyof ResumeWorkExperience,
    value: string | string[]
  ) => void;
  addWorkExperience: (experience?: ResumeWorkExperience) => void;
  removeWorkExperience: (index: number) => void;
  updateWorkExperienceAchievement: (
    experienceIndex: number,
    achievementIndex: number,
    value: string
  ) => void;
  addWorkExperienceAchievement: (experienceIndex: number, achievement: string) => void;
  removeWorkExperienceAchievement: (experienceIndex: number, achievementIndex: number) => void;

  // Education updates
  updateEducation: (
    index: number,
    field: keyof ResumeEducation,
    value: string | string[]
  ) => void;
  addEducation: (education?: ResumeEducation) => void;
  removeEducation: (index: number) => void;
  updateEducationHighlight: (
    educationIndex: number,
    highlightIndex: number,
    value: string
  ) => void;
  addEducationHighlight: (educationIndex: number, highlight: string) => void;
  removeEducationHighlight: (educationIndex: number, highlightIndex: number) => void;

  // Projects updates
  updateProject: (
    index: number,
    field: keyof ResumeProject,
    value: string | string[]
  ) => void;
  addProject: (project?: ResumeProject) => void;
  removeProject: (index: number) => void;
  updateProjectDescription: (
    projectIndex: number,
    descriptionIndex: number,
    value: string
  ) => void;
  addProjectDescription: (projectIndex: number, description: string) => void;
  removeProjectDescription: (projectIndex: number, descriptionIndex: number) => void;

  // Skills updates
  updateSkills: (category: string, value: string[]) => void;
  addSkillCategory: (category: string, skills: string[]) => void;
  removeSkillCategory: (category: string) => void;
  setSkills: (skills: ResumeSkills) => void;

  // Extracurriculars updates
  updateExtracurricular: (
    index: number,
    field: keyof ResumeExtracurricular,
    value: string | string[]
  ) => void;
  addExtracurricular: (extracurricular?: ResumeExtracurricular) => void;
  removeExtracurricular: (index: number) => void;
  updateExtracurricularDescription: (
    extracurricularIndex: number,
    descriptionIndex: number,
    value: string
  ) => void;
  addExtracurricularDescription: (extracurricularIndex: number, description: string) => void;
  removeExtracurricularDescription: (extracurricularIndex: number, descriptionIndex: number) => void;
}

/**
 * Combined Store Type
 */
type ResumeStore = ResumeState & ResumeActions;

/**
 * Initial empty resume data
 */
const initialResumeData: ResumeData = {
  personal: {
    name: '',
    location: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    website: '',
  },
  education: [],
  workExperience: [],
  projects: [],
  skills: {
    programmingLanguages: [],
    technologies: [],
    tools: [],
  },
  extracurriculars: [],
};

/**
 * Resume Store
 * 
 * A Zustand store for managing resume data throughout the application.
 * Provides granular update actions for each section of the resume.
 */
export const useResumeStore = create<ResumeStore>()(
  devtools(
    (set) => ({
      // Initial State
      resumeData: initialResumeData,
      isInitialized: false,

      // ============================================================
      // INITIALIZATION & RESET
      // ============================================================

      setResumeData: (data: ResumeData) =>
        set(
          {
            resumeData: data,
            isInitialized: true,
          },
          false,
          'setResumeData'
        ),

      resetResumeData: () =>
        set(
          {
            resumeData: initialResumeData,
            isInitialized: false,
          },
          false,
          'resetResumeData'
        ),

      // ============================================================
      // PERSONAL INFO
      // ============================================================

      updatePersonal: (field: keyof ResumePersonalInfo, value: string) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              personal: {
                ...state.resumeData.personal,
                [field]: value,
              },
            },
          }),
          false,
          `updatePersonal/${field}`
        ),

      setPersonal: (personal: ResumePersonalInfo) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              personal,
            },
          }),
          false,
          'setPersonal'
        ),

      // ============================================================
      // WORK EXPERIENCE
      // ============================================================

      updateWorkExperience: (
        index: number,
        field: keyof ResumeWorkExperience,
        value: string | string[]
      ) =>
        set(
          (state) => {
            const workExperience = [...(state.resumeData.workExperience || [])];
            if (workExperience[index]) {
              workExperience[index] = {
                ...workExperience[index],
                [field]: value,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                workExperience,
              },
            };
          },
          false,
          `updateWorkExperience/${index}/${field}`
        ),

      addWorkExperience: (experience?: ResumeWorkExperience) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              workExperience: [
                ...(state.resumeData.workExperience || []),
                experience || {
                  title: '',
                  company: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  achievements: [],
                },
              ],
            },
          }),
          false,
          'addWorkExperience'
        ),

      removeWorkExperience: (index: number) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              workExperience: state.resumeData.workExperience?.filter((_, i) => i !== index),
            },
          }),
          false,
          `removeWorkExperience/${index}`
        ),

      updateWorkExperienceAchievement: (
        experienceIndex: number,
        achievementIndex: number,
        value: string
      ) =>
        set(
          (state) => {
            const workExperience = [...(state.resumeData.workExperience || [])];
            if (workExperience[experienceIndex]) {
              const achievements = [...(workExperience[experienceIndex].achievements || [])];
              achievements[achievementIndex] = value;
              workExperience[experienceIndex] = {
                ...workExperience[experienceIndex],
                achievements,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                workExperience,
              },
            };
          },
          false,
          `updateWorkExperienceAchievement/${experienceIndex}/${achievementIndex}`
        ),

      addWorkExperienceAchievement: (experienceIndex: number, achievement: string) =>
        set(
          (state) => {
            const workExperience = [...(state.resumeData.workExperience || [])];
            if (workExperience[experienceIndex]) {
              workExperience[experienceIndex] = {
                ...workExperience[experienceIndex],
                achievements: [
                  ...(workExperience[experienceIndex].achievements || []),
                  achievement,
                ],
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                workExperience,
              },
            };
          },
          false,
          `addWorkExperienceAchievement/${experienceIndex}`
        ),

      removeWorkExperienceAchievement: (experienceIndex: number, achievementIndex: number) =>
        set(
          (state) => {
            const workExperience = [...(state.resumeData.workExperience || [])];
            if (workExperience[experienceIndex]) {
              workExperience[experienceIndex] = {
                ...workExperience[experienceIndex],
                achievements: workExperience[experienceIndex].achievements?.filter(
                  (_, i) => i !== achievementIndex
                ),
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                workExperience,
              },
            };
          },
          false,
          `removeWorkExperienceAchievement/${experienceIndex}/${achievementIndex}`
        ),

      // ============================================================
      // EDUCATION
      // ============================================================

      updateEducation: (index: number, field: keyof ResumeEducation, value: string | string[]) =>
        set(
          (state) => {
            const education = [...(state.resumeData.education || [])];
            if (education[index]) {
              education[index] = {
                ...education[index],
                [field]: value,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                education,
              },
            };
          },
          false,
          `updateEducation/${index}/${field}`
        ),

      addEducation: (education?: ResumeEducation) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              education: [
                ...(state.resumeData.education || []),
                education || {
                  institution: '',
                  location: '',
                  degree: '',
                  startDate: '',
                  endDate: '',
                  highlights: [],
                },
              ],
            },
          }),
          false,
          'addEducation'
        ),

      removeEducation: (index: number) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              education: state.resumeData.education?.filter((_, i) => i !== index),
            },
          }),
          false,
          `removeEducation/${index}`
        ),

      updateEducationHighlight: (educationIndex: number, highlightIndex: number, value: string) =>
        set(
          (state) => {
            const education = [...(state.resumeData.education || [])];
            if (education[educationIndex]) {
              const highlights = [...(education[educationIndex].highlights || [])];
              highlights[highlightIndex] = value;
              education[educationIndex] = {
                ...education[educationIndex],
                highlights,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                education,
              },
            };
          },
          false,
          `updateEducationHighlight/${educationIndex}/${highlightIndex}`
        ),

      addEducationHighlight: (educationIndex: number, highlight: string) =>
        set(
          (state) => {
            const education = [...(state.resumeData.education || [])];
            if (education[educationIndex]) {
              education[educationIndex] = {
                ...education[educationIndex],
                highlights: [...(education[educationIndex].highlights || []), highlight],
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                education,
              },
            };
          },
          false,
          `addEducationHighlight/${educationIndex}`
        ),

      removeEducationHighlight: (educationIndex: number, highlightIndex: number) =>
        set(
          (state) => {
            const education = [...(state.resumeData.education || [])];
            if (education[educationIndex]) {
              education[educationIndex] = {
                ...education[educationIndex],
                highlights: education[educationIndex].highlights?.filter(
                  (_, i) => i !== highlightIndex
                ),
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                education,
              },
            };
          },
          false,
          `removeEducationHighlight/${educationIndex}/${highlightIndex}`
        ),

      // ============================================================
      // PROJECTS
      // ============================================================

      updateProject: (index: number, field: keyof ResumeProject, value: string | string[]) =>
        set(
          (state) => {
            const projects = [...(state.resumeData.projects || [])];
            if (projects[index]) {
              projects[index] = {
                ...projects[index],
                [field]: value,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                projects,
              },
            };
          },
          false,
          `updateProject/${index}/${field}`
        ),

      addProject: (project?: ResumeProject) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              projects: [
                ...(state.resumeData.projects || []),
                project || {
                  name: '',
                  role: '',
                  startDate: '',
                  endDate: '',
                  url: '',
                  description: [],
                },
              ],
            },
          }),
          false,
          'addProject'
        ),

      removeProject: (index: number) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              projects: state.resumeData.projects?.filter((_, i) => i !== index),
            },
          }),
          false,
          `removeProject/${index}`
        ),

      updateProjectDescription: (projectIndex: number, descriptionIndex: number, value: string) =>
        set(
          (state) => {
            const projects = [...(state.resumeData.projects || [])];
            if (projects[projectIndex]) {
              const description = [...(projects[projectIndex].description || [])];
              description[descriptionIndex] = value;
              projects[projectIndex] = {
                ...projects[projectIndex],
                description,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                projects,
              },
            };
          },
          false,
          `updateProjectDescription/${projectIndex}/${descriptionIndex}`
        ),

      addProjectDescription: (projectIndex: number, description: string) =>
        set(
          (state) => {
            const projects = [...(state.resumeData.projects || [])];
            if (projects[projectIndex]) {
              projects[projectIndex] = {
                ...projects[projectIndex],
                description: [...(projects[projectIndex].description || []), description],
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                projects,
              },
            };
          },
          false,
          `addProjectDescription/${projectIndex}`
        ),

      removeProjectDescription: (projectIndex: number, descriptionIndex: number) =>
        set(
          (state) => {
            const projects = [...(state.resumeData.projects || [])];
            if (projects[projectIndex]) {
              projects[projectIndex] = {
                ...projects[projectIndex],
                description: projects[projectIndex].description?.filter(
                  (_, i) => i !== descriptionIndex
                ),
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                projects,
              },
            };
          },
          false,
          `removeProjectDescription/${projectIndex}/${descriptionIndex}`
        ),

      // ============================================================
      // SKILLS
      // ============================================================

      updateSkills: (category: string, value: string[]) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              skills: {
                ...state.resumeData.skills,
                [category]: value,
              },
            },
          }),
          false,
          `updateSkills/${category}`
        ),

      addSkillCategory: (category: string, skills: string[]) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              skills: {
                ...state.resumeData.skills,
                [category]: skills,
              },
            },
          }),
          false,
          `addSkillCategory/${category}`
        ),

      removeSkillCategory: (category: string) =>
        set(
          (state) => {
            const { [category]: _, ...remainingSkills } = state.resumeData.skills || {};
            return {
              resumeData: {
                ...state.resumeData,
                skills: remainingSkills,
              },
            };
          },
          false,
          `removeSkillCategory/${category}`
        ),

      setSkills: (skills: ResumeSkills) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              skills,
            },
          }),
          false,
          'setSkills'
        ),

      // ============================================================
      // EXTRACURRICULARS
      // ============================================================

      updateExtracurricular: (
        index: number,
        field: keyof ResumeExtracurricular,
        value: string | string[]
      ) =>
        set(
          (state) => {
            const extracurriculars = [...(state.resumeData.extracurriculars || [])];
            if (extracurriculars[index]) {
              extracurriculars[index] = {
                ...extracurriculars[index],
                [field]: value,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                extracurriculars,
              },
            };
          },
          false,
          `updateExtracurricular/${index}/${field}`
        ),

      addExtracurricular: (extracurricular?: ResumeExtracurricular) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              extracurriculars: [
                ...(state.resumeData.extracurriculars || []),
                extracurricular || {
                  activity: '',
                  startDate: '',
                  endDate: '',
                  description: [],
                },
              ],
            },
          }),
          false,
          'addExtracurricular'
        ),

      removeExtracurricular: (index: number) =>
        set(
          (state) => ({
            resumeData: {
              ...state.resumeData,
              extracurriculars: state.resumeData.extracurriculars?.filter((_, i) => i !== index),
            },
          }),
          false,
          `removeExtracurricular/${index}`
        ),

      updateExtracurricularDescription: (
        extracurricularIndex: number,
        descriptionIndex: number,
        value: string
      ) =>
        set(
          (state) => {
            const extracurriculars = [...(state.resumeData.extracurriculars || [])];
            if (extracurriculars[extracurricularIndex]) {
              const description = [...(extracurriculars[extracurricularIndex].description || [])];
              description[descriptionIndex] = value;
              extracurriculars[extracurricularIndex] = {
                ...extracurriculars[extracurricularIndex],
                description,
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                extracurriculars,
              },
            };
          },
          false,
          `updateExtracurricularDescription/${extracurricularIndex}/${descriptionIndex}`
        ),

      addExtracurricularDescription: (extracurricularIndex: number, description: string) =>
        set(
          (state) => {
            const extracurriculars = [...(state.resumeData.extracurriculars || [])];
            if (extracurriculars[extracurricularIndex]) {
              extracurriculars[extracurricularIndex] = {
                ...extracurriculars[extracurricularIndex],
                description: [
                  ...(extracurriculars[extracurricularIndex].description || []),
                  description,
                ],
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                extracurriculars,
              },
            };
          },
          false,
          `addExtracurricularDescription/${extracurricularIndex}`
        ),

      removeExtracurricularDescription: (
        extracurricularIndex: number,
        descriptionIndex: number
      ) =>
        set(
          (state) => {
            const extracurriculars = [...(state.resumeData.extracurriculars || [])];
            if (extracurriculars[extracurricularIndex]) {
              extracurriculars[extracurricularIndex] = {
                ...extracurriculars[extracurricularIndex],
                description: extracurriculars[extracurricularIndex].description?.filter(
                  (_, i) => i !== descriptionIndex
                ),
              };
            }
            return {
              resumeData: {
                ...state.resumeData,
                extracurriculars,
              },
            };
          },
          false,
          `removeExtracurricularDescription/${extracurricularIndex}/${descriptionIndex}`
        ),
    }),
    {
      name: 'resume-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for common use cases
 */

// Get the entire resume data
export const useResumeData = () => useResumeStore((state) => state.resumeData);

// Get initialization status
export const useIsResumeInitialized = () => useResumeStore((state) => state.isInitialized);

// Get specific sections
export const usePersonalInfo = () => useResumeStore((state) => state.resumeData.personal);
export const useWorkExperience = () => useResumeStore((state) => state.resumeData.workExperience);
export const useEducation = () => useResumeStore((state) => state.resumeData.education);
export const useProjects = () => useResumeStore((state) => state.resumeData.projects);
export const useSkills = () => useResumeStore((state) => state.resumeData.skills);
export const useExtracurriculars = () => useResumeStore((state) => state.resumeData.extracurriculars);

// Get specific actions
export const useResumeActions = () =>
  useResumeStore((state) => ({
    setResumeData: state.setResumeData,
    resetResumeData: state.resetResumeData,
    updatePersonal: state.updatePersonal,
    updateWorkExperience: state.updateWorkExperience,
    updateEducation: state.updateEducation,
    updateSkills: state.updateSkills,
  }));
