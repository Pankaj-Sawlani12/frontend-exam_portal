import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login.js'
import Signup from './pages/Signup.js'
import Home from './pages/Home.js'
import { useState } from 'react';
import RefreshHandler from './RefreshHandler.js';
import Students from './pages/Students.js'
import Teacher from './pages/Teacher.js' // Teacher dashboard
import Admin from './pages/Admin.js'
import AddStudent from './pages/AddStudent.js'
import Teachers from './pages/Teachers.js'; // // Admin teacher management
import AddTeacher from './pages/AddTeacher.js';
import Courses from './pages/Courses.js';
import AddCourse from './pages/AddCourse.js';
import Classrooms from './pages/Classrooms.js';
import AddClassroom from './pages/AddClassroom.js';
import ExamCycles from './pages/ExamCycles.js';
import AddExamCycle from './pages/AddExamCycle.js';
import ExamSessions from './pages/ExamSessions.js';
import AddExamSession from './pages/AddExamSession.js';
import ExamSchedules from './pages/ExamSchedules.js';
import AddExamSchedule from './pages/AddExamSchedule.js';
import CourseEnrollments from './pages/CourseEnrollments';
import AddCourseEnrollment from './pages/AddCourseEnrollment';
import Timetable from './pages/Timetable';
import RoomAllocation from './pages/RoomAllocation.js';
import SeatingArrangement from './pages/SeatingArrangement.js';
import InvigilationDuty from './pages/InvigilationDuty.js';
import TeacherExamSchedule from './pages/TeacherExamSchedule.js';
import TeacherInvigilationDuties from './pages/TeacherInvigilationDuties.js';
import TeacherAssignedRooms from './pages/TeacherAssignedRooms.js';
import StudentDashboard from './pages/StudentDashboard.js';
import StudentExamSchedule from './pages/StudentExamSchedule.js';
import StudentSittingPlan from './pages/StudentSittingPlan.js';
import StudentExamShifts from './pages/StudentExamShifts.js';

function App() {
  // Start from the stored token so refreshing a deep link (for example
  // /student/sitting-plan) does not bounce through /login to the dashboard.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('token'))
  );

  const getDashboard = () => {
    const role = localStorage.getItem('role');

    if (role === 'student') {
      return '/student';
    }

    if (role === 'teacher') {
      return '/teacher';
    }

    if (role === 'admin') {
      return '/admin';
    }

    return '/login';
  };

  const PrivateRoute = ({ element, allowedRoles }) => {
    const role = localStorage.getItem('role');

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
      return <Navigate to={getDashboard()} replace />;
    }

    return element;
  };

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>

        <Route path='/courses' element={<PrivateRoute element={<Courses />} allowedRoles={['admin']}
        />} />

        <Route path='/teachers' element={<PrivateRoute element={<Teachers />} allowedRoles={['admin']}
        />} />

        <Route path='/teachers/add' element={
          <PrivateRoute element={<AddTeacher />} allowedRoles={['admin']}
          />} />

        <Route path='/' element={<Navigate to="/login" />} />

        <Route path='/login' element={<Login />} />

        <Route path='/signup' element={<Signup />} />

        <Route path='/home' element={<PrivateRoute element={<Home />} allowedRoles={['student', 'teacher', 'admin']}
        />} />


        <Route
          path='/teacher'
          element={
            <PrivateRoute
              element={<Teacher />}
              allowedRoles={['teacher']}
            />
          }
        />

        <Route
          path='/admin'
          element={
            <PrivateRoute
              element={<Admin />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
          path='/students'
          element={
            <PrivateRoute
              element={<Students />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
          path='/students/add'
          element={
            <PrivateRoute
              element={<AddStudent />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
          path='/courses/add'
          element={<PrivateRoute element={<AddCourse />} allowedRoles={['admin']} />
          } />

        <Route
          path="/classrooms" element={
            <PrivateRoute element={<Classrooms />} allowedRoles={['admin']} />
          } />

        <Route
          path="/classrooms/add" element={
            <PrivateRoute element={<AddClassroom />} allowedRoles={['admin']} />
          } />

        <Route
          path="/exam-cycles"
          element={
            <PrivateRoute
              element={<ExamCycles />}
              allowedRoles={['admin']} />
          }
        />

        <Route path="/exam-cycles/add"
          element={
            <PrivateRoute
              element={<AddExamCycle />}
              allowedRoles={['admin']} />
          }
        />

        <Route
          path="/exam-sessions"
          element={
            <PrivateRoute
              element={<ExamSessions />}
              allowedRoles={['admin']} />
          }
        />

        <Route
          path="/exam-sessions/add"
          element={
            <PrivateRoute
              element={<AddExamSession />}
              allowedRoles={['admin']} />
          }
        />

        <Route
          path="/exam-schedules"
          element={
            <PrivateRoute
              element={<ExamSchedules />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
          path="/exam-schedules/add"
          element={
            <PrivateRoute
              element={<AddExamSchedule />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
            path="/course-enrollments"
            element={
                <PrivateRoute
                    element={<CourseEnrollments />}
                    allowedRoles={['admin']}
                />
            }
        />

        <Route
            path="/course-enrollments/add"
            element={
                <PrivateRoute
                    element={<AddCourseEnrollment />}
                    allowedRoles={['admin']}
                />
            }
        />

        <Route
              path="/timetable"
              element={
                  <PrivateRoute
                      element={<Timetable />}
                      allowedRoles={['admin']}
                  />
              }
          />

          <Route
            path="/student"
            element={
              <PrivateRoute
                element={<StudentDashboard />}
                allowedRoles={['student']}
              />
            }
          />

          <Route
            path="/student/exam-schedule"
            element={
              <PrivateRoute
                element={<StudentExamSchedule />}
                allowedRoles={['student']}
              />
            }
          />

          <Route
            path="/student/sitting-plan"
            element={
              <PrivateRoute
                element={<StudentSittingPlan />}
                allowedRoles={['student']}
              />
            }
          />

          <Route
            path="/student/exam-shifts"
            element={
              <PrivateRoute
                element={<StudentExamShifts />}
                allowedRoles={['student']}
              />
            }
          />

          <Route
              path="/room-allocation"
              element={
                  <PrivateRoute
                      element={<RoomAllocation />}
                      allowedRoles={['admin']}
                  />
              }
          />

        <Route
            path="/seating-arrangement"
            element={
                <PrivateRoute
                    element={<SeatingArrangement />}
                    allowedRoles={['admin']}
                />
            }
        />

        <Route
            path="/invigilation-duty"
            element={
                <PrivateRoute
                    element={<InvigilationDuty />}
                    allowedRoles={['admin']}
                />
            }
        />

        <Route
            path="/teacher/exam-schedule"
            element={
                <PrivateRoute
                    element={<TeacherExamSchedule />}
                    allowedRoles={['teacher']}
                />
            }
        />

        <Route
            path="/teacher/invigilation-duties"
            element={
                <PrivateRoute
                    element={<TeacherInvigilationDuties />}
                    allowedRoles={['teacher']}
                />
            }
        />

        <Route
            path="/teacher/assigned-rooms"
            element={
                <PrivateRoute
                    element={<TeacherAssignedRooms />}
                    allowedRoles={['teacher']}
                />
            }
        />
        
      </Routes>
    </div>
  )
}

export default App;
