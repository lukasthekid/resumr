/**
 * RichEditor Usage Examples
 * 
 * This file demonstrates how to use the RichEditor component
 * for inline rich text editing in resumes.
 */

"use client";

import { RichEditor, RichEditorReadOnly } from '@/components/resume';
import { useResumeStore } from '@/store';
import { useState } from 'react';

/**
 * Example 1: Basic Usage with Work Experience Achievements
 */
export function WorkExperienceWithRichText() {
  const workExperience = useResumeStore((state) => state.resumeData.workExperience);
  const updateWorkExperienceAchievement = useResumeStore(
    (state) => state.updateWorkExperienceAchievement
  );

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Experience</h2>
      
      {workExperience?.map((exp, expIndex) => (
        <div key={expIndex} className="mb-6">
          <h3 className="font-semibold">{exp.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
          
          <ul className="list-disc ml-5 space-y-2">
            {exp.achievements?.map((achievement, achIndex) => (
              <li key={achIndex} className="text-sm">
                <RichEditor
                  content={achievement}
                  onChange={(html) =>
                    updateWorkExperienceAchievement(expIndex, achIndex, html)
                  }
                  placeholder="Describe your achievement with impact and metrics..."
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/**
 * Example 2: Education Highlights with Rich Text
 */
export function EducationWithRichText() {
  const education = useResumeStore((state) => state.resumeData.education);
  const updateEducationHighlight = useResumeStore(
    (state) => state.updateEducationHighlight
  );

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Education</h2>
      
      {education?.map((edu, eduIndex) => (
        <div key={eduIndex} className="mb-6">
          <h3 className="font-semibold">{edu.institution}</h3>
          <p className="text-sm italic mb-2">{edu.degree}</p>
          
          <ul className="list-disc ml-5 space-y-2">
            {edu.highlights?.map((highlight, highlightIndex) => (
              <li key={highlightIndex} className="text-sm">
                <RichEditor
                  content={highlight}
                  onChange={(html) =>
                    updateEducationHighlight(eduIndex, highlightIndex, html)
                  }
                  placeholder="Add a highlight or achievement..."
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/**
 * Example 3: Project Descriptions with Rich Text
 */
export function ProjectsWithRichText() {
  const projects = useResumeStore((state) => state.resumeData.projects);
  const updateProjectDescription = useResumeStore(
    (state) => state.updateProjectDescription
  );

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      
      {projects?.map((project, projIndex) => (
        <div key={projIndex} className="mb-6">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold">{project.name}</h3>
            {project.role && (
              <span className="text-sm italic text-gray-600">({project.role})</span>
            )}
          </div>
          
          {project.url && (
            <a href={project.url} className="text-sm text-blue-600 hover:underline">
              {project.url}
            </a>
          )}
          
          <ul className="list-disc ml-5 space-y-2 mt-2">
            {project.description?.map((desc, descIndex) => (
              <li key={descIndex} className="text-sm">
                <RichEditor
                  content={desc}
                  onChange={(html) =>
                    updateProjectDescription(projIndex, descIndex, html)
                  }
                  placeholder="Describe the project and your contributions..."
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/**
 * Example 4: Standalone Rich Text Field
 * (For custom sections or one-off rich text needs)
 */
export function StandaloneRichTextExample() {
  const [content, setContent] = useState('<p>Edit this text...</p>');

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Summary</h3>
      <RichEditor
        content={content}
        onChange={setContent}
        placeholder="Write a compelling summary..."
        className="text-sm"
      />
      
      {/* Show raw HTML for debugging */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-gray-600">
          View HTML Output
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {content}
        </pre>
      </details>
    </div>
  );
}

/**
 * Example 5: Read-Only Display
 * (For displaying formatted content without editing)
 */
export function ReadOnlyExample() {
  const content = `
    <p>This is a <strong>read-only</strong> formatted text example.</p>
    <ul>
      <li>Bullet point one</li>
      <li>Bullet point two with <em>italic text</em></li>
      <li>Bullet point three</li>
    </ul>
    <p>Great for displaying final resumes or previews.</p>
  `;

  return (
    <div className="p-4 border rounded">
      <RichEditorReadOnly content={content} />
    </div>
  );
}

/**
 * Example 6: Custom Styling per Component
 */
export function CustomStyledRichEditor() {
  const [content, setContent] = useState('<p>Custom styled editor</p>');

  return (
    <div>
      {/* Larger text for important sections */}
      <RichEditor
        content={content}
        onChange={setContent}
        className="text-lg font-medium"
        placeholder="Important information..."
      />
      
      {/* Smaller, subdued text for details */}
      <RichEditor
        content={content}
        onChange={setContent}
        className="text-xs text-gray-600"
        placeholder="Additional details..."
      />
    </div>
  );
}

/**
 * Example 7: Full Resume Section with Rich Text
 */
export function CompleteResumeSectionExample() {
  const workExperience = useResumeStore((state) => state.resumeData.workExperience);
  const updateWorkExperience = useResumeStore((state) => state.updateWorkExperience);
  const updateWorkExperienceAchievement = useResumeStore(
    (state) => state.updateWorkExperienceAchievement
  );

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">
        Professional Experience
      </h2>
      
      {workExperience?.map((exp, expIndex) => (
        <div key={expIndex} className="mb-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold">{exp.title}</h3>
              <p className="text-base italic text-gray-700">{exp.company}</p>
            </div>
            <div className="text-right text-sm">
              <p>{exp.location}</p>
              <p className="text-gray-600">
                {exp.startDate} – {exp.endDate || 'Present'}
              </p>
            </div>
          </div>
          
          {/* Rich Text Achievements */}
          <ul className="list-disc ml-6 space-y-2">
            {exp.achievements?.map((achievement, achIndex) => (
              <li key={achIndex} className="text-sm leading-relaxed">
                <RichEditor
                  content={achievement}
                  onChange={(html) =>
                    updateWorkExperienceAchievement(expIndex, achIndex, html)
                  }
                  placeholder="Describe your achievement with metrics and impact. Use Cmd/Ctrl+B for bold, Cmd/Ctrl+I for italic."
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/**
 * Keyboard Shortcuts Reference Component
 */
export function KeyboardShortcutsGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
      <h4 className="font-semibold mb-2">💡 Rich Text Editor Shortcuts:</h4>
      <ul className="space-y-1 text-xs">
        <li><kbd className="bg-white px-2 py-1 rounded border">Cmd/Ctrl + B</kbd> - <strong>Bold</strong></li>
        <li><kbd className="bg-white px-2 py-1 rounded border">Cmd/Ctrl + I</kbd> - <em>Italic</em></li>
        <li><kbd className="bg-white px-2 py-1 rounded border">Cmd/Ctrl + Shift + 7</kbd> - Numbered List</li>
        <li><kbd className="bg-white px-2 py-1 rounded border">Cmd/Ctrl + Shift + 8</kbd> - Bullet List</li>
      </ul>
    </div>
  );
}
