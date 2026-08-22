import React from 'react';
import { Card } from '../../common/Card/Card';
import { Input } from '../../common/Input/Input';
import { Select } from '../../common/Select/Select';
import './PrivateInfoTab.css';

export const PrivateInfoTab = ({
  employee,
  isEditing,
  onChangeField,
}) => {
  const privateInfo = employee.private_info || {};
  const bankDetails = privateInfo.bank_details || {};

  const handlePrivateChange = (field, value) => {
    onChangeField('private_info', {
      ...privateInfo,
      [field]: value,
    });
  };

  const handleBankChange = (field, value) => {
    onChangeField('private_info', {
      ...privateInfo,
      bank_details: {
        ...bankDetails,
        [field]: value,
      },
    });
  };

  return (
    <div className="private-info-layout">
      {/* Personal Identity & Demographics */}
      <Card
        header={<h3 className="section-card-title">👤 Personal Details & Demographics</h3>}
        className="private-card"
      >
        <div className="form-grid-3">
          <div className="readonly-or-input">
            <label className="field-label">Date of Birth</label>
            {isEditing ? (
              <Input
                type="date"
                value={privateInfo.dob || ''}
                onChange={(e) => handlePrivateChange('dob', e.target.value)}
              />
            ) : (
              <p className="field-value-text">{privateInfo.dob || 'Not specified'}</p>
            )}
          </div>

          <div className="readonly-or-input">
            <label className="field-label">Gender</label>
            {isEditing ? (
              <Select
                value={privateInfo.gender || ''}
                onChange={(e) => handlePrivateChange('gender', e.target.value)}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Non-Binary', label: 'Non-Binary' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
              />
            ) : (
              <p className="field-value-text">{privateInfo.gender || 'Not specified'}</p>
            )}
          </div>

          <div className="readonly-or-input">
            <label className="field-label">Marital Status</label>
            {isEditing ? (
              <Select
                value={privateInfo.marital_status || ''}
                onChange={(e) => handlePrivateChange('marital_status', e.target.value)}
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' },
                ]}
              />
            ) : (
              <p className="field-value-text">{privateInfo.marital_status || 'Single'}</p>
            )}
          </div>
        </div>

        <div className="form-grid-2" style={{ marginTop: 'var(--space-4)' }}>
          <div className="readonly-or-input">
            <label className="field-label">Personal Email</label>
            {isEditing ? (
              <Input
                type="email"
                value={privateInfo.personal_email || ''}
                onChange={(e) => handlePrivateChange('personal_email', e.target.value)}
                placeholder="personal.email@example.com"
              />
            ) : (
              <p className="field-value-text">{privateInfo.personal_email || 'Not provided'}</p>
            )}
          </div>

          <div className="readonly-or-input">
            <label className="field-label">Nationality</label>
            {isEditing ? (
              <Input
                type="text"
                value={privateInfo.nationality || ''}
                onChange={(e) => handlePrivateChange('nationality', e.target.value)}
                placeholder="e.g. American"
              />
            ) : (
              <p className="field-value-text">{privateInfo.nationality || 'American'}</p>
            )}
          </div>
        </div>

        <div className="readonly-or-input" style={{ marginTop: 'var(--space-4)' }}>
          <label className="field-label">Residing Address</label>
          {isEditing ? (
            <Input
              type="text"
              value={privateInfo.address || ''}
              onChange={(e) => handlePrivateChange('address', e.target.value)}
              placeholder="Full residential street address..."
            />
          ) : (
            <p className="field-value-text">{privateInfo.address || 'Address not listed'}</p>
          )}
        </div>
      </Card>

      {/* Bank Account Details */}
      <Card
        header={<h3 className="section-card-title">🏦 Bank & Payroll Account Details</h3>}
        className="private-card"
      >
        <div className="form-grid-3">
          <div className="readonly-or-input">
            <label className="field-label">Bank Name</label>
            {isEditing ? (
              <Input
                type="text"
                value={bankDetails.bank_name || ''}
                onChange={(e) => handleBankChange('bank_name', e.target.value)}
                placeholder="e.g. Chase Bank"
              />
            ) : (
              <p className="field-value-text font-semibold">{bankDetails.bank_name || 'Chase Bank'}</p>
            )}
          </div>

          <div className="readonly-or-input">
            <label className="field-label">Account Number</label>
            {isEditing ? (
              <Input
                type="text"
                value={bankDetails.account_number || ''}
                onChange={(e) => handleBankChange('account_number', e.target.value)}
                placeholder="987654321012"
              />
            ) : (
              <p className="field-value-text font-mono">
                {bankDetails.account_number
                  ? `•••• •••• ${bankDetails.account_number.slice(-4)}`
                  : '•••• •••• 1012'}
              </p>
            )}
          </div>

          <div className="readonly-or-input">
            <label className="field-label">IFSC / Swift / Routing Code</label>
            {isEditing ? (
              <Input
                type="text"
                value={bankDetails.ifsc_code || ''}
                onChange={(e) => handleBankChange('ifsc_code', e.target.value)}
                placeholder="CHAS0001234"
              />
            ) : (
              <p className="field-value-text font-mono">{bankDetails.ifsc_code || 'CHAS0001234'}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivateInfoTab;
