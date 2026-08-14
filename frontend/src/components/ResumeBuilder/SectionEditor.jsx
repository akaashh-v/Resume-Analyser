import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SectionEditor.module.css';

const SectionEditor = ({ title, data, fields, onChange, onAdd, onRemove }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button onClick={onAdd} className={styles.addButton}>
          + Add
        </button>
      </div>

      <div className={styles.list}>
        <AnimatePresence>
          {data.map((item, index) => (
            <motion.div 
              key={item.id || index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className={styles.item}
            >
              <button 
                onClick={() => onRemove(index)}
                className={styles.removeButton}
                title="Remove"
              >
                &times;
              </button>
              
              <div className={styles.fieldGroup}>
                {fields.map(field => (
                  <div key={field.key}>
                    <label className={styles.label}>
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.isArray ? (item[field.key] || []).join('\n') : (item[field.key] || '')}
                        onChange={(e) => {
                          const val = field.isArray ? e.target.value.split('\n') : e.target.value;
                          onChange(index, field.key, val);
                        }}
                        rows={3}
                        className={styles.textarea}
                      />
                    ) : (
                      <input
                        type="text"
                        value={item[field.key] || ''}
                        onChange={(e) => onChange(index, field.key, e.target.value)}
                        className={styles.input}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {data.length === 0 && (
          <div className={styles.emptyState}>
            No {title.toLowerCase()} added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionEditor;
