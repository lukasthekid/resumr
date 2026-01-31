/**
 * Example Usage of A4Page and EditableField Components
 * 
 * This file demonstrates how to use the resume UI components
 * Copy patterns from here into your actual resume builder pages
 */

"use client";

import { A4Page, EditableField } from '@/components/resume';
import { useResumeStore } from '@/store';

export function ResumeBuilderExample() {
  // Get data from store
  const personal = useResumeStore((state) => state.resumeData.personal);
  const workExperience = useResumeStore((state) => state.resumeData.workExperience);
  const education = useResumeStore((state) => state.resumeData.education);
  const skills = useResumeStore((state) => state.resumeData.skills);

  // Get actions from store
  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const updateWorkExperience = useResumeStore((state) => state.updateWorkExperience);
  const updateWorkExperienceAchievement = useResumeStore(
    (state) => state.updateWorkExperienceAchievement
  );
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const updateEducationHighlight = useResumeStore((state) => state.updateEducationHighlight);

  return (
    <A4Page>
      {/* ===== HEADER ===== */}
      <header className="text-center mb-6">
        <EditableField
          value={personal?.name}
          onChange={(value) => updatePersonal('name', value)}
          placeholder="YOUR NAME"
          className="text-3xl font-bold uppercase tracking-wider mb-2"
        />

        <div className="flex justify-center items-center gap-3 text-sm text-gray-700 flex-wrap">
          <EditableField
            value={personal?.email}
            onChange={(value) => updatePersonal('email', value)}
            placeholder="email@example.com"
            className="text-sm"
          />
          <span className="text-gray-400">|</span>
          <EditableField
            value={personal?.phone}
            onChange={(value) => updatePersonal('phone', value)}
            placeholder="+1 234 567 890"
            className="text-sm"
          />
          <span className="text-gray-400">|</span>
          <EditableField
            value={personal?.location}
            onChange={(value) => updatePersonal('location', value)}
            placeholder="City, Country"
            className="text-sm"
          />
        </div>

        <div className="flex justify-center items-center gap-3 text-sm text-gray-700 mt-1">
          <EditableField
            value={personal?.linkedin}
            onChange={(value) => updatePersonal('linkedin', value)}
            placeholder="linkedin.com/in/yourprofile"
            className="text-sm text-blue-600"
          />
          <span className="text-gray-400">|</span>
          <EditableField
            value={personal?.github}
            onChange={(value) => updatePersonal('github', value)}
            placeholder="github.com/username"
            className="text-sm text-blue-600"
          />
        </div>
      </header>

      {/* ===== EDUCATION ===== */}
      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-1 mb-3">
            Education
          </h2>

          {education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <EditableField
                    value={edu.institution}
                    onChange={(value) => updateEducation(index, 'institution', value)}
                    placeholder="University Name"
                    className="font-semibold text-base"
                  />
                  <EditableField
                    value={edu.degree}
                    onChange={(value) => updateEducation(index, 'degree', value)}
                    placeholder="Degree and Major"
                    className="italic text-sm text-gray-700"
                  />
                </div>
                <div className="text-right text-sm">
                  <EditableField
                    value={edu.location}
                    onChange={(value) => updateEducation(index, 'location', value)}
                    placeholder="Location"
                    className="text-sm"
                  />
                  <div className="flex gap-1 justify-end">
                    <EditableField
                      value={edu.startDate}
                      onChange={(value) => updateEducation(index, 'startDate', value)}
                      placeholder="Start"
                      className="text-sm w-16 text-right"
                    />
                    <span>–</span>
                    <EditableField
                      value={edu.endDate}
                      onChange={(value) => updateEducation(index, 'endDate', value)}
                      placeholder="End"
                      className="text-sm w-16"
                    />
                  </div>
                </div>
              </div>

              {edu.highlights && edu.highlights.length > 0 && (
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  {edu.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="text-sm">
                      <EditableField
                        value={highlight}
                        onChange={(value) =>
                          updateEducationHighlight(index, hIndex, value)
                        }
                        multiline
                        placeholder="Add a highlight or achievement..."
                        className="text-sm"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== WORK EXPERIENCE ===== */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-1 mb-3">
            Experience
          </h2>

          {workExperience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <EditableField
                    value={exp.title}
                    onChange={(value) => updateWorkExperience(index, 'title', value)}
                    placeholder="Job Title"
                    className="font-semibold text-base"
                  />
                  <EditableField
                    value={exp.company}
                    onChange={(value) => updateWorkExperience(index, 'company', value)}
                    placeholder="Company Name"
                    className="italic text-sm text-gray-700"
                  />
                </div>
                <div className="text-right text-sm">
                  <EditableField
                    value={exp.location}
                    onChange={(value) => updateWorkExperience(index, 'location', value)}
                    placeholder="Location"
                    className="text-sm"
                  />
                  <div className="flex gap-1 justify-end">
                    <EditableField
                      value={exp.startDate}
                      onChange={(value) => updateWorkExperience(index, 'startDate', value)}
                      placeholder="Start"
                      className="text-sm w-16 text-right"
                    />
                    <span>–</span>
                    <EditableField
                      value={exp.endDate}
                      onChange={(value) => updateWorkExperience(index, 'endDate', value)}
                      placeholder="Present"
                      className="text-sm w-16"
                    />
                  </div>
                </div>
              </div>

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  {exp.achievements.map((achievement, aIndex) => (
                    <li key={aIndex} className="text-sm">
                      <EditableField
                        value={achievement}
                        onChange={(value) =>
                          updateWorkExperienceAchievement(index, aIndex, value)
                        }
                        multiline
                        placeholder="Describe your achievement with metrics..."
                        className="text-sm"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== SKILLS ===== */}
      {skills && Object.keys(skills).length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-1 mb-3">
            Skills
          </h2>

          <div className="space-y-2 text-sm">
            {Object.entries(skills).map(([category, items]) => {
              if (!items || items.length === 0) return null;

              const formattedCategory = category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              return (
                <div key={category}>
                  <span className="font-semibold">{formattedCategory}:</span>{' '}
                  <span>{items.join(', ')}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </A4Page>
  );
}

/**
 * Minimal Example - Just the Basics
 */
export function MinimalResumeExample() {
  const personal = useResumeStore((state) => state.resumeData.personal);
  const updatePersonal = useResumeStore((state) => state.updatePersonal);

  return (
    <A4Page>
      <div className="text-center">
        <EditableField
          value={personal?.name}
          onChange={(value) => updatePersonal('name', value)}
          placeholder="Your Name"
          className="text-4xl font-bold"
        />
      </div>
    </A4Page>
  );
}
