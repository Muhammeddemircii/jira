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
      console.log("Departman güncelleme başlatılıyor, gönderilen veri:", {
        departmentId,
        name: departmentData.name,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      });
      
      const response = await api.put(`/api/v1/Department`, {
        departmentId: departmentId, // API'ye uygun parametre ismi
        name: departmentData.name,
        tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Departman güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
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
  },
  
  deleteDepartment: async (departmentId) => {
    try {
      console.log(`Silme işlemi başlatılıyor. Department ID: ${departmentId}`);
      
      // İçeriği URL'in bir parçası olarak gönder, params kullanma
      const response = await api.delete(`/api/v1/Department?DepartmentId=${departmentId}`);
      
      console.log("Silme başarılı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Departman silme işlemi sırasında hata oluştu:", error);
      if (error.response) {
        console.log("API Yanıtı:", error.response);
        console.log("API yanıt verisi:", error.response.data);
        console.log("API yanıt durum kodu:", error.response.status);
      }
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
          ExitReason: exitReason,
          tenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
        }
      });
      console.log("Silme başarılı:", response.data);
      return response.data;
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