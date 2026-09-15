// Single source of truth for "where does this role's dashboard live".
// Shared pages (post-attendance, multi-batch scan, 404 fallback, header logo, etc.)
// use this instead of hardcoding role checks, so adding/redirecting a role
// only needs to change here.
export const ROLE_DASHBOARD_PATHS = {
    admin: '/admin/dashboard',
    faculty: '/faculty/dashboard',
    guest_faculty: '/guest/dashboard',
    student: '/student/dashboard',
};

export const getDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] || '/';
