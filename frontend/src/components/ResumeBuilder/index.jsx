import React, { useState } from 'react';
import { ClassicTemplate, ModernSidebarTemplate, MinimalistTemplate, ProfessionalTemplate, OnePagerTemplate } from './ResumeTemplates';
import SectionEditor from './SectionEditor';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import styles from './ResumeBuilder.module.css';

const fontOptions = [
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Jakarta Sans' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "Georgia, serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Lora', serif", label: 'Lora' }
];

const sizeOptions = [
  { value: 12, label: 'Small (12px)' },
  { value: 14, label: 'Normal (14px)' },
  { value: 16, label: 'Large (16px)' }
];

const initialData = {
  contact: { name: 'Akash V', email: 'akash@example.com', phone: '+91 7904376352', location: 'Kerala', linkedin: 'linkedin.com/in/akash', github: 'github.com/akash' },
  summary: 'Enthusiastic developer focused on frontend architectures and modern design principles.',
  experience: [
    { id: '1', role: 'Software Engineer Intern', company: 'Gateway Solutions', duration: '2025', bullets: ['Built attendance tracking using OpenCV.', 'Refined state synchronization modules.'] }
  ],
  education: [
    { id: '1', degree: 'B.Sc. Information Technology', institution: 'VLB Janakiammal College', year: '2023 - 2026' }
  ],
  skills: ['React', 'JavaScript', 'Python', 'AWS', 'SQL']
};

