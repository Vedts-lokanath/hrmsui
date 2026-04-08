import { useState } from "react";
import Navbar from "../navbar/Navbar";
import styles from "./AllReportsTemplate.module.css";
import { Tooltip } from "react-tooltip";
import { FiMenu, FiSearch, FiFileText, FiChevronLeft } from "react-icons/fi";
import DynamicReportViewer from "./DynamicReportViewer";


const REPORTS_LIST = [
    { id: "1", name: "Nominal Roll" },
    { id: "2", name: "Training Report (Course)" },
    { id: "3", name: "Training Report (Seminar/Symposia/Conferences/Workshop)" },
    { id: "4", name: "CEP" },
    { id: "5", name: "Details of Sponsorship to Higher Degree M.Tech" },
    { id: "6", name: "Details of Sponsorship to Higher Degree Ph.D" },
    { id: "7", name: "HR Distribution Project wsie Tech/Non Tech Deployment of DRDS & DRTC" },
];

const AllReportsTemplate = () => {
    const [activeReport, setActiveReport] = useState(REPORTS_LIST[0].id);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter logic for the search bar
    const filteredReports = REPORTS_LIST.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <>
            <Navbar />

            <div className={styles.pageWrapper}>
                <div className={styles.mainLayout}>
                    {/* Sidebar */}
                    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
                        <div className={styles.sidebarHeader}>
                            {!isCollapsed && (
                                <div className={styles.searchWrapper}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input type="text" placeholder="Search reports..." className={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            )}
                            <button className={styles.toggleBtn}
                                onClick={() => setIsCollapsed(!isCollapsed)} data-tooltip-id="Tooltip" data-tooltip-place="right" data-tooltip-content={isCollapsed ? "Expand" : "Collapse"}
                            >
                                {isCollapsed ? <FiMenu /> : <FiChevronLeft />}
                            </button>
                        </div>

                        <ul className={styles.reportList}>
                            {filteredReports.map((report) => (
                                <li
                                    key={report.id}
                                    className={`${styles.reportItem} ${activeReport === report.id ? styles.active : ""}`}
                                    onClick={() => setActiveReport(report.id)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content={report.name}
                                >
                                    <span className={styles.icon}><FiFileText /></span>
                                    {!isCollapsed && <span className={styles.label}>{report.name}</span>}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Content Area */}
                    <main className={styles.content}>
                        <div className="container-fluid">
                            <header className={styles.contentHeader}>
                                <div>
                                    <h3>{REPORTS_LIST.find(r => r.id === activeReport)?.name}</h3>
                                </div>
                            </header>

                            {/* Only one component call, completely dynamic! */}
                            <div className={styles.tableWrapper}>
                                <DynamicReportViewer reportId={activeReport} />
                            </div>

                        </div>
                    </main>
                </div>
            </div>
            <Tooltip id="Tooltip" className="text-white tooltipName" />
        </>
    );
}

export default AllReportsTemplate;