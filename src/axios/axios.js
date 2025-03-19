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
      console.log("Departmanlar için API isteği yapılıyor...");
      const response = await api.get("/api/v1/Department/GetByTenant?tenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      console.log("Departmanlar API yanıtı:", response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Departmanlar API yanıtı geçersiz format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Departman verileri alınırken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
      // Hata durumunda boş dizi döndür, bu sayede uygulama çökmez
      return [];
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
      console.log("Roller için API isteği yapılıyor...");
      const response = await api.get("/api/v1/Role/GetByTenantId?TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      console.log("Roles API yanıtı:", response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Roles API yanıtı geçersiz format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Roller alınırken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
      // Hata durumunda boş dizi döndür, bu sayede uygulama çökmez
      return [];
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
      const updatedData = {
        userId: id,
        name: staffData.name,
        email: staffData.email,
        tenantId: staffData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3",
        bloodType: staffData.bloodType || "",
        birthDate: staffData.birthDate || null,
        phoneNumber: staffData.phoneNumber || "",
        tc: staffData.tc || "",
        departmentIdList: staffData.departmentId ? [staffData.departmentId] : [],
        roleId: staffData.roleId || ""
      };

      console.log("API'ye gönderilen personel verisi:", updatedData);
      
      const response = await api.put("/api/v1/User", updatedData);
      return response.data;
    } catch (error) {
      console.error("Personel güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("API yanıt hatası:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
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
  },

  getStaffById: async (id) => {
    try {
      console.log(`getStaffById fonksiyonu çağrıldı - ID: ${id}`);
      
      if (!id) {
        console.error("getStaffById için ID parametresi geçersiz:", id);
        throw new Error("Geçersiz kullanıcı ID'si");
      }
      
      // Endpoint yapısı değişimi
      const response = await api.get(`/api/v1/User/GetById`, {
        params: { 
          UserId: id,
          TenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
        }
      });
      
      console.log("getStaffById yanıtı:", response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("API yanıtı beklenen formatta değil:", response.data);
        throw new Error("API yanıt formatı geçersiz");
      }
    } catch (error) {
      console.error("Personel detayları alınırken hata oluştu:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
      throw error;
    }
  },
  
  getPagedStaff: async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return {
        data: response.data.data,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage
      };
    } catch (error) {
      console.error("Personel listesi alınırken hata oluştu:", error);
      throw error;
    }
  },
  
  resetPassword: async (email) => {
    try {
      console.log(`Şifre sıfırlama isteği gönderiliyor - Email: ${email}`);
      
      // Swagger dökümana göre doğru endpoint ve format
      const response = await api.get(`/api/v1/User/ResetPassword`, {
        params: { 
          Email: email 
        }
      });
      
      console.log("Şifre sıfırlama isteği gönderildi:", response.data);
      return {
        success: true,
        message: "Şifre sıfırlama maili gönderildi"
      };
    } catch (error) {
      console.error("Şifre sıfırlama maili gönderilirken hata oluştu:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
        console.error("API hata mesajı:", error.response.statusText);
      }
      throw error;
    }
  }
};

export default api;