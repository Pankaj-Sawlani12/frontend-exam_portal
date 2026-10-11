import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Students() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/students'
                );

                const result = await response.json();

                console.log('STUDENTS API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(
                        result.message || 'Unable to fetch students'
                    );
                    return;
                }

                setStudents(result.students || []);

            } catch (error) {
                console.error('GET STUDENTS ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div className="management-page">

            <div className="management-header">

                <h1>Students Management</h1>

                <div className="management-actions">

                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        className="management-button"
                        onClick={() => navigate('/students/add')}
                    >
                        Add Student
                    </button>

                </div>

            </div>

            <div className="management-card">

                <h2>Student List</h2>

                {loading && (
                    <p className="management-message">
                        Loading students...
                    </p>
                )}

                {message && (
                    <p className="management-message">
                        {message}
                    </p>
                )}

                {!loading && !message && students.length === 0 && (
                    <p className="management-message">
                        No students added yet.
                    </p>
                )}

                {!loading && students.length > 0 && (

                    <table className="management-table">

                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Semester</th>
                            </tr>
                        </thead>

                        <tbody>

                            {students.map((student) => (

                                <tr key={student._id}>

                                    <td>{student.studentId}</td>

                                    <td>
                                        {student.user?.name}
                                    </td>

                                    <td>
                                        {student.user?.email}
                                    </td>

                                    <td>
                                        {student.department}
                                    </td>

                                    <td>
                                        {student.semester}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}

export default Students;

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Students() {
//     const navigate = useNavigate();

//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         const fetchStudents = async () => {
//             try {
//                 const response = await fetch(
//                    // 'https://backend-exam-paper.vercel.app/students'
//                    'https://backend-exam-paper.vercel.app/students'
//                 );

//                 const result = await response.json();

//                 console.log('STUDENTS API RESPONSE:', result);

//                 if (!response.ok) {
//                     setMessage(result.message || 'Unable to fetch students');
//                     return;
//                 }

//                 setStudents(result.students || []);

//             } catch (error) {
//                 console.error('GET STUDENTS ERROR:', error);
//                 setMessage('Unable to connect to the server');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchStudents();
//     }, []);

//     return (
//         <div>
//             <h1>Students Management</h1>

//             <button onClick={() => navigate('/admin')}>
//                 Back to Dashboard
//             </button>

//             <button onClick={() => navigate('/students/add')}>
//                 Add Student
//             </button>

//             <h2>Student List</h2>

//             {loading && <p>Loading students...</p>}

//             {message && <p>{message}</p>}

//             {!loading && !message && students.length === 0 && (
//                 <p>No students added yet.</p>
//             )}

//             {!loading && students.length > 0 && (
//                 <table border="1" cellPadding="10">
//                     <thead>
//                         <tr>
//                             <th>Student ID</th>
//                             <th>Name</th>
//                             <th>Email</th>
//                             <th>Department</th>
//                             <th>Semester</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {students.map((student) => (
//                             <tr key={student._id}>
//                                 <td>{student.studentId}</td>
//                                 <td>{student.user?.name}</td>
//                                 <td>{student.user?.email}</td>
//                                 <td>{student.department}</td>
//                                 <td>{student.semester}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }

// export default Students;
