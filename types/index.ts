export interface User {
  id?: string
  fullName: string
  email: string
  avatar?: string
  phoneNumber?: string
  address?: string
  bio?: string
}




export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Not Started" | "In Progress" | "Completed" | "On Hold";
  priority: "Low" | "Medium" | "High";
  progress: number;
  startDate: string;
  dueDate: string;
  budget?: string;
  client?: string;
  leader: ProjectMember;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  budget?: string;
  client?: string;
}
