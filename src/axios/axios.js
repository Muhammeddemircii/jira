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

  updateTask: async (taskData) => {
    try {
      console.log("Görev güncelleme başlatılıyor...");
      console.log("Gelen veriler:", JSON.stringify(taskData, null, 2));
      
      // API, JSON bekliyor gibi görünüyor (createTask'ta olduğu gibi)
      // Alan isimlerinin büyük harfle başlaması gerekiyor
      
      // Öncelik değerini hazırla
      const priority = taskData.priority !== undefined && taskData.priority !== null 
        ? String(taskData.priority) 
        : "3";
      
      // JSON verisi hazırla - createTask'a benzer şekilde
      const jsonData = {
        TaskId: taskData.taskId,  // Büyük harfle başlayan alan adı
        Name: taskData.name,      // Büyük harfle başlayan alan adı
        Description: taskData.description || "",
        Note: taskData.note || "",
        DepartmentId: taskData.departmentId,
        DurationId: taskData.durationId,
        Priority: priority,
        TenantId: taskData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3",
        ResponsibleUsersId: taskData.responsibleUsersId || []
      };
      
      console.log("API'ye gönderilecek JSON verisi:", jsonData);
      
      // JSON verisiyle istek gönder
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

  createTask: async (taskData) => {
    try {
      // İstek gönderilmeden önce verileri detaylı olarak logla
      console.log("Görev ekleme isteği gönderiliyor...");

      // taskData'nın FormData olup olmadığını kontrol et
      let formData;

      if (taskData instanceof FormData) {
        console.log("taskData zaten FormData olarak gönderilmiş");
        formData = taskData;

        // FormData içeriğini log etmek için
        console.log("Gelen FormData içeriği:");
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        // Name alanını özel olarak kontrol et
        let nameValue = formData.get('Name');
        if (!nameValue || nameValue.trim() === "") {
          console.error("Name alanı FormData içinde boş veya tanımsız!");
          throw new Error("Görev adı boş olamaz");
        }

        console.log("Name alanı FormData içinde mevcut:", nameValue);

        // DurationId'yi kontrol et ve logla
        const durationId = formData.get('DurationId');
        if (durationId) {
          console.log("DurationId FormData içinde mevcut:", durationId);

          // DurationId'nin doğru formatta olduğundan emin olalım
          if (durationId.length < 5) {
            console.error("DurationId çok kısa, geçersiz olabilir:", durationId);
          } else {
            console.log("DurationId geçerli formatta görünüyor");
          }

          // DurationId'nin zaten formData içinde olduğundan emin olalım
          // Bu, DurationId'nin API'ye iletilmesini garantiler
          console.log("DurationId API'ye gönderilecek:", durationId);
        } else {
          console.warn("DurationId FormData içinde bulunamadı!");

          // Status'a göre manuel DurationId ekleme
          const status = formData.get('Status');
          if (status) {
            console.log("Status değeri mevcut, ancak DurationId eksik. Status:", status);

            // Manuel olarak status'a göre DurationId ekle
            let durationId = null;
            if (status === "Reddedildi") {
              durationId = "ba861628-2b0d-48cd-6eb0-08dd72b2e88e"; // Reddedilenler
            } else if (status === "Beklemede") {
              durationId = "19841b9d-e98a-474e-6eae-08dd72b2e88e"; // Beklemede
            } else if (status === "Atandı") {
              durationId = "0fc8818d-27a3-4e8b-6eaf-08dd72b2e88e"; // Yapımda
            } else if (status === "Tamamlandı") {
              durationId = "9f3fd5a1-7f18-4e27-6eb1-08dd72b2e88e"; // Tamamlananlar
            }

            if (durationId) {
              console.log(`"${status}" statüsü için DurationId manuel olarak ekleniyor:`, durationId);
              formData.append('DurationId', durationId);
            }
          }
        }

        // Formdata içinde DurationId'nin son durumunu kontrol et
        const finalDurationId = formData.get('DurationId');
        if (finalDurationId) {
          console.log("API'ye gönderilecek DurationId:", finalDurationId);
        } else {
          console.error("DurationId hala bulunamadı, bir kategori seçilememesi problemi olabilir!");
        }
      } else {
        // JSON veri olarak geldi, FormData'ya çevir
        console.log("API'ye gönderilecek veriler:", JSON.stringify(taskData, null, 2));

        // Name alanını büyük harfle kullanım için kontrol et
        if (taskData.Name === undefined && taskData.name !== undefined) {
          console.log("Name alanı küçük harfle gönderilmiş, büyük harfe dönüştürülüyor.");
          taskData.Name = taskData.name;
          delete taskData.name;
        }

        // Name alanının değerini kontrol et ve düzelt
        if (taskData.Name) {
          // Gereksiz boşlukları temizle ve tek bir boşluğa dönüştür
          taskData.Name = taskData.Name.trim().replace(/\s+/g, " ");
          console.log("Name alanı düzeltildi:", taskData.Name);
          console.log("Name uzunluğu:", taskData.Name.length);

          // İsim boş ise hata fırlat
          if (taskData.Name === "") {
            console.error("Name alanı boş!");
            throw new Error("Görev adı boş olamaz");
          }
        } else {
          console.error("Name alanı tanımsız!");
          throw new Error("Görev adı tanımlanmamış");
        }

        // Swagger'daki örneğe göre FormData kullan
        formData = new FormData();
        formData.append('TenantId', taskData.TenantId || taskData.tenantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
        formData.append('Name', taskData.Name);
        formData.append('Description', taskData.Description || taskData.description || "");
        formData.append('DepartmentId', taskData.DepartmentId || taskData.departmentId || "d1d4cae5-039d-415f-305e-08dd5ae73144");
        formData.append('TaskTypeId', taskData.TaskTypeId || taskData.taskTypeId || ""); // Boş string olarak gönder
        formData.append('CreateUserId', taskData.CreateUserId || taskData.createUserId || "b3f43f03-8784-430a-6ebb-08dd2c05ec10");
        formData.append('Priority', taskData.Priority || taskData.priority || "3");

        // DurationId ekle
        if (taskData.DurationId || taskData.durationId) {
          formData.append('DurationId', taskData.DurationId || taskData.durationId);
          console.log('DurationId eklendi:', taskData.DurationId || taskData.durationId);
        }

        // Dosya ve sorumlular için dizileri kontrol et
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

      // Son bir kez FormData içeriğini log et
      console.log("API'ye gönderilecek FormData içeriği:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await api.post("/api/v1/Task", formData, {
        headers: {
          // Content-Type başlığını FormData ile kullanırken kaldır
          // Tarayıcı bunu otomatik olarak doğru boundary ile ayarlayacak
        },
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

        // Detaylı hata bilgilerini göster
        if (error.response.data && error.response.data.errors) {
          console.error("Validation hatası detayları:", JSON.stringify(error.response.data.errors, null, 2));

          // Name field hatasını özel olarak kontrol et
          if (error.response.data.errors.Name || error.response.data.errors.name) {
            console.error("Name alanı ile ilgili hata var!");
            console.error("Gönderilen name değeri:", taskData.Name);
            console.error("Karakter kodları:", [...taskData.Name].map(c => c.charCodeAt(0)));
          }
        }

        console.error("Hata status:", error.response.status);
        console.error("Hata headers:", error.response.headers);

        // 401 Unauthorized hatası için özel mesaj
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
      // Send as JSON according to Swagger docs
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

  updateTaskType: async (taskTypeData) => {
    try {
      // Convert to JSON payload format as per Swagger docs
      const jsonData = {
        taskTypeId: taskTypeData.id,
        name: taskTypeData.name,
        title: taskTypeData.name, // Using name as title if not provided
        relatedDepartmentId: taskTypeData.relatedDepartmentId || ""
      };

      console.log("TaskType güncelleme verisi:", jsonData);

      const response = await api.put(`/api/v1/TaskType`, jsonData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("TaskType güncelleme yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("TaskType güncellenirken hata oluştu:", error);
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
