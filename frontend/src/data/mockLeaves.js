/**
 * Mock Leave Balances and Requests for Dayflow HRMS
 */

export const INITIAL_LEAVE_BALANCES = {
  "emp-1": { // Alex Morgan
    paidLeave: { total: 24, used: 2, available: 22 },
    sickLeave: { total: 12, used: 1, available: 11 },
    unpaidLeave: { total: 0, used: 0, available: 0 },
  },
  "emp-2": { // John Doe
    paidLeave: { total: 24, used: 4, available: 20 },
    sickLeave: { total: 12, used: 5, available: 7 },
    unpaidLeave: { total: 0, used: 1, available: 0 },
  },
  "emp-3": { // Jane Smith
    paidLeave: { total: 24, used: 3, available: 21 },
    sickLeave: { total: 12, used: 2, available: 10 },
    unpaidLeave: { total: 0, used: 0, available: 0 },
  },
  "emp-4": { // Rahul Kumar
    paidLeave: { total: 24, used: 6, available: 18 },
    sickLeave: { total: 12, used: 4, available: 8 },
    unpaidLeave: { total: 0, used: 0, available: 0 },
  },
  "emp-5": { // Priya Patel
    paidLeave: { total: 24, used: 1, available: 23 },
    sickLeave: { total: 12, used: 0, available: 12 },
    unpaidLeave: { total: 0, used: 0, available: 0 },
  },
};

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "req-1",
    employeeId: "emp-4", // Rahul Kumar
    employeeName: "Rahul Kumar",
    employeeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    department: "Sales & Marketing",
    leaveType: "Paid Time Off",
    startDate: "2025-10-22",
    endDate: "2025-10-24",
    totalDays: 3,
    reason: "Attending annual family wedding out of state.",
    status: "APPROVED", // 'PENDING' | 'APPROVED' | 'REJECTED'
    appliedAt: "2025-10-18T10:30:00Z",
    reviewedBy: "emp-1",
    reviewedByName: "Alex Morgan",
    reviewedAt: "2025-10-19T09:15:00Z",
    adminRemarks: "Approved. Handover confirmed with Priya.",
    attachment: null,
  },
  {
    id: "req-2",
    employeeId: "emp-2", // John Doe
    employeeName: "John Doe",
    employeeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Engineering",
    leaveType: "Sick Time Off",
    startDate: "2025-10-28",
    endDate: "2025-10-29",
    totalDays: 2,
    reason: "Scheduled minor dental surgery and doctor-recommended rest.",
    status: "PENDING",
    appliedAt: "2025-10-21T14:20:00Z",
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    adminRemarks: null,
    attachment: {
      fileName: "Dental_Clinic_Appointment_Doc.pdf",
      fileSize: "1.2 MB",
    },
  },
  {
    id: "req-3",
    employeeId: "emp-3", // Jane Smith
    employeeName: "Jane Smith",
    employeeAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    department: "Product Design",
    leaveType: "Paid Time Off",
    startDate: "2025-11-05",
    endDate: "2025-11-07",
    totalDays: 3,
    reason: "Attending Figma Config design conference in Singapore.",
    status: "PENDING",
    appliedAt: "2025-10-21T16:45:00Z",
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    adminRemarks: null,
    attachment: null,
  },
  {
    id: "req-4",
    employeeId: "emp-5", // Priya Patel
    employeeName: "Priya Patel",
    employeeAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Quality Assurance",
    leaveType: "Unpaid Leave",
    startDate: "2025-10-15",
    endDate: "2025-10-15",
    totalDays: 1,
    reason: "Personal urgent bank work in hometown.",
    status: "REJECTED",
    appliedAt: "2025-10-14T11:00:00Z",
    reviewedBy: "emp-1",
    reviewedByName: "Alex Morgan",
    reviewedAt: "2025-10-14T17:00:00Z",
    adminRemarks: "Please apply under Paid Time Off quota as you have 23 days available.",
    attachment: null,
  }
];
