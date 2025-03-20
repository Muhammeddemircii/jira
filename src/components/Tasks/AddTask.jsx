import { useState, useEffect } from "react";
import { departmentService, tasksServices } from "../../axios/axios";
import { TextField, InputLabel, MenuItem, FormControl, Select, Button } from "@mui/material";
import "../../styles/Tasks/AddTask.css";

const AddTask = ({ setOpen, setLoading, handleSave, currentUserId, currentUserTentantId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departman, setDepartman] = useState("");
  const [departmanListesi, setDepartmanListesi] = useState([]);
  const [oncelik, setOncelik] = useState("");
  const [status, setStatus] = useState("Beklemede");
  const [createUserId, setCreateUserId] = useState(currentUserId || "");
  const [createUserTentantId, setCreateUserTentantId] = useState(currentUserTentantId || "");
  const [animationTaskClass, setAnimationTaskClass] = useState("");
  const [durationIdMap, setDurationIdMap] = useState({});

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await departmentService.getDepartments();
        setDepartmanListesi(departments);
      } catch (error) {
        console.error("Departman verileri alınırken hata oluştu:", error);
      }
    };

    fetchDepartments();
    
    // Kategorileri (durations) yükle
    const fetchCategories = async () => {
      try {
        const categories = await tasksServices.getCategories();
        console.log("Kategoriler (Durations):", categories);
        
        // Status - DurationId eşleştirmesi için bir map oluştur
        const durationMap = {};
        categories.forEach(category => {
          durationMap[category.name] = category.id;
        });
        
        console.log("Durum - Kategori ID eşleştirmesi:", durationMap);
        setDurationIdMap(durationMap);
      } catch (error) {
        console.error("Kategori verileri alınırken hata oluştu:", error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleCloseAddTask = () => {
    setLoading(false);
    setAnimationTaskClass("scroll-up")
    setTimeout(() => {

      setOpen(false);

    }, 500);

  };

  const handleSaveTask = async () => {
    setAnimationTaskClass("scroll-down")

    if (!name || name.trim() === "") {
      alert("Görev adı boş olamaz!");
      return;
    }
    
    try {
      setLoading(true);
      
      // İsim alanını özel karakterlerden arındır ve temizle
      // - Tüm whitespace karakterlerini tek bir boşluğa dönüştür
      // - Başta ve sonda boşlukları kaldır
      // - ASCII olmayan karakterleri kaldır veya değiştir
      let cleanName = name
        .trim()                            // Baştaki ve sondaki boşlukları kaldır
        .replace(/\s+/g, " ")              // Birden fazla boşluğu tek boşluğa indir
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Kontrol karakterlerini kaldır
        
      // İsim hala boş değilse devam et
      if (!cleanName || cleanName.trim().length === 0) {
        alert("Geçerli bir görev adı girmelisiniz!");
        setLoading(false);
        return;
      }
      
      // İsmin minimum 2 karakter olduğundan emin ol
      if (cleanName.length < 2) {
        alert("Görev adı en az 2 karakter olmalıdır!");
        setLoading(false);
        return;
      }
      
      console.log("Orijinal isim:", name);
      console.log("Temizlenmiş isim:", cleanName);
      console.log("İsim uzunluğu:", cleanName.length);

      // Status değerine göre durationId belirle
      let selectedDurationId = null;
      
      console.log("SEÇILEN STATÜ:", status);
      
      // Statüye göre sabit ID ataması yapalım
      // Bu ID'ler API'den alınan kategorilerden emin olduğumuz değerler
      if (status === "Reddedildi") {
        // Reddedilenler kategorisi için sabit ID
        selectedDurationId = "ba861628-2b0d-48cd-6eb0-08dd72b2e88e";
        console.log(`"Reddedildi" statüsü için sabit kategori ID kullanılıyor: ${selectedDurationId}`);
      } else if (status === "Beklemede") {
        // Beklemede kategorisi için sabit ID
        selectedDurationId = "19841b9d-e98a-474e-6eae-08dd72b2e88e";
        console.log(`"Beklemede" statüsü için sabit kategori ID kullanılıyor: ${selectedDurationId}`);
      } else if (status === "Atandı") {
        // Yapımda kategorisi için sabit ID
        selectedDurationId = "0fc8818d-27a3-4e8b-6eaf-08dd72b2e88e";
        console.log(`"Atandı" statüsü için sabit kategori ID kullanılıyor: ${selectedDurationId}`);
      } else if (status === "Tamamlandı") {
        // Tamamlananlar kategorisi için sabit ID
        selectedDurationId = "9f3fd5a1-7f18-4e27-6eb1-08dd72b2e88e";
        console.log(`"Tamamlandı" statüsü için sabit kategori ID kullanılıyor: ${selectedDurationId}`);
      } else {
        // Tanımlanmamış bir durum için varsayılan olarak beklemede kategorisini kullan
        selectedDurationId = "19841b9d-e98a-474e-6eae-08dd72b2e88e"; // Beklemede kategorisi ID
        console.warn(`Tanınmayan statü: ${status}, varsayılan "Beklemede" kategorisi kullanılıyor`);
      }
      
      // FormData üzerine direkt olarak verileri ekleyelim
      const formData = new FormData();
      formData.append("TenantId", "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");
      
      // Name değerinin boş olmadığından emin olalım ve doğru Key ile ekleyelim
      if (!cleanName || cleanName.trim() === "") {
        alert("Görev adı boş olamaz!");
        setLoading(false);
        return;
      }
      formData.append("Name", cleanName);
      
      formData.append("Description", description || "");
      formData.append("DepartmentId", departman || "d1d4cae5-039d-415f-305e-08dd5ae73144");
      formData.append("TaskTypeId", "");
      formData.append("CreateUserId", createUserId || "b3f43f03-8784-430a-6ebb-08dd2c05ec10");
      formData.append("Priority", oncelik || "3");
      
      // Statü değerini de ekle
      formData.append("Status", status);
      
      // DurationId değerini ekle
      if (selectedDurationId) {
        formData.append("DurationId", selectedDurationId);
        console.log(`"${status}" statüsü için DurationId eklendi:`, selectedDurationId);
      } else {
        console.warn(`"${status}" statüsü için DurationId bulunamadı! Görev varsayılan kategoride oluşturulacak.`);
      }
      
      // FormData içeriğini konsola yazdır
      console.log("FormData içeriği:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      console.log("FormData doğrudan gönderiliyor...");
      const response = await tasksServices.createTask(formData);
      
      console.log("API yanıtı:", response);
      
      if (response && response.isSuccess === true) {
        handleSave(response.data || response);
        setOpen(false);
        alert("Görev başarıyla eklendi!");
      } else {
        console.error("API başarısız yanıt döndü:", response);
        alert(`Görev eklenirken bir sorun oluştu: ${response.message || "İşlem başarısız."}`);
      }
    } catch (error) {
      console.error("Task eklenirken hata oluştu:", error);

      if (error.response && error.response.data) {
        console.error("Hata detayları:", error.response.data);
        let errorMessage = "Görev eklenirken hata oluştu:\n";
        
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          console.error("Validation hataları:", errors);
          
          // Hata mesajlarını daha detaylı göster
          for (const field in errors) {
            errorMessage += `- ${field}: ${errors[field].join(", ")}\n`;
          }
          
          // Name field hatası varsa özel olarak göster
          if (errors.Name || errors.name) {
            errorMessage += `\nÖnemli: Name alanı hatası tespit edildi.\n`;
            errorMessage += `Orijinal değer: "${name}"\n`;
            errorMessage += `Temizlenmiş değer: "${cleanName}"\n`;
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else {
          errorMessage += JSON.stringify(error.response.data);
        }
        
        alert(errorMessage);
      } else {
        alert(`Görev eklenirken bir hata oluştu: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={`add-task ${animationTaskClass}`}>

        <TextField
          id="outlined-basic"
          label="Ad"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          id="outlined-basic"
          label="Açıklama"
          variant="outlined"
          multiline
          rows={2}
          placeholder="Açıklamanızı buraya yazın..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <FormControl>
          <InputLabel id="departman-label">Departman</InputLabel>
          <Select
            labelId="departman-label"
            id="departman-select"
            value={departman}
            onChange={(e) => setDepartman(e.target.value)}
            autoWidth
            label="Departman"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {departmanListesi.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="oncelik-label">Öncelik Derecesi</InputLabel>
          <Select
            labelId="oncelik-label"
            id="oncelik-select"
            value={oncelik}
            onChange={(e) => setOncelik(e.target.value)}
            label="Öncelik Derecesi"
          >
            <MenuItem value="1">Çok Düşük</MenuItem>
            <MenuItem value="2">Düşük</MenuItem>
            <MenuItem value="3">Orta</MenuItem>
            <MenuItem value="4">Yüksek</MenuItem>
            <MenuItem value="5">Çok Yüksek</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="status-label">Statü</InputLabel>
          <Select
            labelId="status-label"
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Statü"
          >
            <MenuItem value="Beklemede">Beklemede</MenuItem>
            <MenuItem value="Atandı">Atandı</MenuItem>
            <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
            <MenuItem value="Reddedildi">Reddedildi</MenuItem>
          </Select>
        </FormControl>

        <div className="task-buttons">
          <Button onClick={handleCloseAddTask}>Kapat</Button>
          <Button onClick={handleSaveTask}>Kaydet</Button>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
