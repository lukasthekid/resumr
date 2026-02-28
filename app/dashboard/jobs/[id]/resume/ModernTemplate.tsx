"use client";

import {
  AddListItemButton,
  AddSectionButton,
  EditableField,
  EditableListItem,
  EditableSectionItem,
  RichEditor,
} from '@/components/resume';
import { useResumeStore } from '@/store';
import { LinkIcon } from 'lucide-react';

/**
 * ModernTemplate - A professional 2-column resume layout
 * 
 * Layout:
 * - Left column (30%): Contact info, Skills, Education
 * - Right column (70%): Work Experience, Projects
 * 
 * Uses EditableField for simple strings and RichEditor for rich content
 */
export function ModernTemplate() {
  // Subscribe to store
  const personal = useResumeStore((state) => state.resumeData.personal);
  const education = useResumeStore((state) => state.resumeData.education);
  const workExperience = useResumeStore((state) => state.resumeData.workExperience);
  const projects = useResumeStore((state) => state.resumeData.projects);
  const skills = useResumeStore((state) => state.resumeData.skills);

  // Get actions
  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const updateEducationHighlight = useResumeStore((state) => state.updateEducationHighlight);
  const updateWorkExperience = useResumeStore((state) => state.updateWorkExperience);
  const updateWorkExperienceAchievement = useResumeStore(
    (state) => state.updateWorkExperienceAchievement
  );
  const updateProject = useResumeStore((state) => state.updateProject);
  const updateProjectDescription = useResumeStore((state) => state.updateProjectDescription);
  const addWorkExperienceAchievement = useResumeStore((state) => state.addWorkExperienceAchievement);
  const removeWorkExperienceAchievement = useResumeStore(
    (state) => state.removeWorkExperienceAchievement
  );
  const addEducationHighlight = useResumeStore((state) => state.addEducationHighlight);
  const removeEducationHighlight = useResumeStore((state) => state.removeEducationHighlight);
  const addProjectDescription = useResumeStore((state) => state.addProjectDescription);
  const removeProjectDescription = useResumeStore((state) => state.removeProjectDescription);
  const addWorkExperience = useResumeStore((state) => state.addWorkExperience);
  const removeWorkExperience = useResumeStore((state) => state.removeWorkExperience);
  const addEducation = useResumeStore((state) => state.addEducation);
  const removeEducation = useResumeStore((state) => state.removeEducation);
  const addProject = useResumeStore((state) => state.addProject);
  const removeProject = useResumeStore((state) => state.removeProject);

  // Helper function to format URLs for display
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  // Helper to create contact items with proper structure
  // Only show: email, phone, and ONE link (priority: LinkedIn > GitHub > Website)
  
  // Determine which link to show (priority order)
  const linkField = personal?.linkedin 
    ? { field: 'linkedin' as const, value: personal.linkedin, placeholder: 'linkedin.com/in/profile' }
    : personal?.github 
    ? { field: 'github' as const, value: personal.github, placeholder: 'github.com/username' }
    : personal?.website 
    ? { field: 'website' as const, value: personal.website, placeholder: 'yourwebsite.com' }
    : null;

  const contactItems = [
    // 1. Email (always show)
    {
      value: personal?.email,
      onChange: (value: string) => updatePersonal('email', value),
      placeholder: 'email@example.com',
      type: 'text' as const,
    },
    // 2. Phone (always show)
    {
      value: personal?.phone,
      onChange: (value: string) => updatePersonal('phone', value),
      placeholder: '+1 234 567 890',
      type: 'text' as const,
    },
    // 3. ONE link (LinkedIn OR GitHub OR Website - whichever is available first)
    ...(linkField
      ? [
          {
            value: linkField.value,
            onChange: (value: string) => updatePersonal(linkField.field, value),
            placeholder: linkField.placeholder,
            type: 'link' as const,
          },
        ]
      : []),
  ]

  return (
    <div className="h-full pt-2">
      {/* HEADER - Full Width, Compact & Centered */}
      <header className="mb-5 pb-3 border-b-2 border-gray-800 text-center">
        {/* Name - Large and Centered */}
        <div className="mb-2">
          <EditableField
            value={personal?.name}
            onChange={(value) => updatePersonal('name', value)}
            placeholder="YOUR NAME"
            className="text-4xl font-bold uppercase tracking-wide text-gray-900"
          />
        </div>

        {/* Contact Info - Full Width, Centered with Appropriate Field Widths */}
        <div className="w-full">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs">
            {contactItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-x-3">
                {item.type === 'link' ? (
                  <a
                    href={
                      item.value?.startsWith('http')
                        ? item.value
                        : item.value
                        ? `https://${item.value}`
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors w-64"
                    onClick={(e) => {
                      // Prevent navigation when editing
                      if (e.currentTarget.querySelector('input')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <EditableField
                      value={item.value}
                      onChange={item.onChange}
                      placeholder={item.placeholder}
                      className="text-xs text-blue-600"
                    />
                  </a>
                ) : (
                  <EditableField
                    value={item.value}
                    onChange={item.onChange}
                    placeholder={item.placeholder}
                    className={`text-xs text-gray-700`}
                  />
                )}
                {/* Separator - hide for last item */}
                {idx < contactItems.length - 1 && (
                  <span className="text-gray-400">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* TWO COLUMN LAYOUT - Stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
        {/* LEFT COLUMN - Contact & Skills */}
        <aside className="space-y-6">
          {/* EDUCATION */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-3 text-gray-900">
              Education
            </h2>
            <div className="space-y-4">
              {(education || []).map((edu, idx) => (
                <EditableSectionItem
                  key={idx}
                  onRemove={() => removeEducation(idx)}
                >
                  <div className="text-xs">
                    <EditableField
                      value={edu.institution}
                      onChange={(value) => updateEducation(idx, 'institution', value)}
                      placeholder="University Name"
                      className="font-bold text-xs text-gray-900 leading-tight"
                    />
                    <div className="flex items-center gap-1 text-gray-500 mt-0.5 w-32">
                      <EditableField
                        value={edu.startDate}
                        onChange={(value) => updateEducation(idx, 'startDate', value)}
                        placeholder="Start"
                        className="text-[10px]"
                      />
                      <span className="text-[10px]">–</span>
                      <EditableField
                        value={edu.endDate}
                        onChange={(value) => updateEducation(idx, 'endDate', value)}
                        placeholder="End"
                        className="text-[10px]"
                      />
                    </div>
                    <EditableField
                      value={edu.degree}
                      onChange={(value) => updateEducation(idx, 'degree', value)}
                      placeholder="Degree"
                      className="italic text-xs text-gray-700 leading-tight"
                      multiline
                    />
                    <ul className="mt-2 space-y-1.5">
                      {(edu.highlights || []).map((highlight, hIdx) => (
                        <EditableListItem
                          key={hIdx}
                          content={highlight}
                          onChange={(html) => updateEducationHighlight(idx, hIdx, html)}
                          onRemove={() => removeEducationHighlight(idx, hIdx)}
                          placeholder="Highlight..."
                        />
                      ))}
                      <AddListItemButton
                        onClick={() => addEducationHighlight(idx, '')}
                        label="highlight"
                      />
                    </ul>
                  </div>
                </EditableSectionItem>
              ))}
              <AddSectionButton onClick={() => addEducation()} label="education" />
            </div>
          </section>

          {/* SKILLS */}
          {skills && Object.keys(skills).length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-3 text-gray-900">
                Skills
              </h2>
              <div className="space-y-2 text-xs">
                {Object.entries(skills).map(([category, items]) => {
                  if (!items || items.length === 0) return null;

                  const formattedCategory = category
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();

                  return (
                    <div key={category}>
                      <span className="font-semibold text-gray-900">
                        {formattedCategory}:
                      </span>{' '}
                      <span className="text-gray-700">{items.join(', ')}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </aside>

        {/* RIGHT COLUMN - Experience & Projects */}
        <main className="space-y-6">
          {/* WORK EXPERIENCE */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-3 text-gray-900">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {(workExperience || []).map((exp, idx) => (
                <EditableSectionItem key={idx} onRemove={() => removeWorkExperience(idx)}>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex-1">
                        <EditableField
                          value={exp.title}
                          onChange={(value) => updateWorkExperience(idx, 'title', value)}
                          placeholder="Job Title"
                          className="font-bold text-sm text-gray-900"
                        />
                        <EditableField
                          value={exp.company}
                          onChange={(value) => updateWorkExperience(idx, 'company', value)}
                          placeholder="Company Name"
                          className="font-medium text-xs text-gray-700"
                        />
                      </div>
                      <div className="text-right text-xs text-gray-600 ml-4 w-32">
                        <EditableField
                          value={exp.location}
                          onChange={(value) => updateWorkExperience(idx, 'location', value)}
                          placeholder="Location"
                          className="text-xs text-right"
                        />
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <EditableField
                            value={exp.startDate}
                            onChange={(value) => updateWorkExperience(idx, 'startDate', value)}
                            placeholder="Start"
                            className="text-xs text-right"
                          />
                          <span>–</span>
                          <EditableField
                            value={exp.endDate}
                            onChange={(value) => updateWorkExperience(idx, 'endDate', value)}
                            placeholder="Present"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {(exp.achievements || []).map((achievement, aIdx) => (
                        <EditableListItem
                          key={aIdx}
                          content={achievement}
                          onChange={(html) =>
                            updateWorkExperienceAchievement(idx, aIdx, html)
                          }
                          onRemove={() => removeWorkExperienceAchievement(idx, aIdx)}
                          placeholder="Describe your achievement with impact and metrics..."
                        />
                      ))}
                      <AddListItemButton
                        onClick={() => addWorkExperienceAchievement(idx, '')}
                        label="achievement"
                      />
                    </ul>
                  </div>
                </EditableSectionItem>
              ))}
              <AddSectionButton onClick={() => addWorkExperience()} label="work experience" />
            </div>
          </section>

          {/* PROJECTS */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-3 text-gray-900">
              Projects
            </h2>
            <div className="space-y-4">
              {(projects || []).map((project, idx) => (
                <EditableSectionItem key={idx} onRemove={() => removeProject(idx)}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <EditableField
                          value={project.name}
                          onChange={(value) => updateProject(idx, 'name', value)}
                          placeholder="Project Name"
                          className="font-semibold text-sm text-gray-900"
                        />
                      </div>
                      <div className="text-right text-xs ml-4 w-32">
                        <EditableField
                          value={project.role}
                          onChange={(value) => updateProject(idx, 'role', value)}
                          placeholder="Role"
                          className="text-xs italic text-gray-600 text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <LinkIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <EditableField
                        value={project.url}
                        onChange={(value) => updateProject(idx, 'url', value)}
                        placeholder="project-url.com"
                        className="text-xs text-blue-600 underline decoration-blue-200"
                      />
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {(project.description || []).map((desc, dIdx) => (
                        <EditableListItem
                          key={dIdx}
                          content={desc}
                          onChange={(html) => updateProjectDescription(idx, dIdx, html)}
                          onRemove={() => removeProjectDescription(idx, dIdx)}
                          placeholder="Describe the project and your contributions..."
                        />
                      ))}
                      <AddListItemButton
                        onClick={() => addProjectDescription(idx, '')}
                        label="description"
                      />
                    </ul>
                  </div>
                </EditableSectionItem>
              ))}
              <AddSectionButton onClick={() => addProject()} label="project" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
