import { useState, useEffect } from "react";
import { departmentService, tasksServices } from "../axios/axios";
import { TextField, InputLabel, MenuItem, FormControl, Select, Button } from "@mui/material";
import "../styles/AddTask.css";

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

    if (!name) {
      alert("Görev adı boş olamaz!");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("departmentId", departman);
    formData.append("priority", oncelik);
    formData.append("status", status);
    formData.append("createUserId", createUserId);
    formData.append("createUserTentantId", createUserTentantId || "c35a6a8e-204b-4791-ba3b-08dd2c05ebe3");

    console.log("Gönderilen FormData:");
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const response = await tasksServices.createTask(formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleSave(response.data.data);
      setOpen(false);
    } catch (error) {
      console.error("Task eklenirken hata oluştu:", error);

      if (error.response && error.response.data) {
        console.error("Hata detayları:", error.response.data);
        alert(`Hata: ${JSON.stringify(error.response.data.errors || error.response.data)}`);
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
