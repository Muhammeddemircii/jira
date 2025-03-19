import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Panel from "../components/Panel";
import { motion } from "framer-motion";
import Cards from "../components/Cards";
import { } from "../styles/Cards.css"
import { departmentService } from "../axios/axios";
import TaskDetails from "../components/TaskDetails";

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [departmanListesi, setDepartmanListesi] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const updateMenuState = useCallback((newState) => {
    setIsOpen(newState);
  }, []);

  return (
    <div>
      <Navbar isOpen={isOpen} setIsOpen={updateMenuState} />
      <hr />

      <div>
        <motion.div
          initial={{ scale: 1, x: 0 }}
          animate={{ scale: isOpen ? 1 : 1, x: isOpen ? 245 : 45 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`${isOpen ? "w-full" : "w-full flex justify-center"}`}
        >
          <Panel setTasks={setTasks} tasks={tasks} />
        </motion.div>

        <motion.div
          initial={{ x: 0 }}
          animate={{
            x: isOpen ? 100 : 0,
            width: isOpen ? 'calc(100% - 200px)' : '100%',
          }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col items-center"
        >
          {openDetails && (
            <div className="task-details-overlay">
              <TaskDetails
                selectedTask={selectedTask}
                setOpenDetails={setOpenDetails}
              />
            </div>
          )}


          <Cards
            tasks={tasks}
            isOpen={isOpen}
            departmanListesi={departmanListesi}
            setOpenDetails={setOpenDetails}
            setSelectedTask={setSelectedTask}
            className={`${!isOpen ? "card-close" : "card-open"}`}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;