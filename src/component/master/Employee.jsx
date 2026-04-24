import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import "./masterPage.css";
import Swal from "sweetalert2";
import { getEmployees } from "../../service/master.service";


const Employee = () => {

    const [employeeList, setEmployeeList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");


    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire("Error", "Failed to fetch employee data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "PIS No", selector: (row) => row.pisNo, sortable: true, align: 'text-center' },
        { name: "Full Name", selector: (row) => row.empName, sortable: true, align: 'text-start' },
        { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-center' },
        { name: "Division", selector: (row) => row.division, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return employeeList.map((emp, index) => ({
            sn: index + 1,
            pisNo: emp.empNo,
            empName: (emp.empName || "").trim(),
            empDesigName: emp.empDesigName,
            division: emp.empDivCode,
        }));
    }


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Employee List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

        </div>
    );
}

export default Employee;