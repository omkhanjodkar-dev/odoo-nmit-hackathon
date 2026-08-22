import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { Table } from '../common/Table/Table';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import './EmployeeTable.css';

export const EmployeeTable = ({ employees = [] }) => {
  const { navigate } = useRouter();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="present" showDot size="sm">Present</Badge>;
      case 'LEAVE':
        return <Badge variant="leave" icon="✈️" size="sm">On Leave</Badge>;
      case 'ABSENT':
      default:
        return <Badge variant="absent" showDot size="sm">Absent</Badge>;
    }
  };

  const columns = [
    {
      title: 'Employee',
      key: 'name',
      render: (_, row) => (
        <div className="table-employee-cell">
          <img
            src={row.avatar_url}
            alt=""
            className="table-employee-avatar"
            loading="lazy"
          />
          <div className="table-employee-info">
            <span className="table-employee-name">
              {row.first_name} {row.last_name}
            </span>
            <span className="table-employee-id">{row.employee_id}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Designation & Dept',
      key: 'designation',
      render: (_, row) => (
        <div className="table-dept-cell">
          <span className="table-designation-text">{row.designation}</span>
          <span className="table-dept-text">{row.department}</span>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, row) => (
        <div className="table-contact-cell">
          <span className="table-email-text">{row.email}</span>
          <span className="table-phone-text">{row.phone || '--'}</span>
        </div>
      ),
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      render: (val) => val || 'None',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => getStatusBadge(row.attendance_status),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/employees/${row.id}`);
          }}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={employees}
      onRowClick={(row) => navigate(`/employees/${row.id}`)}
      emptyMessage="No employees matched your criteria."
    />
  );
};

export default EmployeeTable;
