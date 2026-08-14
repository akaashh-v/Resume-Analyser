import React from 'react';
import styles from './ResumeTemplates.module.css';

// Elegant Classic Minimal Template
export const ClassicTemplate = ({ data, styles: fontStyles }) => {
  const { contact = {}, summary = '', experience = [], education = [], skills = [] } = data;
  return (
    <div className={styles.classicContainer} style={{ fontFamily: fontStyles.fontFamily, fontSize: `${fontStyles.fontSize}px` }}>
      {/* Header */}
      <div className={styles.classicHeader}>
        <h1 className={styles.classicName}>
          {contact.name || 'Your Name'}
        </h1>
        <div className={styles.classicContactInfo}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>· {contact.phone}</span>}
          {contact.location && <span>· {contact.location}</span>}
          {contact.linkedin && <span>· {contact.linkedin}</span>}
          {contact.github && <span>· {contact.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>
            Professional Summary
          </h2>
          <p className={styles.classicText}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>
            Experience
          </h2>
          <div className={styles.classicList}>
            {experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className={styles.classicListItemHeader}>
                  <span>{exp.role}</span>
                  <span className={styles.classicListItemDate}>{exp.duration}</span>
                </div>
                <div className={styles.classicListItemSub}>
                  {exp.company}
                </div>
                <ul className={styles.classicBullets}>
                  {exp.bullets?.map((b, idx) => (
                    <li key={idx} className={styles.classicBullet}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>
            Education
          </h2>
          <div className={styles.classicList} style={{ gap: '0.75rem' }}>
            {education.map((edu, i) => (
              <div key={edu.id || i} className={styles.classicListItemHeader} style={{ fontWeight: 'normal' }}>
                <div>
                  <strong style={{ color: '#09090b' }}>{edu.degree}</strong>
                  <div className={styles.classicListItemSub} style={{ fontStyle: 'normal', marginBottom: 0 }}>{edu.institution}</div>
                </div>
                <span className={styles.classicListItemDate}>{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className={styles.classicSectionTitle}>
            Skills &amp; Expertise
          </h2>
          <p className={styles.classicSkillsText}>
            {skills.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// Modern Left-Sidebar Template
export const ModernSidebarTemplate = ({ data, styles: fontStyles }) => {
  const { contact = {}, summary = '', experience = [], education = [], skills = [] } = data;
  return (
    <div className={styles.modernContainer} style={{ fontFamily: fontStyles.fontFamily, fontSize: `${fontStyles.fontSize}px` }}>
      {/* Sidebar Panel */}
      <div className={styles.modernSidebar}>
        <h1 className={styles.modernName}>
          {contact.name || 'Your Name'}
        </h1>
        
        <div className={styles.modernContactGroup}>
          <div>
            <div className={styles.modernSidebarTitle}>Contact</div>
            {contact.email && <div>{contact.email}</div>}
            {contact.phone && <div>{contact.phone}</div>}
            {contact.location && <div>{contact.location}</div>}
          </div>
          {(contact.linkedin || contact.github) && (
            <div>
              <div className={styles.modernSidebarTitle}>Social</div>
              {contact.linkedin && <div>{contact.linkedin}</div>}
              {contact.github && <div>{contact.github}</div>}
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div>
            <div className={styles.modernSidebarTitle} style={{ marginBottom: '0.5rem' }}>Skills</div>
            <div className={styles.modernSkillsList}>
              {skills.map((s, idx) => (
                <div key={idx} className={styles.modernSkillBadge}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Panel */}
      <div className={styles.modernMain}>
        {/* Summary */}
        {summary && (
          <div className={styles.modernSection}>
            <h2 className={styles.modernSectionTitle}>
              Summary
            </h2>
            <p className={styles.modernText}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className={styles.modernSection}>
            <h2 className={styles.modernSectionTitle}>
              Experience
            </h2>
            <div className={styles.modernList}>
              {experience.map((exp, i) => (
                <div key={exp.id || i}>
                  <div className={styles.modernListItemHeader}>
                    <span>{exp.role}</span>
                    <span className={styles.modernListItemDate}>{exp.duration}</span>
                  </div>
                  <div className={styles.modernListItemSub}>
                    {exp.company}
                  </div>
                  <ul className={styles.modernBullets}>
                    {exp.bullets?.map((b, idx) => (
                      <li key={idx} className={styles.modernBullet}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className={styles.modernSectionTitle} style={{ marginBottom: '0.75rem' }}>
              Education
            </h2>
            <div className={styles.modernList} style={{ gap: '0.75rem' }}>
              {education.map((edu, i) => (
                <div key={edu.id || i} className={styles.modernListItemHeader} style={{ fontWeight: 'normal' }}>
                  <div>
                    <strong style={{ color: '#09090b' }}>{edu.degree}</strong>
                    <div className={styles.modernListItemSub} style={{ fontWeight: 'normal', marginBottom: 0 }}>{edu.institution}</div>
                  </div>
                  <span className={styles.modernListItemDate}>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Minimalist Template
export const MinimalistTemplate = ({ data, styles: fontStyles }) => {
  const { contact = {}, summary = '', experience = [], education = [], skills = [] } = data;
  return (
    <div className={styles.minimalistContainer} style={{ fontFamily: fontStyles.fontFamily, fontSize: `${fontStyles.fontSize}px` }}>
      {/* Header */}
      <div className={styles.minimalistHeader}>
        <h1 className={styles.minimalistName}>
          {contact.name || 'Your Name'}
        </h1>
        <div className={styles.minimalistContactInfo}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.linkedin && <span>{contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.minimalistSection}>
          <p className={styles.minimalistText} style={{ fontStyle: 'italic', color: '#555' }}>"{summary}"</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className={styles.minimalistSection}>
          <h2 className={styles.minimalistSectionTitle}>
            Experience
          </h2>
          <div className={styles.minimalistList}>
            {experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className={styles.minimalistListItemHeader}>
                  <span>{exp.role}</span>
                  <span className={styles.minimalistListItemDate}>{exp.duration}</span>
                </div>
                <div className={styles.minimalistListItemSub}>
                  {exp.company}
                </div>
                <ul className={styles.minimalistBullets}>
                  {exp.bullets?.map((b, idx) => (
                    <li key={idx} className={styles.minimalistBullet}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className={styles.minimalistSection}>
          <h2 className={styles.minimalistSectionTitle}>
            Education
          </h2>
          <div className={styles.minimalistList}>
            {education.map((edu, i) => (
              <div key={edu.id || i}>
                <div className={styles.minimalistListItemHeader}>
                  <span>{edu.degree}</span>
                  <span className={styles.minimalistListItemDate}>{edu.year}</span>
                </div>
                <div className={styles.minimalistListItemSub}>{edu.institution}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className={styles.minimalistSection}>
          <h2 className={styles.minimalistSectionTitle}>
            Skills
          </h2>
          <p className={styles.minimalistText}>
            {skills.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
};

// Professional Template
export const ProfessionalTemplate = ({ data, styles: fontStyles }) => {
  const { contact = {}, summary = '', experience = [], education = [], skills = [] } = data;
  return (
    <div className={styles.professionalContainer} style={{ fontFamily: fontStyles.fontFamily, fontSize: `${fontStyles.fontSize}px` }}>
      {/* Header */}
      <div className={styles.professionalHeader}>
        <h1 className={styles.professionalName}>
          {contact.name || 'Your Name'}
        </h1>
        <div className={styles.professionalContactInfo}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>| {contact.phone}</span>}
          {contact.location && <span>| {contact.location}</span>}
          {contact.linkedin && <span>| {contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className={styles.professionalSection}>
          <p className={styles.professionalText}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className={styles.professionalSection}>
          <h2 className={styles.professionalSectionTitle}>
            Professional Experience
          </h2>
          <div className={styles.professionalList}>
            {experience.map((exp, i) => (
              <div key={exp.id || i}>
                <div className={styles.professionalListItemHeader}>
                  <span>{exp.company} — {exp.role}</span>
                  <span className={styles.professionalListItemDate}>{exp.duration}</span>
                </div>
                <ul className={styles.professionalBullets}>
                  {exp.bullets?.map((b, idx) => (
                    <li key={idx} className={styles.professionalBullet}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className={styles.professionalSection}>
          <h2 className={styles.professionalSectionTitle}>
            Education
          </h2>
          <div className={styles.professionalList}>
            {education.map((edu, i) => (
              <div key={edu.id || i}>
                <div className={styles.professionalListItemHeader}>
                  <span>{edu.institution}</span>
                  <span className={styles.professionalListItemDate}>{edu.year}</span>
                </div>
                <div className={styles.professionalListItemSub}>{edu.degree}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className={styles.professionalSection}>
          <h2 className={styles.professionalSectionTitle}>
            Key Skills
          </h2>
          <p className={styles.professionalText}>
            {skills.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// One Pager Template
export const OnePagerTemplate = ({ data, styles: fontStyles }) => {
  const { contact = {}, summary = '', experience = [], education = [], skills = [] } = data;
  return (
    <div className={styles.onePagerContainer} style={{ fontFamily: fontStyles.fontFamily, fontSize: `${fontStyles.fontSize}px` }}>
      {/* Header */}
      <div className={styles.onePagerHeader}>
        <h1 className={styles.onePagerName}>{contact.name || 'Your Name'}</h1>
        <div className={styles.onePagerContactInfo}>
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>· {contact.phone}</span>}
          {contact.location && <span>· {contact.location}</span>}
          {contact.linkedin && <span>· {contact.linkedin}</span>}
          {contact.github && <span>· {contact.github}</span>}
        </div>
      </div>

      <div className={styles.onePagerContent}>
        {/* Main Column */}
        <div className={styles.onePagerMain}>
          {summary && (
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.onePagerSectionTitle}>Professional Summary</h2>
              <p className={styles.onePagerText}>{summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <h2 className={styles.onePagerSectionTitle}>Professional Experience</h2>
              {experience.map((exp, i) => (
                <div key={exp.id || i} className={styles.onePagerItem}>
                  <div className={styles.onePagerItemHeader}>
                    <span className={styles.onePagerRole}>{exp.role}</span>
                    <span className={styles.onePagerDate}>{exp.duration}</span>
                  </div>
                  <div className={styles.onePagerCompany}>{exp.company}</div>
                  <ul className={styles.onePagerBullets}>
                    {exp.bullets?.map((b, idx) => (
                      <li key={idx} className={styles.onePagerBullet}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className={styles.onePagerSidebar}>
          {education.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h2 className={styles.onePagerSectionTitle}>Education</h2>
              {education.map((edu, i) => (
                <div key={edu.id || i} className={styles.onePagerItem}>
                  <div className={styles.onePagerRole} style={{ fontSize: '0.85em' }}>{edu.degree}</div>
                  <div className={styles.onePagerCompany} style={{ fontSize: '0.8em', marginBottom: '0.1rem' }}>{edu.institution}</div>
                  <div className={styles.onePagerDate} style={{ fontSize: '0.75em' }}>{edu.year}</div>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h2 className={styles.onePagerSectionTitle}>Skills</h2>
              <ul className={styles.onePagerBullets} style={{ paddingLeft: '1rem' }}>
                {skills.map((skill, idx) => (
                  <li key={idx} className={styles.onePagerBullet} style={{ marginBottom: '0.25rem' }}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