const ResumeBuilder = ({ importedData, defaultTemplate = 'classic', onBack }) => {
  const [data, setData] = useState(importedData || initialData);
  const [template, setTemplate] = useState(defaultTemplate);
  const [fontStyles, setFontStyles] = useState({ fontFamily: "'Inter', sans-serif", fontSize: 14 });

  const updateContact = (field, value) => {
    setData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all resume data? This cannot be undone.')) {
      setData({
        contact: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
        summary: '',
        experience: [],
        education: [],
        skills: []
      });
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('resume-preview-area');
    if (!element) return;
    
    const opt = {
      margin:       0,
      filename:     `${(data.contact?.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={styles.container}>
      
      {/* Control Panel (Left) */}
      <div className={styles.controlPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Editor</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn btn-outline ${styles.backBtn}`} 
              onClick={handleClear}
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
            >
              Clear All
            </button>
            <button className={`btn btn-outline ${styles.backBtn}`} onClick={onBack}>
              Back
            </button>
          </div>
        </div>

        {/* Style Controls */}
        <div className={styles.styleControls}>
          <label className={styles.label}>Template</label>
          <div className={styles.templateButtons}>
            <button
              className={`btn ${styles.templateBtn} ${template === 'classic' ? styles.templateBtnActive : styles.templateBtnInactive}`}
              onClick={() => setTemplate('classic')}
            >
              Classic
            </button>
            <button
              className={`btn ${styles.templateBtn} ${template === 'modern' ? styles.templateBtnActive : styles.templateBtnInactive}`}
              onClick={() => setTemplate('modern')}
            >
              Modern Sidebar
            </button>
            <button
              className={`btn ${styles.templateBtn} ${template === 'minimalist' ? styles.templateBtnActive : styles.templateBtnInactive}`}
              onClick={() => setTemplate('minimalist')}
            >
              Minimalist
            </button>
            <button
              className={`btn ${styles.templateBtn} ${template === 'professional' ? styles.templateBtnActive : styles.templateBtnInactive}`}
              onClick={() => setTemplate('professional')}
            >
              Professional
            </button>
            <button
              className={`btn ${styles.templateBtn} ${template === 'one-pager' ? styles.templateBtnActive : styles.templateBtnInactive}`}
              onClick={() => setTemplate('one-pager')}
            >
              One Pager
            </button>
          </div>

          <div className={styles.fontControls}>
            <div>
              <label className={styles.selectLabel}>Font</label>
              <select
                value={fontStyles.fontFamily}
                onChange={e => setFontStyles(prev => ({ ...prev, fontFamily: e.target.value }))}
                className={styles.select}
              >
                {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.selectLabel}>Size</label>
              <select
                value={fontStyles.fontSize}
                onChange={e => setFontStyles(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                className={styles.select}
              >
                {sizeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formGroup}>
          <h3 className={styles.sectionTitle}>Contact Info</h3>
          {['name', 'email', 'phone', 'location', 'linkedin', 'github'].map(field => (
            <div key={field}>
              <label className={styles.inputLabel}>{field}</label>
              <input
                type="text"
                value={data.contact[field] || ''}
                onChange={e => updateContact(field, e.target.value)}
                className={styles.input}
              />
            </div>
          ))}

          {/* Summary Form */}
          <div className={styles.summaryGroup}>
            <label className={styles.inputLabel}>Summary</label>
            <textarea
              value={data.summary || ''}
              onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Section Editors */}
          <SectionEditor
            title="Experience"
            data={data.experience || []}
            fields={[
              { key: 'role', label: 'Job Title', type: 'text' },
              { key: 'company', label: 'Company', type: 'text' },
              { key: 'duration', label: 'Duration', type: 'text' },
              { key: 'bullets', label: 'Responsibilities (one per line)', type: 'textarea', isArray: true }
            ]}
            onChange={(index, key, val) => {
              const newExp = [...data.experience];
              newExp[index][key] = val;
              setData(prev => ({ ...prev, experience: newExp }));
            }}
            onAdd={() => setData(prev => ({ ...prev, experience: [...(prev.experience || []), { id: Date.now().toString(), role: '', company: '', duration: '', bullets: [] }] }))}
            onRemove={(index) => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }))}
          />

          <SectionEditor
            title="Education"
            data={data.education || []}
            fields={[
              { key: 'degree', label: 'Degree', type: 'text' },
              { key: 'institution', label: 'Institution', type: 'text' },
              { key: 'year', label: 'Year', type: 'text' }
            ]}
            onChange={(index, key, val) => {
              const newEdu = [...data.education];
              newEdu[index][key] = val;
              setData(prev => ({ ...prev, education: newEdu }));
            }}
            onAdd={() => setData(prev => ({ ...prev, education: [...(prev.education || []), { id: Date.now().toString(), degree: '', institution: '', year: '' }] }))}
            onRemove={(index) => setData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))}
          />

          <div className={styles.skillsGroup}>
            <label className={styles.inputLabel}>Skills (comma separated)</label>
            <textarea
              value={(data.skills || []).join(', ')}
              onChange={e => setData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              rows={2}
              className={styles.textarea}
            />
          </div>

          <div className={styles.actionButtons}>
            <button className={`btn btn-primary ${styles.actionBtn}`} onClick={handlePrint}>
              Download PDF
            </button>
            <button className={`btn btn-outline ${styles.actionBtn}`} onClick={async () => {
              try {
                const children = [
                  new Paragraph({
                    text: data.contact.name || 'Your Name',
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      data.contact.email ? new TextRun({ text: data.contact.email + ' | ' }) : null,
                      data.contact.phone ? new TextRun({ text: data.contact.phone + ' | ' }) : null,
                      data.contact.location ? new TextRun({ text: data.contact.location }) : null,
                    ].filter(Boolean),
                  }),
                  new Paragraph({ text: "" })
                ];

                if (data.summary) {
                  children.push(new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2 }));
                  children.push(new Paragraph({ text: data.summary }));
                  children.push(new Paragraph({ text: "" }));
                }

                if (data.experience && data.experience.length > 0) {
                  children.push(new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }));
                  data.experience.forEach(exp => {
                    children.push(new Paragraph({
                      children: [
                        new TextRun({ text: exp.role || 'Role', bold: true }),
                        new TextRun({ text: ` — ${exp.company || 'Company'}` }),
                        new TextRun({ text: `  (${exp.duration || 'Duration'})`, italics: true })
                      ]
                    }));
                    if (exp.bullets) {
                      exp.bullets.forEach(b => {
                        children.push(new Paragraph({ text: b, bullet: { level: 0 } }));
                      });
                    }
                    children.push(new Paragraph({ text: "" }));
                  });
                }

                if (data.education && data.education.length > 0) {
                  children.push(new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }));
                  data.education.forEach(edu => {
                    children.push(new Paragraph({
                      children: [
                        new TextRun({ text: edu.degree || 'Degree', bold: true }),
                        new TextRun({ text: ` — ${edu.institution || 'Institution'}` }),
                        new TextRun({ text: `  (${edu.year || 'Year'})`, italics: true })
                      ]
                    }));
                  });
                  children.push(new Paragraph({ text: "" }));
                }

                if (data.skills && data.skills.length > 0) {
                  children.push(new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }));
                  children.push(new Paragraph({ text: data.skills.join(', ') }));
                }

                const doc = new Document({
                  sections: [{ properties: {}, children }]
                });

                const blob = await Packer.toBlob(doc);
                saveAs(blob, `${(data.contact.name || 'resume').replace(/\s+/g, '_')}_resume.docx`);
              } catch (e) {
                console.error(e);
                alert('Failed to generate Word document.');
              }
            }}>
              Download Word
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel (Right) */}
      <div className={styles.previewPanel}>
        <div id="resume-preview-area" className={styles.previewArea}>
          {template === 'classic' && <ClassicTemplate data={data} styles={fontStyles} />}
          {template === 'modern' && <ModernSidebarTemplate data={data} styles={fontStyles} />}
          {template === 'minimalist' && <MinimalistTemplate data={data} styles={fontStyles} />}
          {template === 'professional' && <ProfessionalTemplate data={data} styles={fontStyles} />}
          {template === 'one-pager' && <OnePagerTemplate data={data} styles={fontStyles} />}
        </div>
      </div>

    </div>
  );
};

export default ResumeBuilder;
