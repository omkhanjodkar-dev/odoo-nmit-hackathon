import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Select } from '../common/Select/Select';
import { saveEmployee } from '../../services/storage';
import './AddEmployeeModal.css';

export const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    employee_id: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: '',
    manager: 'Alex Morgan',
    location: 'San Francisco, USA',
    month_wage: '50000',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim()) {
      setError('Please enter first name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!formData.designation.trim()) {
      setError('Please enter job designation.');
      return;
    }

    setLoading(true);

    const wage = parseFloat(formData.month_wage) || 50000;
    const basic = wage * 0.5;
    const hra = basic * 0.5;
    const pf = basic * 0.12;

    const newEmp = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      employee_id: formData.employee_id,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      role: formData.role,
      is_verified: true,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
      department: formData.department,
      designation: formData.designation.trim(),
      manager: formData.manager,
      joining_date: new Date().toISOString().split('T')[0],
      location: formData.location,
      company: 'Dayflow Technologies Inc.',
      attendance_status: 'PRESENT',
      about: 'Newly onboarded employee.',
      job_love: 'Contributing to high impact organizational goals.',
      interests: 'Reading, technology, sports.',
      skills: ['Communication', 'Teamwork'],
      certifications: [],
      private_info: {
        dob: '1995-01-01',
        address: formData.location,
        personal_email: formData.email,
        gender: 'Not specified',
        nationality: 'American',
        marital_status: 'Single',
        bank_details: {
          bank_name: 'Chase Bank',
          account_number: '123456789012',
          ifsc_code: 'CHAS0001234',
        },
      },
      salary_structure: {
        month_wage: wage,
        yearly_wage: wage * 12,
        basic_salary: basic,
        hra: hra,
        standard_allowance: 4000,
        performance_bonus_percent: 10,
        lta_percent: 5,
        pf_percent: 12,
        professional_tax: 200,
        net_salary: Math.round(basic + hra + 4000 - pf - 200),
      },
      documents: [],
    };

    saveEmployee(newEmp);
    setLoading(false);
    onEmployeeAdded(newEmp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Employee Profile"
      subtitle="Add a new member to the Dayflow organizational directory"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Discard
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save Employee
          </Button>
        </>
      }
    >
      <form className="add-emp-form" onSubmit={handleSubmit}>
        {error && <div className="auth-alert error">{error}</div>}

        <div className="form-grid-2">
          <Input
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
          />
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'ADMIN_HR', label: 'Admin / HR Officer' },
            ]}
            required
          />
        </div>

        <div className="form-grid-2">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="e.g. Rachel"
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="e.g. Green"
          />
        </div>

        <div className="form-grid-2">
          <Input
            label="Work Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. rachel.green@dayflow.internal"
            required
          />
          <Input
            label="Mobile Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="form-grid-2">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Human Resources', label: 'Human Resources' },
              { value: 'Design', label: 'Design' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Operations', label: 'Operations' },
            ]}
            required
          />
          <Input
            label="Job Position / Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Senior Frontend Developer"
            required
          />
        </div>

        <div className="form-grid-2">
          <Input
            label="Reporting Manager"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            placeholder="e.g. Alex Morgan"
          />
          <Input
            label="Base Monthly Wage ($)"
            name="month_wage"
            type="number"
            value={formData.month_wage}
            onChange={handleChange}
            placeholder="50000"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;
