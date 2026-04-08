import Navbar from "../navbar/Navbar";
import DirectorApprovalList from "./directorApprovalList";
import SAHRTApprovalList from "./saHrtApprovalLIst";



const RequisitionApprovedList = () => {

    const roleName = localStorage.getItem("roleName");

    return (
        <div>
            <Navbar />

            {roleName === "ROLE_SA_HRT" ? (
                <SAHRTApprovalList />
            ) : roleName === "ROLE_DIRECTOR" ? (
                <DirectorApprovalList />
            ) : (
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "30vh" }}>
                    <h1 className="text-danger">Access Denied</h1>
                    <p className="text-center mt-5">You do not have permission to view this page.</p>
                </div>
            )}

        </div>
    );
}

export default RequisitionApprovedList;