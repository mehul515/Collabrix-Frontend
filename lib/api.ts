import axios from 'axios'
import { User } from "@/types"

const baseURL = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
})

// AUTH
export const signup = async (data: { fullName: string; email: string; password: string }) => {
  const res = await baseURL.post('/auth/signup', data)
  return res.data
}

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const res = await baseURL.post('/auth/verify', data)
  return res.data
}

export const login = async (data: { email: string; password: string }) => {
  const res = await baseURL.post('/auth/login', data)
  return res.data
}

export const getUserProfile = async () => {
  const token = localStorage.getItem("authToken")
  if (!token) return null

  const res = await baseURL.get("/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const getUserById = async (userId: number) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateUserProfile = async (user: Partial<User>) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.put("/api/user/profile/update", user, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// PROJECTS
export const createProject = async (projectData: any) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post('/api/projects', projectData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const getProject = async (projectId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const getOwnerProjects = async () => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get('/api/projects/owner', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateProject = async (projectId: string, projectData: any) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.put(`/api/projects/${projectId}`, projectData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteProject = async (projectId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.delete(`/api/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// MEMBERS
export const getProjectMembers = async (projectId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/members/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const getUserProjects = async () => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/members/user`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// TASKS

export const getTaskById = async (taskId: string) => {
  const token = localStorage.getItem("authToken")
  try {
    const res = await baseURL.get(`/api/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error: any) {
    console.error("Failed to fetch task:", error)
    throw error.response?.data || { message: "Failed to fetch task" }
  }
}

export const getProjectTasks = async (projectId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/tasks/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}


export const getMyTasks = async () => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/tasks/myTasks`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}


export const createTask = async (taskData: any) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post(`/api/tasks`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateTask = async (taskId: string, taskData: any) => {
  console.log(taskId);
  const token = localStorage.getItem("authToken")
  const res = await baseURL.put(`/api/tasks/${taskId}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteTask = async (taskId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.delete(`/api/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// INVITATION
export const sendProjectInvite = async (data:{projectId: string, invitedEmail: string, role: string}) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post(`/api/invites/send`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}


export const getUserPendingInvites = async () => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get("/api/invites", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const acceptInvite = async (inviteId: number) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post(`/api/invites/${inviteId}/accept`, null, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const declineInvite = async (inviteId: number) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post(`/api/invites/${inviteId}/decline`, null, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const getTaskComments = async (taskId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.get(`/api/comments/task/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const createComment = async (data: { taskId: string; content: string }) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.post("/api/comments", data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateComment = async (commentId: string, data: { content: string }) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.put(`/api/comments/${commentId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteComment = async (commentId: string) => {
  const token = localStorage.getItem("authToken")
  const res = await baseURL.delete(`/api/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
