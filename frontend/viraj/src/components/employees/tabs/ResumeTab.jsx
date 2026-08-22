import React, { useState } from 'react';
import { Card } from '../../common/Card/Card';
import './ResumeTab.css';

export const ResumeTab = ({
  employee,
  isEditing,
  onChangeField,
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);
  const [newCertInput, setNewCertInput] = useState('');
  const [showAddCertInput, setShowAddCertInput] = useState(false);

  const skills = employee.skills || [];
  const certifications = employee.certifications || [];

  // Skill Add/Remove handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      const updated = [...skills, newSkillInput.trim()];
      onChangeField('skills', updated);
      setNewSkillInput('');
      setShowAddSkillInput(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    onChangeField('skills', updated);
  };

  // Cert Add/Remove handlers
  const handleAddCert = (e) => {
    e.preventDefault();
    if (newCertInput.trim() && !certifications.includes(newCertInput.trim())) {
      const updated = [...certifications, newCertInput.trim()];
      onChangeField('certifications', updated);
      setNewCertInput('');
      setShowAddCertInput(false);
    }
  };

  const handleRemoveCert = (certToRemove) => {
    const updated = certifications.filter((c) => c !== certToRemove);
    onChangeField('certifications', updated);
  };

  return (
    <div className="resume-tab-layout">
      {/* About & Highlights Card */}
      <Card
        header={<h3 className="section-card-title">📝 About & Work Preferences</h3>}
        className="resume-card"
      >
        <div className="resume-field-group">
          <label className="field-label">About Me</label>
          {isEditing ? (
            <textarea
              className="resume-textarea"
              rows={3}
              value={employee.about || ''}
              onChange={(e) => onChangeField('about', e.target.value)}
              placeholder="Write a brief professional summary..."
            />
          ) : (
            <p className="field-value-text">{employee.about || 'No description added yet.'}</p>
          )}
        </div>

        <div className="resume-field-group">
          <label className="field-label">What I Love About My Job</label>
          {isEditing ? (
            <textarea
              className="resume-textarea"
              rows={2}
              value={employee.job_love || ''}
              onChange={(e) => onChangeField('job_love', e.target.value)}
              placeholder="What motivates you at work..."
            />
          ) : (
            <p className="field-value-text">{employee.job_love || 'No response provided.'}</p>
          )}
        </div>

        <div className="resume-field-group">
          <label className="field-label">Interests & Hobbies</label>
          {isEditing ? (
            <input
              type="text"
              className="resume-text-input"
              value={employee.interests || ''}
              onChange={(e) => onChangeField('interests', e.target.value)}
              placeholder="e.g. Trail running, chess, photography"
            />
          ) : (
            <p className="field-value-text">{employee.interests || 'No interests added.'}</p>
          )}
        </div>
      </Card>

      {/* Skills & Certifications Card */}
      <div className="skills-certs-grid">
        {/* Dynamic Skill Pills */}
        <Card
          header={
            <div className="skills-header-row">
              <h3 className="section-card-title">⚡ Skills & Expertise</h3>
              <span className="pill-count-text">{skills.length} skills</span>
            </div>
          }
          className="resume-card"
        >
          <div className="skill-pills-wrap">
            {skills.map((skill) => (
              <span key={skill} className="skill-pill">
                <span>{skill}</span>
                {isEditing && (
                  <button
                    type="button"
                    className="skill-pill-remove-btn"
                    onClick={() => handleRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}

            {isEditing && !showAddSkillInput && (
              <button
                type="button"
                className="add-pill-trigger-btn"
                onClick={() => setShowAddSkillInput(true)}
              >
                + Add Skill
              </button>
            )}

            {isEditing && showAddSkillInput && (
              <form className="add-pill-inline-form" onSubmit={handleAddSkill}>
                <input
                  type="text"
                  className="add-pill-inline-input"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Docker"
                  autoFocus
                />
                <button type="submit" className="add-pill-submit-btn">
                  Add
                </button>
                <button
                  type="button"
                  className="add-pill-cancel-btn"
                  onClick={() => setShowAddSkillInput(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </Card>

        {/* Certifications List */}
        <Card
          header={<h3 className="section-card-title">🎓 Certifications & Accreditations</h3>}
          className="resume-card"
        >
          <div className="certs-list">
            {certifications.length === 0 ? (
              <p className="field-value-text muted">No certifications listed.</p>
            ) : (
              certifications.map((cert) => (
                <div key={cert} className="cert-item">
                  <span className="cert-icon">📜</span>
                  <span className="cert-text">{cert}</span>
                  {isEditing && (
                    <button
                      type="button"
                      className="cert-remove-btn"
                      onClick={() => handleRemoveCert(cert)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}

            {isEditing && !showAddCertInput && (
              <button
                type="button"
                className="add-cert-trigger-btn"
                onClick={() => setShowAddCertInput(true)}
              >
                + Add Certification
              </button>
            )}

            {isEditing && showAddCertInput && (
              <form className="add-pill-inline-form" onSubmit={handleAddCert}>
                <input
                  type="text"
                  className="add-pill-inline-input"
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  placeholder="e.g. Certified Scrum Master"
                  autoFocus
                />
                <button type="submit" className="add-pill-submit-btn">
                  Add
                </button>
                <button
                  type="button"
                  className="add-pill-cancel-btn"
                  onClick={() => setShowAddCertInput(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResumeTab;
