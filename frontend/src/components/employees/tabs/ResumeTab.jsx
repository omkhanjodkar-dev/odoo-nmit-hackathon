import React, { useState } from 'react';
import { Plus, X, Award, Sparkles, BookOpen, Heart, Activity } from 'lucide-react';

export default function ResumeTab({ employee, isEditing, onChangeField }) {
  const [newSkill, setNewSkill] = useState('');
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', year: '2024' });

  const skills = employee.skills || ['Problem Solving', 'React', 'Team Collaboration'];
  const certifications = employee.certifications || [];

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      onChangeField('skills', updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    onChangeField('skills', updated);
  };

  const handleAddCertification = (e) => {
    e.preventDefault();
    if (certForm.name.trim()) {
      const newCert = {
        id: `cert-${Date.now()}`,
        name: certForm.name.trim(),
        issuer: certForm.issuer.trim() || 'Accredited Institution',
        year: certForm.year || '2024',
      };
      onChangeField('certifications', [...certifications, newCert]);
      setCertForm({ name: '', issuer: '', year: '2024' });
      setIsAddingCert(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Bio & Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5">
            <BookOpen className="w-4 h-4 text-[#714B67]" />
            About Me / Summary
          </h3>
          {isEditing ? (
            <textarea
              rows={3}
              value={employee.about || ''}
              onChange={(e) => onChangeField('about', e.target.value)}
              placeholder="Write a brief professional summary..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {employee.about || 'Passionate team member contributing to enterprise excellence.'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* What I love about my job */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <h4 className="text-xs font-bold text-[#714B67] flex items-center gap-1.5 mb-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              What I Love About My Job
            </h4>
            {isEditing ? (
              <textarea
                rows={2}
                value={employee.whatILoveAboutJob || ''}
                onChange={(e) => onChangeField('whatILoveAboutJob', e.target.value)}
                placeholder="What motivates you at Dayflow?"
                className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              />
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{employee.whatILoveAboutJob || 'Solving challenging engineering problems with collaborative teammates.'}"
              </p>
            )}
          </div>

          {/* Interests & Hobbies */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Interests & Hobbies
            </h4>
            {isEditing ? (
              <textarea
                rows={2}
                value={employee.interestsAndHobbies || ''}
                onChange={(e) => onChangeField('interestsAndHobbies', e.target.value)}
                placeholder="Your hobbies outside work..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
              />
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                {employee.interestsAndHobbies || 'Chess, tech blogging, mountain biking, and open-source contribution.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Skills & Capabilities */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#714B67]" />
              Skills & Core Competencies
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Verified functional, technical, and domain proficiencies</p>
          </div>
        </div>

        {/* Skill Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#714B67] border border-purple-200/70 text-xs font-bold transition-transform hover:scale-105"
            >
              <span>{skill}</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-purple-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}

          {/* Add Skill Input */}
          {isEditing && (
            <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="+ Add skill..."
                className="px-3 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 w-28"
              />
              <button
                type="submit"
                className="p-1 rounded-lg bg-[#714B67] text-white hover:bg-[#5a3b52]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Certifications & Credentials */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#714B67]" />
              Professional Certifications
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Accredited certifications and industry credentials</p>
          </div>

          {isEditing && !isAddingCert && (
            <button
              type="button"
              onClick={() => setIsAddingCert(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-50 text-[#714B67] hover:bg-purple-100 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Certificate</span>
            </button>
          )}
        </div>

        {isAddingCert && (
          <form onSubmit={handleAddCertification} className="p-4 mb-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Add New Certification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Certificate Name (e.g. AWS Solutions Architect)"
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#714B67] sm:col-span-2"
                required
              />
              <input
                type="text"
                placeholder="Year (e.g. 2024)"
                value={certForm.year}
                onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCert(false)}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold bg-[#714B67] text-white hover:bg-[#5a3b52] rounded-lg"
              >
                Add
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certifications.map((cert, idx) => (
            <div
              key={cert.id || idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-[#714B67] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cert.name || cert}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {cert.issuer ? `${cert.issuer} • ` : ''}{cert.year || 'Verified Credential'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
