import api from './axios';

// Auth
export const signup = (payload) => api.post('/api/auth/signup', payload).then(r => r.data);
export const login = (payload) => api.post('/api/auth/login', payload).then(r => r.data);
export const requestOtp = (payload) => api.post('/api/auth/forgot/request-otp', payload).then(r => r.data);
export const verifyOtp = (payload) => api.post('/api/auth/forgot/verify', payload).then(r => r.data);

// Me / Employees
export const getMe = () => api.get('/api/employees/me').then(r => r.data);
export const listEmployees = () => api.get('/api/employees').then(r => r.data);
export const createEmployee = (payload) => api.post('/api/employees', payload).then(r => r.data);
export const setEmployeeRole = (employee_id, payload) => api.patch(`/api/employees/${employee_id}/role`, payload).then(r => r.data);
export const updateEmployee = (employee_id, payload) => api.patch(`/api/employees/${employee_id}`, payload).then(r => r.data);
export const deleteEmployee = (employee_id) => api.delete(`/api/employees/${employee_id}`).then(r => r.data);

// Departments / Categories
export const listDepartments = () => api.get('/api/departments').then(r => r.data);
export const createDepartment = (payload) => api.post('/api/departments', payload).then(r => r.data);
export const updateDepartment = (dept_id, payload) => api.patch(`/api/departments/${dept_id}`, payload).then(r => r.data);
export const deleteDepartment = (dept_id) => api.delete(`/api/departments/${dept_id}`).then(r => r.data);
export const listCategories = () => api.get('/api/categories').then(r => r.data);
export const createCategory = (payload) => api.post('/api/categories', payload).then(r => r.data);
export const updateCategory = (category_id, payload) => api.patch(`/api/categories/${category_id}`, payload).then(r => r.data);
export const deleteCategory = (category_id) => api.delete(`/api/categories/${category_id}`).then(r => r.data);

// Requests
export const createRequest = (payload) => api.post('/api/requests', payload).then(r => r.data);
export const listRequests = (params) => api.get('/api/requests', { params }).then(r => r.data);
export const getRequest = (id) => api.get(`/api/requests/${id}`).then(r => r.data);
export const assignRequest = (id, payload) => api.post(`/api/requests/${id}/assign`, payload).then(r => r.data);
export const updateStatus = (id, payload) => api.post(`/api/requests/${id}/status`, payload).then(r => r.data);

// Market (Buy/Sell)
export const listProducts = (params) => api.get('/api/market/products', { params }).then(r => r.data);
export const getProduct = (id) => api.get(`/api/market/products/${id}`).then(r => r.data);
export const createProduct = (formData) => api.post('/api/market/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const markProductSold = (id) => api.patch(`/api/market/products/${id}/mark-sold`).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/api/market/products/${id}`).then(r => r.data);
export const updateProduct = (id, payload) => api.patch(`/api/market/products/${id}`, payload).then(r => r.data);
export const expressInterest = (id) => api.post(`/api/market/products/${id}/interest`).then(r => r.data);
export const listComments = (id) => api.get(`/api/market/products/${id}/comments`).then(r => r.data);
export const addComment = (id, payload) => api.post(`/api/market/products/${id}/comments`, payload).then(r => r.data);
export const flagProduct = (id, payload) => api.post(`/api/market/products/${id}/flags`, payload).then(r => r.data);
// Admin moderation
export const listFlags = (params) => api.get('/api/market/admin/flags', { params }).then(r => r.data);
export const resolveFlag = (id, payload) => api.patch(`/api/market/admin/flags/${id}`, payload).then(r => r.data);
// Interests
export const getMyInterest = (id) => api.get(`/api/market/products/${id}/interest/my`).then(r => r.data);
export const listProductInterests = (id) => api.get(`/api/market/products/${id}/interests`).then(r => r.data);

// Vehicle Rental
export const listVehicles = (params) => api.get('/api/vehicles', { params }).then(r => r.data);
export const rentVehicle = (id) => api.post(`/api/vehicles/${id}/rent`).then(r => r.data);
export const returnVehicle = (id) => api.post(`/api/vehicles/${id}/return`).then(r => r.data);
export const myActiveRentals = () => api.get('/api/vehicles/my/active').then(r => r.data);
// Admin logs
export const listVehicleLogs = (params) => api.get('/api/vehicles/admin/logs', { params }).then(r => r.data);
export const exportVehicleLogsCsv = (params) => api.get('/api/vehicles/admin/logs.csv', { params, responseType: 'blob' }).then(r => r.data);

// Notifications
export const listNotifications = () => api.get('/api/notifications').then(r => r.data);
export const readNotification = (id) => api.patch(`/api/notifications/${id}/read`).then(r => r.data);

// IT Assets Module
// Assets
export const listAssets = (params) => api.get('/api/assets', { params }).then(r => r.data);
export const createAsset = (payload) => api.post('/api/assets', payload).then(r => r.data);
export const getAsset = (id) => api.get(`/api/assets/${id}`).then(r => r.data);
export const updateAsset = (id, payload) => api.patch(`/api/assets/${id}`, payload).then(r => r.data);

// Assignments
export const listAssignments = (params) => api.get('/api/assignments', { params }).then(r => r.data);
export const assignAsset = (payload) => api.post('/api/assignments', payload).then(r => r.data);
export const returnAssignment = (id, payload) => api.post(`/api/assignments/${id}/return`, payload).then(r => r.data);
export const updateAssignment = (id, payload) => api.patch(`/api/assignments/${id}`, payload).then(r => r.data);
// Admin logs (IT)
export const listAdminLogs = (params) => api.get('/api/assignments/admin/logs', { params }).then(r => r.data);

// Employee view
export const myAssets = () => api.get('/api/me/assets').then(r => r.data);
// Admin assets summary
export const getAssetsSummary = () => api.get('/api/assets/admin/summary').then(r => r.data);
