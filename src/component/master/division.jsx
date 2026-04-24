import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { getDivisions } from "../../service/master.service";

const Division = () => {

    const [divisionList, setDivisionList] = useState([]);

    useEffect(() => {
        fetchDivisions();
    }, []);

    const fetchDivisions = async () => {
        try {
            const response = await getDivisions();
            setDivisionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching divisions:", error);
            Swal.fire("Error", "Failed to fetch division data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Division Code", selector: (row) => row.divisionCode, sortable: true, align: 'text-center' },
        { name: "Division Name", selector: (row) => row.divisionName, sortable: true, align: 'text-center' },
        { name: "Division Head Name", selector: (row) => row.divisionHeadName, sortable: true, align: 'text-start' },
    ];

    const mappedData = () => {
        return divisionList.map((desig, index) => ({
            sn: index + 1,
            divisionCode: desig.divisionCode,
            divisionName: desig.divisionName,
            divisionHeadName: desig.divHeadName,
        }));
    }

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Division List
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
    )
};

export default Division;