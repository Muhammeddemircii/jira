import axios from "axios";

const API_URL = "http://api.ledasistan.com";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user-token");
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/v1/User/Login", { email, password });
      
      if (response.data.data && response.data.data.accessToken) {
        const { user, accessToken } = response.data.data;
        
        localStorage.setItem("user-token", accessToken);
        localStorage.setItem("user-name", user.name);
        localStorage.setItem("tenant-name", user.tenantName);
        localStorage.setItem("user-role", user.roleName);
        localStorage.setItem("user-type-id", user.userTypeId);
        const departmentIdList = user.userDepartmentsResponse.map(department => department.departmentId);
        localStorage.setItem("user-department-id-list", JSON.stringify(departmentIdList));
        localStorage.setItem("user-data", JSON.stringify(user));
        
        return { success: true, user, token: accessToken };
      } else {
        throw new Error("Giriş başarısız");
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Giriş başarısız");
      } else {
        throw error;
      }
    }
  },
};

export const departmentService = {
  getDepartments: async () => {
    try {
      const response = await api.get("/api/v1/Department/GetByTenant?tenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      return response.data.data;
    } catch (error) {
      console.error("Departman verileri alınırken hata oluştu:", error);
      throw error;
    }
  },

  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await api.put(`/api/v1/Department/`, {
        ...departmentData,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Departman güncellenirken hata oluştu:", error);
      throw error;
    }
  },

  addDepartment: async (name) => {
    try {
      const response = await api.post(`/api/v1/Department/`, {
        name,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Departman eklenirken hata oluştu:", error);
      throw error;
    }
  }
};


export const tasksServices = {
  getTasks: async () => {
    try {
      const response = await api.get("/api/v1/Task/GetByTenantId?TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Task verileri alınırken hata oluştu:", error);
      throw error;
    }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get("/api/v1/Duration/GetByTenant?TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Kategori çekerken hata oluştu:", error);
      throw error;
    }
  },
  
  createTask: async (formData) => {
    try {
      const response = await api.post("/api/v1/Task", formData, {
        withCredentials: true,
      });
      
      console.log("Yeni task başarıyla eklendi:", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Task eklenirken hata oluştu:", error);
      
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
      }
      throw error;
    }
  },
};

export const roleService = {
  getRoles: async () => {
    try {
      const response = await api.get("/api/v1/User/GetByTenantId?TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      return response.data.data;
    } catch (error) {
      console.error("role alınırken hata oluştu", error);
      throw error;
    }
  },
  

  getPagedRoles: async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return {
        data: response.data.data,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage
      };
    } catch (error) {
      console.error("Sayfalı roller alınırken hata oluştu", error);
      throw error;
    }
  }
};

export const staffService = {
  addStaff: async (staffData) => {
    try {
      const response = await api.post("/api/v1/User", staffData);
      return response.data;
    } catch (error) {
      console.error("Personel eklenirken hata oluştu:", error);
      throw error;
    }
  },
  
  updateStaff: async (id, staffData) => {
    try {
      const updatedData = { ...staffData, id };
      const response = await api.put("/api/v1/User", updatedData);
      return response.data;
    } catch (error) {
      console.error("Personel güncellenirken hata oluştu:", error);
      throw error;
    }
  },
  
  deleteUser: async (id, exitReason) => {
    try {
      const response = await api.delete(`/api/v1/User`, {
        params: {
          UserId: id,
          ExitReason: exitReason
        }
      });
      console.log("Silme başarılı:", response.data);
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
      if (error.response) {
        console.log("API Yanıtı:", error.response);
      }
      throw error;
    }
  }
};

export default api;