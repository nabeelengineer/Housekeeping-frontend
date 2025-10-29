import api from './axios';

// Auth
export const signup = (payload) => api.post('/auth/signup', payload).then(r => r.data);
export const login = (payload) => api.post('/auth/login', payload).then(r => r.data);
export const requestOtp = (payload) => api.post('/auth/forgot/request-otp', payload).then(r => r.data);
export const verifyOtp = (payload) => api.post('/auth/forgot/verify', payload).then(r => r.data);

// Me / Employees
export const getMe = () => api.get('/employees/me').then(r => r.data);
export const listEmployees = () => api.get('/employees').then(r => r.data);
export const createEmployee = (payload) => api.post('/employees', payload).then(r => r.data);
export const setEmployeeRole = (employee_id, payload) => api.patch(`/employees/${employee_id}/role`, payload).then(r => r.data);
export const updateEmployee = (employee_id, payload) => api.patch(`/employees/${employee_id}`, payload).then(r => r.data);
export const deleteEmployee = (employee_id) => api.delete(`/employees/${employee_id}`).then(r => r.data);

// Departments / Categories
export const listDepartments = () => api.get('/departments').then(r => r.data);
export const createDepartment = (payload) => api.post('/departments', payload).then(r => r.data);
export const updateDepartment = (dept_id, payload) => api.patch(`/departments/${dept_id}`, payload).then(r => r.data);
export const deleteDepartment = (dept_id) => api.delete(`/departments/${dept_id}`).then(r => r.data);
export const listCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (payload) => api.post('/categories', payload).then(r => r.data);
export const updateCategory = (category_id, payload) => api.patch(`/categories/${category_id}`, payload).then(r => r.data);
export const deleteCategory = (category_id) => api.delete(`/categories/${category_id}`).then(r => r.data);

// Requests
export const createRequest = (payload) => api.post('/requests', payload).then(r => r.data);
export const listRequests = (params) => api.get('/requests', { params }).then(r => r.data);
export const getRequest = (id) => api.get(`/requests/${id}`).then(r => r.data);
export const assignRequest = (id, payload) => api.post(`/requests/${id}/assign`, payload).then(r => r.data);
export const updateStatus = (id, payload) => api.post(`/requests/${id}/status`, payload).then(r => r.data);

// Market (Buy/Sell)
export const listProducts = (params) => api.get('/market/products', { params }).then(r => r.data);
export const getProduct = (id) => api.get(`/market/products/${id}`).then(r => r.data);
export const createProduct = (formData) => api.post('/market/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const markProductSold = (id) => api.patch(`/market/products/${id}/mark-sold`).then(r => r.data);
export const deleteProduct = (id) => {
  console.log('Deleting product with ID:', id);
  return api.delete(`/market/products/${id}`)
    .then(response => {
      console.log('Delete successful:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error deleting product:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw error; // Re-throw to allow component to handle the error
    });
};
export const updateProduct = (id, payload) => api.patch(`/market/products/${id}`, payload).then(r => r.data);
export const expressInterest = (id) => api.post(`/market/products/${id}/interest`).then(r => r.data);
export const listComments = (id) => api.get(`/market/products/${id}/comments`).then(r => r.data);
export const addComment = (id, payload) => api.post(`/market/products/${id}/comments`, payload).then(r => r.data);
export const flagProduct = (id, payload) => api.post(`/market/products/${id}/flags`, payload).then(r => r.data);
// Admin moderation
export const listFlags = (params) => api.get('/market/admin/flags', { params }).then(r => r.data);
export const resolveFlag = (id, payload) => api.patch(`/market/admin/flags/${id}`, payload).then(r => r.data);
// Interests
export const getMyInterest = (id) => api.get(`/market/products/${id}/interest/my`).then(r => r.data);
export const listProductInterests = (id) => api.get(`/market/products/${id}/interests`).then(r => r.data);

// Vehicle Rental
export const listVehicles = (params) => api.get('/vehicles', { params }).then(r => r.data);
export const rentVehicle = (id) => api.post(`/vehicles/${id}/rent`).then(r => r.data);
export const returnVehicle = (id) => api.post(`/vehicles/${id}/return`).then(r => r.data);
export const myActiveRentals = () => api.get('/vehicles/my/active').then(r => r.data);
// Admin logs
export const listVehicleLogs = (params) => api.get('/vehicles/admin/logs', { params }).then(r => r.data);
export const exportVehicleLogsCsv = (params) => api.get('/vehicles/admin/logs.csv', { params, responseType: 'blob' }).then(r => r.data);
// Odometer
export const startOdometer = (rentalId, formData) =>
  api
    .post(`/vehicles/rentals/${rentalId}/odometer/start`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
export const endOdometer = (rentalId, formData) =>
  api
    .patch(`/vehicles/rentals/${rentalId}/odometer/end`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
// Monthly distance (admin)
export const listMonthlyDistance = (params) => api.get('/vehicles/admin/monthly-distance', { params }).then(r => r.data);
// Admin Vehicles CRUD
export const adminCreateVehicle = (formData) =>
  api
    .post('/vehicles/admin/vehicles', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
export const adminUpdateVehicle = (id, formData) =>
  api
    .patch(`/vehicles/admin/vehicles/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data);
export const adminDeleteVehicle = (id) => api.delete(`/vehicles/admin/vehicles/${id}`).then(r => r.data);

// Notifications
export const listNotifications = () => api.get('/notifications').then(r => r.data);
export const readNotification = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data);

// IT Assets Module
// Assets
export const listAssets = (params) => api.get('/assets', { params }).then(r => r.data);
export const createAsset = (payload) => api.post('/assets', payload).then(r => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then(r => r.data);
export const updateAsset = (id, payload) => api.patch(`/assets/${id}`, payload).then(r => r.data);

// Assignments
export const listAssignments = (params) => api.get('/assignments', { params }).then(r => r.data);
export const assignAsset = (payload) => api.post('/assignments', payload).then(r => r.data);
export const returnAssignment = (id, payload) => api.post(`/assignments/${id}/return`, payload).then(r => r.data);
export const updateAssignment = (id, payload) => api.patch(`/assignments/${id}`, payload).then(r => r.data);
// Admin logs (IT)
export const listAdminLogs = (params) => api.get('/assignments/admin/logs', { params }).then(r => r.data);

// Employee view
export const myAssets = () => api.get('/me/assets').then(r => r.data);
// Admin assets summary
export const getAssetsSummary = () => api.get('/assets/admin/summary').then(r => r.data);
