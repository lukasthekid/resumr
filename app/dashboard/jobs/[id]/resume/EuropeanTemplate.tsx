"use client";

import { useState } from "react";
import {
  AddListItemButton,
  AddSectionButton,
  EditableField,
  EditableListItem,
  EditableSectionItem,
} from "@/components/resume";
import { useResumeStore } from "@/store";
import { LinkIcon, Phone, Mail, MapPin } from "lucide-react";

const ACCENT = "#1e293b";

const excludeCategories = ["spokenLanguages", "hobbies"];

/**
 * EuropeanTemplate — international European-style CV with headshot (top-right),
 * navy/slate accents, English section labels, sidebar skills and dates on the right.
 */
export function EuropeanTemplate() {
  const personal = useResumeStore((state) => state.resumeData.personal);
  const education = useResumeStore((state) => state.resumeData.education);
  const workExperience = useResumeStore((state) => state.resumeData.workExperience);
  const projects = useResumeStore((state) => state.resumeData.projects);
  const skills = useResumeStore((state) => state.resumeData.skills);

  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const updateEducationHighlight = useResumeStore((state) => state.updateEducationHighlight);
  const updateWorkExperience = useResumeStore((state) => state.updateWorkExperience);
  const updateWorkExperienceAchievement = useResumeStore(
    (state) => state.updateWorkExperienceAchievement
  );
  const updateProject = useResumeStore((state) => state.updateProject);
  const updateProjectDescription = useResumeStore((state) => state.updateProjectDescription);
  const addWorkExperienceAchievement = useResumeStore(
    (state) => state.addWorkExperienceAchievement
  );
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

  const [headshotError, setHeadshotError] = useState(false);

  const currentRole = workExperience?.[0]?.title;

  const mainSkills = skills
    ? Object.entries(skills).filter(
        ([cat]) => !excludeCategories.includes(cat) && skills[cat]?.length
      )
    : [];
  const spokenLanguages = skills?.spokenLanguages || [];
  const hobbies = skills?.hobbies || [];

  return (
    <div className="h-full pt-0">
      <header className="relative mb-5 flex flex-row items-start justify-between gap-4 border-b pb-4" style={{ borderColor: ACCENT }}>
        <div className="min-w-0 flex-1">
          {currentRole && (
            <div className="mb-0.5">
              <EditableField
                value={currentRole}
                onChange={(v) => workExperience?.[0] && updateWorkExperience(0, "title", v)}
                placeholder="Current role"
                className="text-xs font-medium text-slate-600"
              />
            </div>
          )}
          <div className="mb-2">
            <EditableField
              value={personal?.name}
              onChange={(v) => updatePersonal("name", v)}
              placeholder="YOUR NAME"
              className="text-2xl font-bold tracking-tight text-slate-900"
            />
          </div>
          <div className="flex flex-col gap-0.5 text-xs text-slate-700">
            {personal?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                <EditableField
                  value={personal.phone}
                  onChange={(v) => updatePersonal("phone", v)}
                  placeholder="Phone"
                  className="text-xs"
                />
              </div>
            )}
            {personal?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                <EditableField
                  value={personal.email}
                  onChange={(v) => updatePersonal("email", v)}
                  placeholder="Email"
                  className="text-xs"
                />
              </div>
            )}
            {personal?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                <EditableField
                  value={personal.location}
                  onChange={(v) => updatePersonal("location", v)}
                  placeholder="Location"
                  className="text-xs"
                />
              </div>
            )}
            {personal?.linkedin && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                <EditableField
                  value={personal.linkedin}
                  onChange={(v) => updatePersonal("linkedin", v)}
                  placeholder="LinkedIn"
                  className="text-xs text-blue-700"
                />
              </div>
            )}
            {(!personal?.phone || !personal?.email || !personal?.location) && (
              <div className="flex flex-col gap-0.5">
                {!personal?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                    <EditableField
                      value={personal?.phone}
                      onChange={(v) => updatePersonal("phone", v)}
                      placeholder="Phone"
                      className="text-xs text-slate-500"
                    />
                  </div>
                )}
                {!personal?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                    <EditableField
                      value={personal?.email}
                      onChange={(v) => updatePersonal("email", v)}
                      placeholder="Email"
                      className="text-xs text-slate-500"
                    />
                  </div>
                )}
                {!personal?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                    <EditableField
                      value={personal?.location}
                      onChange={(v) => updatePersonal("location", v)}
                      placeholder="Location"
                      className="text-xs text-slate-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative h-[7.5rem] w-[7.5rem] flex-shrink-0 overflow-hidden rounded-sm border border-slate-300 bg-slate-200 shadow-sm print:border-slate-300">
          {!headshotError ? (
            <img
              src="/api/profile/headshot"
              alt=""
              className="h-full w-full object-cover"
              onError={() => setHeadshotError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              <span className="text-[10px]">Photo</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,32%)_minmax(0,68%)] lg:gap-8">
        <aside className="space-y-4 lg:order-1">
          {mainSkills.length > 0 && (
            <section>
              <h2
                className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900"
                style={{ borderColor: ACCENT }}
              >
                Skills
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {mainSkills.flatMap(([category, items]) =>
                  (items || []).map((item, i) => (
                    <li key={`${category}-${i}`} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: ACCENT }}
                      />
                      <span>{item}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )}

          {spokenLanguages.length > 0 && (
            <section>
              <h2
                className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900"
                style={{ borderColor: ACCENT }}
              >
                Languages
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {spokenLanguages.map((lang, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                    <span>{lang}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hobbies.length > 0 && (
            <section>
              <h2
                className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-900"
                style={{ borderColor: ACCENT }}
              >
                Interests
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {hobbies.map((hobby, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                    <span>{hobby}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <main className="space-y-4 lg:order-2">
          <section>
            <h2
              className="mb-3 border-b-2 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900"
              style={{ borderColor: ACCENT }}
            >
              Work experience
            </h2>
            <div className="space-y-4">
              {(workExperience || []).map((exp, idx) => (
                <EditableSectionItem key={idx} onRemove={() => removeWorkExperience(idx)}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <EditableField
                        value={exp.title}
                        onChange={(v) => updateWorkExperience(idx, "title", v)}
                        placeholder="Job title"
                        className="font-bold text-xs text-slate-900"
                      />
                      <EditableField
                        value={exp.company}
                        onChange={(v) => updateWorkExperience(idx, "company", v)}
                        placeholder="Company"
                        className="text-xs text-slate-600"
                      />
                      <ul className="mt-1.5 space-y-1">
                        {(exp.achievements || []).map((achievement, aIdx) => (
                          <EditableListItem
                            key={aIdx}
                            content={achievement}
                            onChange={(html) =>
                              updateWorkExperienceAchievement(idx, aIdx, html)
                            }
                            onRemove={() => removeWorkExperienceAchievement(idx, aIdx)}
                            placeholder="Achievement..."
                          />
                        ))}
                        <AddListItemButton
                          onClick={() => addWorkExperienceAchievement(idx, "")}
                          label="achievement"
                        />
                      </ul>
                    </div>
                    <div className="w-full flex-shrink-0 text-left text-[10px] text-slate-600 sm:w-24 sm:text-right">
                      <EditableField
                        value={exp.startDate}
                        onChange={(v) => updateWorkExperience(idx, "startDate", v)}
                        placeholder="Start"
                        className="inline text-[10px] sm:block"
                      />
                      <span className="px-0.5 sm:hidden">–</span>
                      <EditableField
                        value={exp.endDate}
                        onChange={(v) => updateWorkExperience(idx, "endDate", v)}
                        placeholder="Present"
                        className="inline text-[10px] sm:block sm:pt-0"
                      />
                    </div>
                  </div>
                </EditableSectionItem>
              ))}
              <AddSectionButton onClick={() => addWorkExperience()} label="work experience" />
            </div>
          </section>

          <section>
            <h2
              className="mb-3 border-b-2 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900"
              style={{ borderColor: ACCENT }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {(education || []).map((edu, idx) => (
                <EditableSectionItem key={idx} onRemove={() => removeEducation(idx)}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <EditableField
                        value={edu.institution}
                        onChange={(v) => updateEducation(idx, "institution", v)}
                        placeholder="Institution"
                        className="font-bold text-xs text-slate-900"
                      />
                      <EditableField
                        value={edu.degree}
                        onChange={(v) => updateEducation(idx, "degree", v)}
                        placeholder="Degree"
                        className="text-xs italic text-slate-700"
                        multiline
                      />
                      <ul className="mt-1.5 space-y-1">
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
                          onClick={() => addEducationHighlight(idx, "")}
                          label="highlight"
                        />
                      </ul>
                    </div>
                    <div className="w-full flex-shrink-0 text-left text-[10px] text-slate-600 sm:w-24 sm:text-right">
                      <EditableField
                        value={edu.startDate}
                        onChange={(v) => updateEducation(idx, "startDate", v)}
                        placeholder="Start"
                        className="inline text-[10px] sm:block"
                      />
                      <span className="px-0.5 sm:hidden">–</span>
                      <EditableField
                        value={edu.endDate}
                        onChange={(v) => updateEducation(idx, "endDate", v)}
                        placeholder="End"
                        className="inline text-[10px] sm:block"
                      />
                    </div>
                  </div>
                </EditableSectionItem>
              ))}
              <AddSectionButton onClick={() => addEducation()} label="education" />
            </div>
          </section>

          <section>
            <h2
              className="mb-3 border-b-2 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900"
              style={{ borderColor: ACCENT }}
            >
              Projects
            </h2>
            <div className="space-y-3">
              {(projects || []).map((project, idx) => (
                <EditableSectionItem key={idx} onRemove={() => removeProject(idx)}>
                  <div>
                    <EditableField
                      value={project.name}
                      onChange={(v) => updateProject(idx, "name", v)}
                      placeholder="Project name"
                      className="font-semibold text-xs text-slate-900"
                    />
                    <EditableField
                      value={project.role}
                      onChange={(v) => updateProject(idx, "role", v)}
                      placeholder="Role"
                      className="text-xs italic text-slate-600"
                    />
                    <div className="mt-0.5 flex items-center gap-1">
                      <LinkIcon className="h-3 w-3 flex-shrink-0 text-slate-400" />
                      <EditableField
                        value={project.url}
                        onChange={(v) => updateProject(idx, "url", v)}
                        placeholder="URL"
                        className="text-[10px] text-blue-600"
                      />
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {(project.description || []).map((desc, dIdx) => (
                        <EditableListItem
                          key={dIdx}
                          content={desc}
                          onChange={(html) => updateProjectDescription(idx, dIdx, html)}
                          onRemove={() => removeProjectDescription(idx, dIdx)}
                          placeholder="Description..."
                        />
                      ))}
                      <AddListItemButton
                        onClick={() => addProjectDescription(idx, "")}
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
