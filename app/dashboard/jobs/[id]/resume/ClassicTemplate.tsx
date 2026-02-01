"use client";

import { EditableField, RichEditor } from '@/components/resume';
import { useResumeStore } from '@/store';

/**
 * ClassicTemplate - A professional single-column resume layout
 * 
 * Layout:
 * - Single-column format with vertical flow
 * - Header with name (large, bold) and centered contact info
 * - Four sections: Education, Experience, Projects, Technical Skills
 * - Split-line alignment: left for titles/names, right for dates/locations
 * - Bold, capitalized section headings with horizontal lines
 * - Bullet points for Experience and Projects
 * - Technical Skills categorized at the bottom
 */
export function ClassicTemplate() {
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

  // Helper function to format URLs for display
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  // Map skills to categories for Technical Skills section
  // Languages -> programmingLanguages
  // Frameworks & Libraries -> technologies (grouped together as they're often mixed)
  // Developer Tools -> tools
  const languages = skills?.programmingLanguages || [];
  const tools = skills?.tools || [];
  const technologies = skills?.technologies || [];
  
  // Group technologies as "Frameworks & Libraries" or show separately if needed
  const frameworksAndLibraries = technologies;

  return (
    <div className="h-full pt-2">
      {/* HEADER - Centered Name and Contact */}
      <header className="mb-6 text-center">
        {/* Name - Large and Bold */}
        <div className="mb-2">
          <EditableField
            value={personal?.name}
            onChange={(value) => updatePersonal('name', value)}
            placeholder="YOUR NAME"
            className="text-3xl font-bold text-gray-900"
          />
        </div>

        {/* Contact Info - Centered and Editable */}
        <div className="text-xs text-gray-700">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
            {personal?.phone && (
              <div className="flex items-center gap-x-2">
                <EditableField
                  value={personal.phone}
                  onChange={(value) => updatePersonal('phone', value)}
                  placeholder="Phone"
                  className="text-xs"
                />
                <span className="text-gray-400">•</span>
              </div>
            )}
            {personal?.email && (
              <div className="flex items-center gap-x-2">
                <EditableField
                  value={personal.email}
                  onChange={(value) => updatePersonal('email', value)}
                  placeholder="Email"
                  className="text-xs"
                />
                {(personal?.linkedin || personal?.github) && (
                  <span className="text-gray-400">•</span>
                )}
              </div>
            )}
            {personal?.linkedin && (
              <div className="flex items-center gap-x-2">
                <EditableField
                  value={formatUrl(personal.linkedin)}
                  onChange={(value) => updatePersonal('linkedin', value.startsWith('http') ? value : `https://${value}`)}
                  placeholder="linkedin.com/in/profile"
                  className="text-xs"
                />
                {personal?.github && (
                  <span className="text-gray-400">•</span>
                )}
              </div>
            )}
            {personal?.github && (
              <div className="flex items-center gap-x-2">
                <EditableField
                  value={formatUrl(personal.github)}
                  onChange={(value) => updatePersonal('github', value.startsWith('http') ? value : `https://${value}`)}
                  placeholder="github.com/username"
                  className="text-xs"
                />
              </div>
            )}
            {/* Show placeholders if no contact info */}
            {!personal?.phone && !personal?.email && !personal?.linkedin && !personal?.github && (
              <div className="flex items-center gap-x-2 text-gray-400">
                <EditableField
                  value={personal?.phone}
                  onChange={(value) => updatePersonal('phone', value)}
                  placeholder="Phone"
                  className="text-xs"
                />
                <span>•</span>
                <EditableField
                  value={personal?.email}
                  onChange={(value) => updatePersonal('email', value)}
                  placeholder="Email"
                  className="text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SINGLE COLUMN CONTENT */}
      <div className="space-y-5">
        {/* EDUCATION */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3 text-gray-900">
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx}>
                  {/* Split-line: Institution/Location on left, Dates on right */}
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex-1">
                      <EditableField
                        value={edu.institution}
                        onChange={(value) => updateEducation(idx, 'institution', value)}
                        placeholder="Institution Name"
                        className="font-bold text-sm text-gray-900"
                      />
                      {edu.location && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          <EditableField
                            value={edu.location}
                            onChange={(value) => updateEducation(idx, 'location', value)}
                            placeholder="Location"
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <div className="text-right text-xs text-gray-600 ml-4 w-32">
                        <div className="flex items-center gap-1 justify-end">
                          <EditableField
                            value={edu.startDate}
                            onChange={(value) => updateEducation(idx, 'startDate', value)}
                            placeholder="Start"
                            className="text-xs text-right"
                          />
                          <span>–</span>
                          <EditableField
                            value={edu.endDate}
                            onChange={(value) => updateEducation(idx, 'endDate', value)}
                            placeholder="End"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Degree and Minor */}
                  {edu.degree && (
                    <div className="text-xs text-gray-700 mb-1">
                      <EditableField
                        value={edu.degree}
                        onChange={(value) => updateEducation(idx, 'degree', value)}
                        placeholder="Degree"
                        className="text-xs italic"
                        multiline
                      />
                    </div>
                  )}
                  {/* Highlights as bullet points */}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs ml-4">
                      {edu.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <div className="flex-1">
                            <RichEditor
                              content={highlight}
                              onChange={(html) => updateEducationHighlight(idx, hIdx, html)}
                              placeholder="Highlight..."
                              className="text-xs text-gray-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {workExperience && workExperience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3 text-gray-900">
              Experience
            </h2>
            <div className="space-y-4">
              {workExperience.map((exp, idx) => (
                <div key={idx}>
                  {/* Split-line: Title/Company/Location on left, Dates on right */}
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex-1">
                      <EditableField
                        value={exp.title}
                        onChange={(value) => updateWorkExperience(idx, 'title', value)}
                        placeholder="Job Title"
                        className="font-bold text-sm text-gray-900"
                      />
                      <div className="flex items-center gap-2 mt-0.5">
                        {exp.company && (
                          <EditableField
                            value={exp.company}
                            onChange={(value) => updateWorkExperience(idx, 'company', value)}
                            placeholder="Company Name"
                            className="font-semibold text-xs text-gray-700"
                          />
                        )}
                        {exp.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <EditableField
                              value={exp.location}
                              onChange={(value) => updateWorkExperience(idx, 'location', value)}
                              placeholder="Location"
                              className="text-xs text-gray-600"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {(exp.startDate || exp.endDate) && (
                      <div className="text-right text-xs text-gray-600 ml-4 w-32">
                        <div className="flex items-center gap-1 justify-end">
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
                    )}
                  </div>
                  {/* Achievements as bullet points */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs ml-4">
                      {exp.achievements.map((achievement, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <div className="flex-1">
                            <RichEditor
                              content={achievement}
                              onChange={(html) =>
                                updateWorkExperienceAchievement(idx, aIdx, html)
                              }
                              placeholder="Describe your achievement with impact and metrics..."
                              className="text-xs text-gray-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3 text-gray-900">
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map((project, idx) => (
                <div key={idx}>
                  {/* Split-line: Project Name/Technologies on left, Timeframe on right */}
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex-1">
                      <EditableField
                        value={project.name}
                        onChange={(value) => updateProject(idx, 'name', value)}
                        placeholder="Project Name"
                        className="font-semibold text-sm text-gray-900"
                      />
                      {/* Technologies could be extracted from description or added as a field */}
                      {project.url && (
                        <div className="text-xs text-blue-600 mt-0.5">
                          <EditableField
                            value={project.url}
                            onChange={(value) => updateProject(idx, 'url', value)}
                            placeholder="project-url.com"
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                    {(project.startDate || project.endDate) && (
                      <div className="text-right text-xs text-gray-600 ml-4">
                        <div className="flex items-center gap-1 justify-end">
                          <EditableField
                            value={project.startDate}
                            onChange={(value) => updateProject(idx, 'startDate', value)}
                            placeholder="Start"
                            className="text-xs text-right"
                          />
                          <span>–</span>
                          <EditableField
                            value={project.endDate}
                            onChange={(value) => updateProject(idx, 'endDate', value)}
                            placeholder="End"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Description as bullet points */}
                  {project.description && project.description.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs ml-4">
                      {project.description.map((desc, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <div className="flex-1">
                            <RichEditor
                              content={desc}
                              onChange={(html) => updateProjectDescription(idx, dIdx, html)}
                              placeholder="Describe the project and your contributions..."
                              className="text-xs text-gray-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNICAL SKILLS */}
        {(languages.length > 0 || frameworksAndLibraries.length > 0 || tools.length > 0) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3 text-gray-900">
              Technical Skills
            </h2>
            <div className="space-y-2 text-xs">
              {languages.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900">Languages:</span>{' '}
                  <span className="text-gray-700">{languages.join(', ')}</span>
                </div>
              )}
              {frameworksAndLibraries.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900">Frameworks:</span>{' '}
                  <span className="text-gray-700">{frameworksAndLibraries.join(', ')}</span>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900">Developer Tools:</span>{' '}
                  <span className="text-gray-700">{tools.join(', ')}</span>
                </div>
              )}
              {/* Show other skill categories */}
              {skills && Object.entries(skills).map(([category, items]) => {
                if (!items || items.length === 0) return null;
                // Skip already displayed categories
                if (['programmingLanguages', 'technologies', 'tools'].includes(category)) {
                  return null;
                }
                
                const formattedCategory = category
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();
                
                return (
                  <div key={category}>
                    <span className="font-semibold text-gray-900">{formattedCategory}:</span>{' '}
                    <span className="text-gray-700">{items.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
