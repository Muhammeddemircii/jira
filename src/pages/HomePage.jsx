import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Panel from "../components/Panel";
import { motion } from "framer-motion";
import Cards from "../components/Cards";
import { } from "../styles/Cards.css"
import { departmentService } from "../axios/axios";
import TaskDetails from "../components/Tasks/TaskDetails";

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
          animate={{ 
            scale: isOpen ? 1 : 1, 
            x: isOpen ? 250 : 0,
            width: isOpen ? 'calc(100% - 280px)' : 'calc(100% - 100px)',
            margin: isOpen ? '0 0 0 30px' : '0 auto',
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`main-content ${isOpen ? 'menu-open' : ''}`}
        >
          <Panel setTasks={setTasks} tasks={tasks} />
        </motion.div>

        <motion.div
          initial={{ x: 0 }}
          animate={{
            x: isOpen ? 250 : 0,
            width: isOpen ? 'calc(100% - 280px)' : 'calc(100% - 100px)',
            margin: isOpen ? '0 0 0 30px' : '0 auto',
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col items-center main-content ${isOpen ? 'menu-open' : ''}`}
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