import axios from "axios";

const API_URL = "https://api.ledasistan.com";

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
        localStorage.setItem("tenant-grup-id", "1160fc5a-dd69-452e-83af-da3510419b90");
        const departmentIdList = user.userDepartmentsResponse.map(department => department.departmentId);
        localStorage.setItem("user-department-id-list", JSON.stringify(departmentIdList));
        localStorage.setItem("user-data", JSON.stringify(user));
        localStorage.setItem("user-id", user.id);

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
      return [];
    }
  },

  getDepartmentTasks: async (tenantId) => {
    try {
      console.log("Departman görevleri için API isteği yapılıyor...");
      const response = await api.get(`/api/v1/Department/GroupTasksByDepartmen?TenantId=${tenantId}`);
      console.log("Departman görevleri API yanıtı:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Departman görevleri API yanıtı geçersiz format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Departman görevleri alınırken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
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
        departmentId: departmentId,
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
  getTasks: async (parameters = {}) => {
    try {
      const url = '/api/v1/Task';
      console.log(`API çağrısı yapılıyor: ${url}`);
      
      const response = await api.get(url, { params: parameters });
      
      console.log("API yanıtı:", response);
      
      return response.data.data || [];
    } catch (error) {
      console.error("Görevler alınırken hata:", error);
      throw error;
    }
  },

  getTasksPaged: async (parameters = {}) => {
    try {
      const defaultParams = {
        PageNumber: 1,
        PageSize: 5,
        TenantId: 'c35a6a8e-204b-4791-ba3b-08dd2c05ebe3' 
      };
      
      const params = { ...defaultParams, ...parameters };
      
      const url = '/api/v1/Task/GetPaged';
      
      console.log(`API çağrısı yapılıyor: ${url}`, params);
      
      const token = localStorage.getItem("user-token");
      console.log("Token durumu:", token ? "Token var" : "Token yok");
      
      const response = await api.get(url, { params });
      
      console.log("API yanıtı:", response);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log("API'den gelen görevler:", response.data.data.length);
        
        // Get department information for each task if not already included
        let tasks = response.data.data;
        if (tasks[0] && !tasks[0].department && !tasks[0].departmentName) {
          try {
            const departments = await departmentService.getDepartments();
            console.log("Departman bilgileri API yanıtı:", departments);
            
            // Map department IDs to department names
            const departmentMap = {};
            if (Array.isArray(departments)) {
              departments.forEach(dept => {
                departmentMap[dept.id] = dept.name;
              });
            }
            
            // Add department name to each task
            tasks = tasks.map(task => {
              if (task.departmentId && departmentMap[task.departmentId]) {
                return { 
                  ...task, 
                  department: departmentMap[task.departmentId],
                  departmentName: departmentMap[task.departmentId] 
                };
              }
              return task;
            });
          } catch (deptError) {
            console.error("Departman bilgileri alınırken hata oluştu:", deptError);
          }
        }
        
        return {
          tasks: tasks,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: params.PageNumber
        };
      } else {
        console.warn("API yanıtında task verisi bulunamadı, varsayılan görevler döndürülüyor");
        
        const dummyTasks = [
          { id: "1", name: "Örnek Görev 1", description: "Bu bir örnek görevdir", durationId: params.DurationId, department: "Yazılım", departmentName: "Yazılım" },
          { id: "2", name: "Örnek Görev 2", description: "Bu bir örnek görevdir", durationId: params.DurationId, department: "Pazarlama", departmentName: "Pazarlama" },
          { id: "3", name: "Örnek Görev 3", description: "Bu bir örnek görevdir", durationId: params.DurationId, department: "İnsan Kaynakları", departmentName: "İnsan Kaynakları" }
        ];
        
        return {
          tasks: dummyTasks,
          totalCount: dummyTasks.length,
          totalPages: 1,
          currentPage: 1
        };
      }
    } catch (error) {
      console.error("Sayfalı görevler alınırken hata:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
      
      // Hata durumunda varsayılan veriler
      const dummyTasks = [
        { id: "1", name: "Hata Durumu - Örnek Görev 1", description: "API hatası nedeniyle örnek görev", durationId: parameters.DurationId || "unknown", department: "Yazılım", departmentName: "Yazılım" },
        { id: "2", name: "Hata Durumu - Örnek Görev 2", description: "API hatası nedeniyle örnek görev", durationId: parameters.DurationId || "unknown", department: "Pazarlama", departmentName: "Pazarlama" }
      ];
      
      return {
        tasks: dummyTasks,
        totalCount: dummyTasks.length,
        totalPages: 1,
        currentPage: 1
      };
    }
  },

  getGroupTasksByUser: async (tenantId) => {
    try {
      const response = await api.get(`/api/v1/User/GroupTasksByUser?TenantId=${tenantId}`);
      console.log("User group tasks response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("User group tasks alınırken hata oluştu:", error);
      throw error;
    }
  },

  getTaskById: async (taskId) => {
    try {
      console.log(`Görev ID ile getiriliyor: ${taskId}`);
      const response = await api.get(`/api/v1/Task/GetById?TaskId=${taskId}`);
      console.log("Tek görev API yanıtı:", response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Görev detay API yanıtı geçersiz format:", response.data);
        throw new Error("Görev detayları alınamadı");
      }
    } catch (error) {
      console.error(`${taskId} ID'li görev alınırken hata oluştu:`, error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      console.log("Kategori verileri alınıyor...");
      const token = localStorage.getItem("user-token");
      console.log("Token durumu:", token ? "Token var" : "Token yok");
      
      const tenantId = "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3";
      console.log(`Kategoriler için API isteği: /api/v1/Duration/GetByTenant?TenantId=${tenantId}`);
      
      const response = await api.get(`/api/v1/Duration/GetByTenant?TenantId=${tenantId}`);
      console.log("Kategori API yanıtı:", response);
      
      if (response.data && response.data.data) {
        console.log("Kategori verileri başarıyla alındı, toplam:", response.data.data.length);
        return response.data.data;
      } else {
        console.error("Kategori API yanıtı geçersiz format:", response.data);
        
        return [
          { id: "9f0122da-a697-4aed-52af-08dd2c05ec2e", name: "Beklemede" },
          { id: "577ba8ad-f6d8-430a-52b0-08dd2c05ec2e", name: "Yapımda" },
          { id: "492d6a56-590c-47f1-52b1-08dd2c05ec2e", name: "Tamamlandı" },
          { id: "2f985dfd-f22a-4294-52b2-08dd2c05ec2e", name: "Reddedildi" }
        ];
      }
    } catch (error) {
      console.error("Kategori çekerken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);

      return [
        { id: "9f0122da-a697-4aed-52af-08dd2c05ec2e", name: "Beklemede" },
        { id: "577ba8ad-f6d8-430a-52b0-08dd2c05ec2e", name: "Yapımda" },
        { id: "492d6a56-590c-47f1-52b1-08dd2c05ec2e", name: "Tamamlandı" },
        { id: "2f985dfd-f22a-4294-52b2-08dd2c05ec2e", name: "Reddedildi" }
      ];
    }
  },

  updateTask: async (taskData) => {
    try {
      console.log("Görev güncelleme başlatılıyor...");
      console.log("Gelen veriler:", JSON.stringify(taskData, null, 2));
      
      const priority = taskData.priority !== undefined && taskData.priority !== null 
        ? String(taskData.priority) 
        : "3";
        const jsonData = {
        TaskId: taskData.taskId,
        Name: taskData.name,
        Description: taskData.description || "",
        Note: taskData.note || "",
        DepartmentId: taskData.departmentId,
        DurationId: taskData.durationId,
        Priority: priority,
        TenantId: taskData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3",
        ResponsibleUsersId: taskData.responsibleUsersId || []
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  updateTaskDuration: async (taskId, durationId) => {
    try {
      console.log("Görev durumu güncelleme başlatılıyor...");
      console.log(`TaskId: ${taskId}, DurationId: ${durationId}`);
      
      const jsonData = {
        TaskId: taskId,
        DurationId: durationId,
        TenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task/DurationUpdate", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev durumu güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev durumu güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  taskRejected: async (taskId, rejectedReason) => {
    try {
      console.log("Görev reddetme işlemi başlatılıyor...");
      console.log(`TaskId: ${taskId}, ReddetmeNedeni: ${rejectedReason}`);
      
      const jsonData = {
        TaskId: taskId,
        RejectedReason: rejectedReason,
        TenantId: "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task/TaskRejected", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev reddetme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev reddedilirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  updateTaskDepartment: async (departmentData) => {
    try {
      console.log("Görev departman güncelleme başlatılıyor...");
      console.log("Gelen departman verileri:", JSON.stringify(departmentData, null, 2));
      
      const jsonData = {
        TaskId: departmentData.taskId,
        DepartmentId: departmentData.departmentId,
        TenantId: departmentData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task/DepartmentUpdate", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev departman güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev departman güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  updateTaskType: async (taskTypeData) => {
    try {
      console.log("Görev tipi güncelleme başlatılıyor...");
      console.log("Gelen görev tipi verileri:", JSON.stringify(taskTypeData, null, 2));
      
      const jsonData = {
        TaskId: taskTypeData.taskId,
        TaskTypeId: taskTypeData.taskTypeId,
        TenantId: taskTypeData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task/TaskTypeUpdateUpdate", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev tipi güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev tipi güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  updateTaskPriority: async (priorityData) => {
    try {
      console.log("Görev önceliği güncelleme başlatılıyor...");
      console.log("Gelen öncelik verileri:", JSON.stringify(priorityData, null, 2));
      
      const jsonData = {
        TaskId: priorityData.taskId,
        Priority: String(priorityData.priority),
        TenantId: priorityData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      const response = await api.put("/api/v1/Task/TaskPriorityUpdate", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Görev önceliği güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("Görev önceliği güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
      }
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      console.log("Görev ekleme isteği gönderiliyor...");

      let formData;

      if (taskData instanceof FormData) {
        console.log("taskData zaten FormData olarak gönderilmiş");
        formData = taskData;

        console.log("Gelen FormData içeriği:");
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        let nameValue = formData.get('Name');
        if (!nameValue || nameValue.trim() === "") {
          console.error("Name alanı FormData içinde boş veya tanımsız!");
          throw new Error("Görev adı boş olamaz");
        }

        console.log("Name alanı FormData içinde mevcut:", nameValue);

        const durationId = formData.get('DurationId');
        if (durationId) {
          console.log("DurationId FormData içinde mevcut:", durationId);

          if (durationId.length < 5) {
            console.error("DurationId çok kısa, geçersiz olabilir:", durationId);
          } else {
            console.log("DurationId geçerli formatta görünüyor");
          }

          console.log("DurationId API'ye gönderilecek:", durationId);
        } else {
          console.warn("DurationId FormData içinde bulunamadı!");

          const status = formData.get('Status');
          if (status) {
            console.log("Status değeri mevcut, ancak DurationId eksik. Status:", status);

            let durationId = null;
            if (status === "Reddedildi") {
              durationId = "ba861628-2b0d-48cd-6eb0-08dd72b2e88e";
            } else if (status === "Beklemede") {
              durationId = "19841b9d-e98a-474e-6eae-08dd72b2e88e";
            } else if (status === "Atandı") {
              durationId = "0fc8818d-27a3-4e8b-6eaf-08dd72b2e88e";
            } else if (status === "Tamamlandı") {
              durationId = "9f3fd5a1-7f18-4e27-6eb1-08dd72b2e88e";
            }

            if (durationId) {
              console.log(`"${status}" statüsü için DurationId manuel olarak ekleniyor:`, durationId);
              formData.append('DurationId', durationId);
            }
          }
        }

        const finalDurationId = formData.get('DurationId');
        if (finalDurationId) {
          console.log("API'ye gönderilecek DurationId:", finalDurationId);
        } else {
          console.error("DurationId hala bulunamadı, bir kategori seçilememesi problemi olabilir!");
        }
      } else {
        console.log("API'ye gönderilecek veriler:", JSON.stringify(taskData, null, 2));

        if (taskData.Name === undefined && taskData.name !== undefined) {
          console.log("Name alanı küçük harfle gönderilmiş, büyük harfe dönüştürülüyor.");
          taskData.Name = taskData.name;
          delete taskData.name;
        }

        if (taskData.Name) {
          taskData.Name = taskData.Name.trim().replace(/\s+/g, " ");
          console.log("Name alanı düzeltildi:", taskData.Name);
          console.log("Name uzunluğu:", taskData.Name.length);

          if (taskData.Name === "") {
            console.error("Name alanı boş!");
            throw new Error("Görev adı boş olamaz");
          }
        } else {
          console.error("Name alanı tanımsız!");
          throw new Error("Görev adı tanımlanmamış");
        }

        formData = new FormData();
        formData.append('TenantId', taskData.TenantId || taskData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
        formData.append('Name', taskData.Name);
        formData.append('Description', taskData.Description || taskData.description || "");
        formData.append('DepartmentId', taskData.DepartmentId || taskData.departmentId || "d1d4cae5-039d-415f-305e-08dd5ae73144");
        formData.append('TaskTypeId', taskData.TaskTypeId || taskData.taskTypeId || "");
        formData.append('CreateUserId', taskData.CreateUserId || taskData.createUserId || "b3f43f03-8784-430a-6ebb-08dd2c05ec10");
        formData.append('Priority', taskData.Priority || taskData.priority || "3");

        if (taskData.DurationId || taskData.durationId) {
          formData.append('DurationId', taskData.DurationId || taskData.durationId);
          console.log('DurationId eklendi:', taskData.DurationId || taskData.durationId);
        }

        if (taskData.ResponsibleUsersId && taskData.ResponsibleUsersId.length > 0) {
          taskData.ResponsibleUsersId.forEach(userId => {
            formData.append('ResponsibleUsersId', userId);
          });
        }

        if (taskData.Files && taskData.Files.length > 0) {
          taskData.Files.forEach(file => {
            formData.append('Files', file);
          });
        }
      }

      console.log("FormData hazır, API'ye gönderiliyor");

      console.log("API'ye gönderilecek FormData içeriği:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await api.post("/api/v1/Task", formData, {
      });

      console.log("API Yanıtı:", response.data);

      if (response.data && response.data.isSuccess === true) {
        console.log("Görev başarıyla eklendi:", response.data);
      } else {
        console.error("API başarısız yanıt döndü:", response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Görev eklenirken hata oluştu:", error);

      if (error.response) {
        console.error("Hata detayları:", error.response.data);

        if (error.response.data && error.response.data.errors) {
          console.error("Validation hatası detayları:", JSON.stringify(error.response.data.errors, null, 2));

          if (error.response.data.errors.Name || error.response.data.errors.name) {
            console.error("Name alanı ile ilgili hata var!");
            console.error("Gönderilen name değeri:", taskData.Name);
            console.error("Karakter kodları:", [...taskData.Name].map(c => c.charCodeAt(0)));
          }
        }

        console.error("Hata status:", error.response.status);
        console.error("Hata headers:", error.response.headers);

        if (error.response.status === 401) {
          throw new Error("Yetkilendirme hatası: Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.");
        }
      } else if (error.request) {
        console.error("İstek gönderildi ancak yanıt alınamadı:", error.request);
      } else {
        console.error("İstek oluşturulurken hata:", error.message);
      }
      throw error;
    }
  },

  addTaskLog: async (taskLogData) => {
    try {
      console.log("Görev log ekleme başlatılıyor...");
      console.log("Gelen veriler:", JSON.stringify(taskLogData, null, 2));
      
      // Format times properly if they exist
      const startTime = taskLogData.startTime ? `${taskLogData.startTime}:00` : null;
      const endTime = taskLogData.endTime ? `${taskLogData.endTime}:00` : null;
      
      // Two different request formats to try
      const requestData = {
        taskId: taskLogData.taskId,
        userId: taskLogData.userId || localStorage.getItem("user-id"),
        duration: parseInt(taskLogData.duration) || 0,
        description: taskLogData.description || "",
        date: taskLogData.date || new Date().toISOString().split('T')[0],
        startTime: startTime,
        endTime: endTime
      };
      
      // First try with direct request format
      console.log("API'ye gönderilecek JSON verisi (1. format):", requestData);
      
      try {
        const response = await api.post("/api/v1/Task/AddTaskLog", requestData, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        console.log("Görev log ekleme yanıtı:", response.data);
        return response.data;
      } catch (directRequestError) {
        console.error("İlk request formatı başarısız oldu, alternatif formatı deniyorum");
        console.error("Hata detayları:", directRequestError.response?.data);
        
        // If first format fails, try with wrapped "request" object
        const wrappedRequest = {
          request: requestData
        };
        
        console.log("API'ye gönderilecek JSON verisi (2. format):", wrappedRequest);
        
        const response = await api.post("/api/v1/Task/AddTaskLog", wrappedRequest, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        console.log("Görev log ekleme yanıtı:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Görev log eklenirken hata oluştu:", error);
      if (error.response) {
        console.error("Hata detayları:", error.response.data);
        console.error("Hata durum kodu:", error.response.status);
        
        // Log detailed validation errors if present
        if (error.response.data && error.response.data.errors) {
          console.error("Validation hataları:", JSON.stringify(error.response.data.errors, null, 2));
          Object.keys(error.response.data.errors).forEach(key => {
            console.error(`${key} alanı hatası:`, error.response.data.errors[key]);
          });
        }
      }
      throw error;
    }
  },

  getUsersByTenantId: async (tenantId) => {
    try {
      console.log("Kiracıya bağlı kullanıcılar alınıyor...");
      const response = await api.get(`/api/v1/User/GetByTenantId?TenantId=${tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3"}`);
      console.log("Kullanıcı listesi API yanıtı:", response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Kullanıcı listesi API yanıtı geçersiz format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Kullanıcı listesi alınırken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
      return [];
    }
  },
};

export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get("/api/v1/User?UserId=0de32311-bd40-4989-02a4-08dd49ab3521");
      console.log("User API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
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
        departmentIdList: staffData.departmentIdList || (staffData.departmentId ? [staffData.departmentId] : []),
        userTypeId: staffData.userTypeId || ""
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

export const taskTypeService = {
  getTaskTypes: async () => {
    try {
      const response = await api.get("/api/v1/TaskType/GetByTenant?TenantId=c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      console.log("TaskType verileri:", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("TaskType verileri alınırken hata oluştu:", error);
      throw error;
    }
  },

  getTaskTypeById: async (id) => {
    try {
      const response = await api.get(`/api/v1/TaskType/${id}`);
      console.log("TaskType verisi:", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li TaskType verisi alınırken hata oluştu:`, error);
      throw error;
    }
  },

  createTaskType: async (taskTypeData) => {
    try {
      const jsonData = {
        name: taskTypeData.name,
        relatedDepartmentId: taskTypeData.relatedDepartmentId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      };

      const response = await api.post("/api/v1/TaskType", jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("TaskType oluşturma yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("TaskType oluşturulurken hata oluştu:", error);
      throw error;
    }
  },

  deleteTaskType: async (id) => {
    try {
      const response = await api.delete(`/api/v1/TaskType?TaskTypeId=${id}`);
      console.log("TaskType silme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("TaskType silinirken hata oluştu:", error);
      throw error;
    }
  }
};

export const AnnualLeavesService = {
  getAnnualLeaves: async (userId) => {
    try {
      console.log("Yıllık izin verileri için API isteği yapılıyor... UserId:", userId);
      const response = await api.get(`/api/v1/AnnualLeave/GetByUserId?UserId=${userId}`);
      console.log("Yıllık izin API yanıtı:", response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error("Yıllık izin API yanıtı geçersiz format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Yıllık izin verileri alınırken hata oluştu:", error);
      console.error("Hata detayları:", error.response?.data);
      console.error("Hata durum kodu:", error.response?.status);
      return [];
    }
  }
};


export const overTimeServices = {
  getOverTimeServices: async () => {
    try{
      const userId = localStorage.getItem('user-id');
      if (!userId) {
        throw new Error("Kullanıcı ID'si bulunamadı");
      } 
      const response = await api.get(`/api/v1/Overtime/GetByUserId?UserId=${userId}`);
      console.log("Overtime verileri:", response.data);
      return response.data;
    } catch(error){
      console.log(error)
    }
  },
  createOvertime: async (overtimeData) => {
    try {
      console.log("Fazla mesai ekleme API çağrısı, gönderilen veri:", overtimeData);
      const response = await api.post("/api/v1/Overtime", overtimeData, {
        headers: {
          "Content-Type": "application/json; Version=1.0"
        }
      });
      console.log("Fazla mesai ekleme başarılı, API yanıtı:", response);
      return response;
    } catch (error) {
      console.error("Fazla mesai eklenirken hata:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
      throw error;
    }
  },
  updateOvertime: async (overtimeId, overtimeData) => {
    try {
      console.log("Fazla mesai güncelleme API çağrısı, gönderilen veri:", overtimeData);
      const response = await api.put(`/api/v1/Overtime`, {
        id: overtimeId,
        userId: overtimeData.userId,
        entryTime: overtimeData.entryTime,
        exitTime: overtimeData.exitTime
      }, {
        headers: {
          "Content-Type": "application/json; Version=1.0"
        }
      });
      console.log("Fazla mesai güncelleme başarılı, API yanıtı:", response);
      return response;
    } catch (error) {
      console.error("Fazla mesai güncellenirken hata:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
      throw error;
    }
  },
  deleteOvertime: async (overtimeId) => {
    try {
      const response = await api.delete(`/api/v1/Overtime?OvertimeId=${overtimeId}`);
      return response.data;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
}


export const companyService = {
  getCompanies: async () => {
    try {
      const userId = localStorage.getItem('user-id');
      if (!userId) {
        throw new Error("Kullanıcı ID'si bulunamadı");
      }
      const response = await api.get(`/api/v1/Tenant/GetByTenantGrup?UserId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Şirket verileri alınırken hata oluştu:", error);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      console.log("Şirket ekleme API çağrısı, gönderilen veri:", companyData);
      const response = await api.post("/api/v1/Tenant", companyData, {
        headers: {
          "Content-Type": "application/json; Version=1.0"
        }
      });
      console.log("Şirket ekleme başarılı, API yanıtı:", response);
      return response;
    } catch (error) {
      console.error("Şirket eklenirken hata:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
      throw error;
    }
  },
  
  updateCompany: async (companyId, companyData) => {
    try {
      const userId = localStorage.getItem('user-id');
      if (!userId) {
        throw new Error("Kullanıcı ID'si bulunamadı");
      }
      console.log("Şirket güncelleme API çağrısı, gönderilen veri:", companyData);
      const response = await api.put(`/api/v1/Tenant`, {
        tenantId: companyId,
        userId: userId,
        name: companyData.name,
        title: companyData.title,
        logo: companyData.logo,
        domain: companyData.domain,
        tenantGrupId: companyData.tenantGrupId || localStorage.getItem('tenant-grup-id') || "1160fc5a-dd69-452e-83af-da3510419b90"
      }, {
        headers: {
          "Content-Type": "application/json; Version=1.0"
        }
      });
      return response.data;
    } catch (error) {
      console.error("Şirket güncellenirken hata oluştu:", error);
      if (error.response) {
        console.error("API hata yanıtı:", error.response.data);
        console.error("API hata kodu:", error.response.status);
      }
      throw error;
    }
  },

  deleteCompany: async (companyId) => {
    try {
      const response = await api.delete(`/api/v1/Tenant?TenantId=${companyId}`); 
      return response.data;
    } catch (error) {
      console.log(error)
      throw error;
    }
  },

  getCompanyUsers: async (companyId) => {
    try {
      const userId = localStorage.getItem('user-id');
      if (!userId) {
        throw new Error("Kullanıcı ID'si bulunamadı");
      }
      const response = await api.get(`/api/v1/Tenant/GetUsers?UserId=${userId}&TenantId=${companyId}`);
      return response.data;
    } catch (error) {
      console.error("Şirket kullanıcıları alınırken hata oluştu:", error);
      throw error;
    }
  }
};
