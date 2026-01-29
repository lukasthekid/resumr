"use client";

import { useCallback } from "react";

type ResumeData = {
  personal?: {
    name?: string;
    location?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  education?: Array<{
    institution?: string;
    location?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }>;
  workExperience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
    description?: string[];
  }>;
  skills?: {
    programmingLanguages?: string[];
    technologies?: string[];
    tools?: string[];
    [key: string]: string[] | undefined;
  };
  extracurriculars?: Array<{
    activity?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
};

interface ResumeLayoutAmericanProps {
  resumeData: ResumeData;
  onUpdateData?: (updater: (data: ResumeData) => ResumeData) => void;
  editable?: boolean;
}

export function ResumeLayout_American({ 
  resumeData, 
  onUpdateData,
  editable = false 
}: ResumeLayoutAmericanProps) {
  const { personal, education, workExperience, projects, skills, extracurriculars } = resumeData;

  // Handler for updating array items
  const handleArrayItemUpdate = useCallback(
    (
      section: keyof ResumeData,
      index: number,
      field: string,
      itemIndex: number,
      value: string
    ) => {
      if (!onUpdateData) return;
      
      onUpdateData((prev) => {
        const newData = { ...prev };
        const sectionData = newData[section] as any[];
        if (sectionData && sectionData[index]) {
          const item = { ...sectionData[index] };
          if (Array.isArray(item[field])) {
            const newArray = [...item[field]];
            newArray[itemIndex] = value;
            item[field] = newArray;
          }
          sectionData[index] = item;
        }
        return newData;
      });
    },
    [onUpdateData]
  );

  // Handler for updating all skills at once
  const handleAllSkillsUpdate = useCallback(
    (htmlContent: string) => {
      if (!onUpdateData) return;
      
      onUpdateData((prev) => {
        const newData = { ...prev };
        
        // Parse the HTML content to extract skills
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Split by lines and parse each line
        const lines = text.split('\n').filter(line => line.trim());
        const newSkills: Record<string, string[]> = {};
        
        lines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            const categoryName = line.substring(0, colonIndex).trim();
            const skillsText = line.substring(colonIndex + 1).trim();
            
            // Convert category name to camelCase key
            const key = categoryName
              .split(' ')
              .map((word, idx) => 
                idx === 0 
                  ? word.toLowerCase() 
                  : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join('');
            
            // Parse comma-separated skills
            const skillsArray = skillsText
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            
            if (skillsArray.length > 0) {
              newSkills[key] = skillsArray;
            }
          }
        });
        
        newData.skills = newSkills;
        return newData;
      });
    },
    [onUpdateData]
  );

  // Build contact line
  const contactParts = [
    personal?.phone,
    personal?.email,
    personal?.linkedin,
    personal?.github,
    personal?.website,
  ].filter(Boolean);

  return (
    <div
      className="bg-white shadow-lg mx-auto"
      id="resume-document"
      style={{
        maxWidth: "210mm",
        minHeight: "297mm",
        fontFamily: "Arial, Calibri, sans-serif",
        fontSize: "10pt",
        lineHeight: "1.2",
        color: "#000",
      }}
    >
      <div style={{ padding: "10mm 10mm 10mm 10mm" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "0.6em", textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "20pt", 
            fontWeight: "700", 
            margin: "0 0 0.25em 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {personal?.name || "YOUR NAME"}
          </h1>
          <div style={{ fontSize: "9pt", color: "#333" }}>
            {contactParts.join(" | ")}
          </div>
        </div>

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <section style={{ marginBottom: "0.75em" }}>
            <h2 style={{ 
              fontSize: "11pt", 
              fontWeight: "700", 
              borderBottom: "1px solid #000",
              paddingBottom: "0.15em",
              marginBottom: "0.5em"
            }}>
              Education
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: "0.6em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2em" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{edu.institution}</div>
                    {edu.degree && (
                      <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>{edu.degree}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "9.5pt" }}>
                    {edu.location && <div>{edu.location}</div>}
                    {(edu.startDate || edu.endDate) && (
                      <div>
                        {edu.startDate} – {edu.endDate || "Present"}
                      </div>
                    )}
                  </div>
                </div>
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul style={{ margin: "0.25em 0 0 1.2em", paddingLeft: 0 }}>
                    {edu.highlights.map((highlight, hIdx) => (
                      <li 
                        key={hIdx} 
                        style={{ marginBottom: "0.15em" }}
                        className={editable ? "editable-text" : ""}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (editable) {
                            handleArrayItemUpdate("education", idx, "highlights", hIdx, e.currentTarget.innerHTML || "");
                          }
                        }}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* EXPERIENCE */}
        {workExperience && workExperience.length > 0 && (
          <section style={{ marginBottom: "0.75em" }}>
            <h2 style={{ 
              fontSize: "11pt", 
              fontWeight: "700", 
              borderBottom: "1px solid #000",
              paddingBottom: "0.15em",
              marginBottom: "0.5em"
            }}>
              Experience
            </h2>
            {workExperience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: "0.6em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2em" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{exp.title}</div>
                    {exp.company && (
                      <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>{exp.company}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "9.5pt" }}>
                    {exp.location && <div>{exp.location}</div>}
                    {(exp.startDate || exp.endDate) && (
                      <div>
                        {exp.startDate} – {exp.endDate || "Present"}
                      </div>
                    )}
                  </div>
                </div>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul style={{ margin: "0.25em 0 0 1.2em", paddingLeft: 0 }}>
                    {exp.achievements.map((achievement, aIdx) => (
                      <li 
                        key={aIdx} 
                        style={{ marginBottom: "0.15em" }}
                        className={editable ? "editable-text" : ""}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (editable) {
                            handleArrayItemUpdate("workExperience", idx, "achievements", aIdx, e.currentTarget.innerHTML || "");
                          }
                        }}
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* PROJECTS */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: "0.75em" }}>
            <h2 style={{ 
              fontSize: "11pt", 
              fontWeight: "700", 
              borderBottom: "1px solid #000",
              paddingBottom: "0.15em",
              marginBottom: "0.5em"
            }}>
              Projects
            </h2>
            {projects.map((project, idx) => (
              <div key={idx} style={{ marginBottom: "0.6em" }}>
                <div style={{ marginBottom: "0.2em" }}>
                  <span style={{ fontWeight: "600" }}>{project.name}</span>
                  {project.role && <span style={{ fontStyle: "italic" }}> ({project.role})</span>}
                  {project.url && (
                    <span style={{ fontSize: "9pt", color: "#0066cc" }}> | {project.url}</span>
                  )}
                </div>
                {project.description && project.description.length > 0 && (
                  <ul style={{ margin: "0.25em 0 0 1.2em", paddingLeft: 0 }}>
                    {project.description.map((desc, dIdx) => (
                      <li 
                        key={dIdx} 
                        style={{ marginBottom: "0.2em" }}
                        className={editable ? "editable-text" : ""}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (editable) {
                            handleArrayItemUpdate("projects", idx, "description", dIdx, e.currentTarget.innerHTML || "");
                          }
                        }}
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* SKILLS */}
        {skills && Object.keys(skills).length > 0 && (
          <section style={{ marginBottom: "0.75em" }}>
            <h2 style={{ 
              fontSize: "11pt", 
              fontWeight: "700", 
              borderBottom: "1px solid #000",
              paddingBottom: "0.15em",
              marginBottom: "0.5em"
            }}>
              Skills
            </h2>
            <div
              className={editable ? "editable-text skills-section" : "skills-section"}
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (editable) {
                  handleAllSkillsUpdate(e.currentTarget.innerHTML);
                }
              }}
              style={{ marginBottom: "0.3em" }}
            >
              {Object.entries(skills).map(([category, items], idx) => {
                if (!items || items.length === 0) return null;
                
                // Format category name (e.g., "programmingLanguages" -> "Programming Languages")
                const formattedCategory = category
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
                
                return (
                  <div key={category}>
                    <strong>{formattedCategory}:</strong> {items.join(", ")}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EXTRACURRICULARS */}
        {extracurriculars && extracurriculars.length > 0 && (
          <section style={{ marginBottom: "0.75em" }}>
            <h2 style={{ 
              fontSize: "11pt", 
              fontWeight: "700", 
              borderBottom: "1px solid #000",
              paddingBottom: "0.15em",
              marginBottom: "0.5em"
            }}>
              Extracurricular Activities
            </h2>
            {extracurriculars.map((activity, idx) => (
              <div key={idx} style={{ marginBottom: "0.6em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2em" }}>
                  <div style={{ fontWeight: "600" }}>{activity.activity}</div>
                  {(activity.startDate || activity.endDate) && (
                    <div style={{ fontSize: "9.5pt" }}>
                      {activity.startDate} – {activity.endDate || "Present"}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <ul style={{ margin: "0.25em 0 0 1.2em", paddingLeft: 0 }}>
                    {activity.description.map((desc, dIdx) => (
                      <li 
                        key={dIdx} 
                        style={{ marginBottom: "0.2em" }}
                        className={editable ? "editable-text" : ""}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (editable) {
                            handleArrayItemUpdate("extracurriculars", idx, "description", dIdx, e.currentTarget.innerHTML || "");
                          }
                        }}
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
