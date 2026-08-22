import React, { useState } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import './SecurityDocumentsTab.css';

export const SecurityDocumentsTab = ({
  employee,
  isEditing,
  onChangeField,
}) => {
  const documents = employee.documents || [];
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [docName, setDocName] = useState('');

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (docName.trim()) {
      const newDoc = {
        id: `doc-${Date.now().toString().slice(-4)}`,
        name: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
        size: '1.4 MB',
        type: 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
      };
      onChangeField('documents', [...documents, newDoc]);
      setDocName('');
      setShowUploadInput(false);
    }
  };

  const handleRemoveDoc = (docId) => {
    onChangeField('documents', documents.filter((d) => d.id !== docId));
  };

  return (
    <div className="security-docs-layout">
      <Card
        header={
          <div className="docs-header-row">
            <h3 className="section-card-title">📁 Verified Employee Documents & Records</h3>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadInput(!showUploadInput)}
              >
                {showUploadInput ? 'Cancel' : '+ Upload Document'}
              </Button>
            )}
          </div>
        }
        className="security-card"
      >
        {/* Upload Inline Form */}
        {showUploadInput && (
          <form className="doc-upload-inline-form" onSubmit={handleUploadSubmit}>
            <div className="upload-box">
              <span className="upload-box-icon">📤</span>
              <p className="upload-box-title">Upload Official Document</p>
              <input
                type="text"
                className="doc-name-input"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name (e.g. Driver_License_Scan.pdf)"
                required
                autoFocus
              />
              <div className="upload-btn-group">
                <Button type="submit" variant="primary" size="sm">
                  Attach File
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadInput(false)}
                >
                  Discard
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Documents Grid */}
        <div className="docs-grid">
          {documents.length === 0 ? (
            <p className="field-value-text muted">No documents uploaded for this employee yet.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="doc-item-card">
                <div className="doc-item-icon">
                  {doc.type === 'image' ? '🖼️' : '📄'}
                </div>
                <div className="doc-item-info">
                  <span className="doc-name" title={doc.name}>
                    {doc.name}
                  </span>
                  <div className="doc-meta">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>Uploaded {doc.uploadDate}</span>
                  </div>
                </div>
                <div className="doc-item-actions">
                  <a
                    href="#download"
                    className="doc-action-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${doc.name}...`);
                    }}
                    title="Download"
                  >
                    ⬇️
                  </a>
                  {isEditing && (
                    <button
                      type="button"
                      className="doc-delete-btn"
                      onClick={() => handleRemoveDoc(doc.id)}
                      title="Delete document"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityDocumentsTab;
