// Admin specific data
export const adminMenuItems = [
  { icon: "dashboard", label: "Dashboard", active: true },
  { icon: "supervisor_account", label: "Manage Teachers" },
  { icon: "groups", label: "Manage Students" },
  { icon: "book", label: "Manage Courses" },
  { icon: "analytics", label: "Reports" },
  { icon: "settings", label: "Settings" },
];

export const adminFooterItems = [
  { icon: "smart_toy", label: "AI Assistance" }
];

export const adminUser = {
  name: "Alex Morgan",  
  role: "System Administrator",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGYFou0KiLQduvDpVrVukFPGO-oipBBchzPH589jhUZPPaVHsNbQhldmzqux_NFJ0uzHeQh44AxrAG0VxEH3kqCROxpAoLinlovdD7HQN81LAMJj1_aczwVtFvSnOrDIcXaL7O2OzRUXVH4GxJkKIvQno4fQ1KhhdJVWvRTbyr2t9AOPKGg2S-hnfb-b3JBZcBDXlNE0FJ735Z1NH2KJq3EHO0InVpR-77RLL4JGgCxFTQeN7LpzJw1OwPVbDxKdvUSYJAOhnRLAD"
};

export const adminStats = [
  {
    title: "Total Teachers",
    value: "54",
    change: "+3 this month",
    changeColor: "text-green-500"
  },
  {
    title: "Total Students",
    value: "1,234",
    change: "+5% this semester",
    changeColor: "text-green-500"
  },
  {
    title: "Total Courses",
    value: "78",
    change: "+5 new courses",
    changeColor: "text-green-500"
  },
  {
    title: "Average Progress",
    value: "68%",
    change: "-2% this week",
    changeColor: "text-red-500"
  },
  {
    title: "Active Quizzes",
    value: "22",
    change: "Up from 18 last week",
    changeColor: "text-green-500"
  }
];

export const teacherData = [
  {
    id: 1,
    name: "Dr. Eleanor Vance",
    department: "Computer Science",
    courses: 3,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfPTeEMhMiED4qhmQAOotpYXPxbkz0JE7o_K1HptVxnuBK0HyuUSfhIm98TfaNun5NY90nyLCnQkvq2J2vUgeP450wvExuY5o9hjOaM-Pg7e-Oc-ozwfkYAAzNCK2iwrhZ3fyRKLXx8ixuezruT0auBF5fx6XQbKOWmqTHVkMQVi3JsPGBo8cUXOkn6XksgBKMLMyRBUx6pzCeuUAxWjyqQHxqStSoaYm4Fwc1LZ19b0rwJcldaBrC2XHz2OOTAya6ZP-9Ci2TtJ01"
  },
  {
    id: 2,
    name: "Dr. Ben Carter",
    department: "Mathematics",
    courses: 4,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR3UIICWRxpLXy2-ZT5DRGJgUPDD9B_OgP94OtA62iwt9wInk1CWtjneGF3WfNAlxi7PZP_fgkcnpjnqIhk-hKA7L1Hr89vPkL34QRw90UyiVJURBPO04Hgt4kpfcmfAIMTV5R0hASJLoXYNOtcqStVs6U-sbPCSMSy75h1Zv8ofrVUvANF53PXeiyHpsinX_6ApMlb1XRqUZn-0Kuqvp5vdNNDwi2d4ueRRhITL_rNZ0vG9H1AuDEF0JncW8r6KZnw3m8XRIyNq84"
  },
  {
    id: 3,
    name: "Dr. Sofia Rodriguez",
    department: "Physics",
    courses: 2,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA7cmsTtpmxprpoNL3hk2D9zfyG7nrHk8B8jhENZ2PMysq09baQmTguIB7YD7drdghlaf1QUmQNN_i3lc7T2mjXKuHsAvSKeR9QTit5wIekTh6OEunaCETlBI_O1gVlhpX_e5KjbUZh34JOzL5mZwf3cw86gQus9cn5VCmd62FSr6N5L6cwGg-1z_H7ANOuSLIB3gALrUy__CgsRdM1eQJMICwXEYYAkV2eDWc39OymB4LGvhGyMHXpVdNc3I26cUG3tXICiG2IIKu"
  }
];

export const teacherColumns = [
  {
    key: 'name',
    header: 'Teacher Name',
    render: (row) => (
      <div className="flex items-center gap-3">
        <img 
          className="h-8 w-8 rounded-full object-cover" 
          src={row.avatar} 
          alt={`Profile of ${row.name}`} 
        />
        <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
          {row.name}
        </span>
      </div>
    )
  },
  {
    key: 'department',
    header: 'Department'
  },
  {
    key: 'courses',
    header: 'Courses Taught'
  }
];

export const tableActions = [
  {
    icon: 'edit',
    color: 'text-primary dark:hover:text-primary',
    onClick: (row) => console.log('Edit:', row)
  },
  {
    icon: 'delete',
    color: 'text-red-500',
    onClick: (row) => console.log('Delete:', row)
  }
];