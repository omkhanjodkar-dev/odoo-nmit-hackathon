import React from 'react';
import { Table } from '../common/Table/Table';
import { Button } from '../common/Button/Button';
import './SalaryStructureTable.css';

export const SalaryStructureTable = ({
  employees = [],
  onConfigureEmployee,
}) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, row) => (
        <div className="table-emp-profile-cell">
          <img
            src={row.avatar_url}
            alt=""
            className="table-emp-profile-avatar"
            loading="lazy"
          />
          <div className="table-emp-profile-info">
            <span className="emp-name">{row.first_name} {row.last_name}</span>
            <span className="emp-designation">{row.designation}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
    },
    {
      title: 'Monthly Wage',
      key: 'wage',
      render: (_, row) => (
        <span className="payroll-table-val">
          {formatCurrency(row.salary_structure?.month_wage)}
        </span>
      ),
    },
    {
      title: 'Basic Salary (50%)',
      key: 'basic',
      render: (_, row) => (
        <span className="payroll-table-val">
          {formatCurrency(row.salary_structure?.basic_salary)}
        </span>
      ),
    },
    {
      title: 'HRA (50%)',
      key: 'hra',
      render: (_, row) => (
        <span className="payroll-table-val">
          {formatCurrency(row.salary_structure?.hra)}
        </span>
      ),
    },
    {
      title: 'PF (12%)',
      key: 'pf',
      render: (_, row) => {
        const pf = (row.salary_structure?.basic_salary || 0) * 0.12;
        return <span className="payroll-table-deduction">-{formatCurrency(pf)}</span>;
      },
    },
    {
      title: 'Net Monthly',
      key: 'net',
      render: (_, row) => (
        <span className="payroll-table-net">
          {formatCurrency(row.salary_structure?.net_salary)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigureEmployee(row)}
        >
          ⚙️ Configure
        </Button>
      ),
    },
  ];

  return (
    <div className="salary-structure-table-wrap">
      <Table
        columns={columns}
        data={employees}
        emptyMessage="No salary structures found."
      />
    </div>
  );
};

export default SalaryStructureTable;
