import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { getAgencies, getCourseList, getCourseListByDateRange } from "../../service/training.service";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";
import Select from "react-select";
import { FaEdit } from "react-icons/fa";
import { usePermission } from "../../common/usePermission";
import { useLocation, useNavigate } from "react-router-dom";
import CourseModal from "./courseModal";
import { format } from 'date-fns';
import { generateFinancialYears, getDefaultFinancialYear } from "../utils/financialYearUtils";


export const financialYearOptions = generateFinancialYears();

const CourseList = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Course");

    const navigate = useNavigate();
    const location = useLocation();
    const stateOrgId = location?.state;

    const [filterOrganizeList, setFilterOrganizeList] = useState([]);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [agencyList, setAgencyList] = useState([]);
    const [editData, setEditData] = useState();
    const [selectedOrgId, setSelectedOrgId] = useState(stateOrgId ?? 0);
    const [selectedYearOption, setSelectedYearOption] = useState(() => getDefaultFinancialYear(financialYearOptions));


    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const response = await getAgencies();
            setAgencyList(response?.data || []);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            Swal.fire("Error", "Failed to fetch agency data. Please try again later.", "error");
        }
    };

    useEffect(() => {
        if (stateOrgId) {
            setSelectedOrgId(stateOrgId);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, []);

    const handleChangeYear = (selectedOption) => {
        setSelectedYearOption(selectedOption);
    };

    useEffect(() => {
        if (selectedOrgId !== null && selectedOrgId !== undefined && selectedYearOption) {
            fetchCourseData(selectedOrgId, selectedYearOption);
        }
    }, [selectedOrgId, selectedYearOption]);

    const fetchCourseData = async (orgId, selectedYear) => {
        try {
            const fromDate = format(new Date(selectedYear.startYear, 3, 1), 'yyyy-MM-dd');
            const toDate = format(new Date(selectedYear.endYear, 2, 31), 'yyyy-MM-dd');

            const response = await getCourseListByDateRange(orgId, fromDate, toDate);
            setFilterOrganizeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            Swal.fire("Error", "Failed to fetch programs data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Course Type", selector: (row) => row.courseType, sortable: true, align: 'text-center' },
        { name: "Course Code", selector: (row) => row.courseCode, sortable: true, align: 'text-center' },
        { name: "Course Name", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Venue", selector: (row) => row.venue, sortable: true, align: 'text-left' },
        { name: "Eligibility", selector: (row) => row.eligibility, sortable: true, align: 'text-left' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Offline Fee (₹)", selector: (row) => row.offlineRegistrationFee, sortable: true, align: 'text-center' },
        { name: "Online Fee (₹)", selector: (row) => row.onlineRegistrationFee, sortable: true, align: 'text-center' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return filterOrganizeList.map((item, index) => ({
            sn: index + 1,
            courseType: item.courseType || "-",
            courseCode: item.courseCode || "NA",
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            venue: item.venue || "-",
            eligibility: item.eligibilityName || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            offlineRegistrationFee: item.offlineRegistrationFee || "-",
            onlineRegistrationFee: item.onlineRegistrationFee || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };

    const handleEdit = (item) => {
        setEditData(item);
        setShowProgramModal(true);
    }

    const handleAdd = () => {
        setEditData(null);
        setShowProgramModal(true);
    }

    const handleChangeOrganizer = (orgId) => {
        setSelectedOrgId(orgId);
    };


    const organizerOptions = [
        { value: 0, label: "All" },
        ...agencyList.map((data) => ({
            value: data?.organizerId,
            label: data?.organizer
        }))
    ];


    return (
        <div>
            <h3 className="fancy-heading mt-3">
                Course List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex flex-wrap align-items-end justify-content-end gap-3 ms-auto me-3">

                {/* Organizer Dropdown */}
                <div className="d-flex align-items-center gap-2">
                    <label className="font-label fw-bold me-3 mb-0">Organizer :</label>
                    <div style={{ width: '300px' }} className="text-start">
                        <Select
                            options={organizerOptions}
                            value={organizerOptions.find((item) => item.value === selectedOrgId) || null}
                            onChange={(selectedOption) => {
                                const selectedValue = selectedOption ? selectedOption.value : 0;
                                setSelectedOrgId(selectedValue);
                            }}
                            placeholder="Select Organizer"
                            isSearchable
                        />
                    </div>
                </div>

                {/* Year Dropdown */}
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold mb-0 text-nowrap">Year :</label>
                    <div style={{ width: '180px' }} className="text-start">
                        <Select
                            options={financialYearOptions}
                            value={selectedYearOption}
                            onChange={handleChangeYear}
                            placeholder="Select Year"
                            isSearchable={false}
                        />
                    </div>
                </div>

            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd &&
                    <button
                        className="add"
                        onClick={handleAdd}>
                        ADD NEW
                    </button>
                }
            </div>

            {showProgramModal && (
                <CourseModal
                    showProgramModal={showProgramModal}
                    setShowProgramModal={setShowProgramModal}
                    editData={editData}
                    setEditData={setEditData}
                    selectedOrgId={selectedOrgId}
                    selectedYear={selectedYearOption}
                    fetchCourseData={fetchCourseData}
                />
            )}

        </div>
    );
}

export default CourseList;