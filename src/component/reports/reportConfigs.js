import { format } from "date-fns";
import { formatIndianRupee, sqlToRegularDate } from "../utils/formatterUtils";

export const REPORT_CONFIGS = {
  "1": {
    fileName: "Nominal_Roll",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center', width: "5%" },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center', width: "8%" },
      { name: "Sr No", selector: (row) => row.srNo, sortable: true, align: 'text-center', width: "5%" },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center', width: "8%" },
      { name: "Employee Name", selector: (row) => row.empName, sortable: true, align: 'text-left', width: "13%" },
      { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-center', width: "7%" },
      { name: "Division/Group", selector: (row) => row.empDivCode, sortable: true, align: 'text-center', width: "7%" },
      { name: "Gender", selector: (row) => row.employeeDetails?.gender, sortable: true, align: 'text-center', width: "7%" },
      { name: "Category", selector: (row) => row.employeeDetails?.category, sortable: true, align: 'text-center', width: "7%" },
      // { name: "Qualification at the time of joining", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "University", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Subject", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Year of Passing", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Qualification Acquired", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "University", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Subject2", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Year of Passing2", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Mode of Induction", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      { name: "Date of Birth", selector: (row) => sqlToRegularDate(row.employeeDetails?.dob), sortable: true, align: 'text-center', width: "9%" },
      // { name: "Date of Retirement", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Date of Present Design", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Date of Previous Design", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      // { name: "Date of Join in Present Establishment", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      { name: "Date of Join in DRDO", selector: (row) => sqlToRegularDate(row.labDetails?.dateOfJoiningDRDO), sortable: true, align: 'text-center', width: "9%" },
      // { name: "Previous Establishment", selector: (row) => row.desigGroup, sortable: true, align: 'text-left', width: "10%" },
      { name: "Initial Posting Lab", selector: (row) => row.labDetails?.initialPostingLab, sortable: true, align: 'text-center', width: "7%" },
      { name: "Permanent Address", selector: (row) => row.permanentAddress, sortable: true, align: 'text-left', width: "10%" },
    ],
    fetchUrl: "nominal-roll",
  },

  "2": {
    fileName: "Training Report (Course)",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center', width: "12%"  },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center', width: "18%" },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center' },
      { name: "Employee Name", selector: (row) => row.initiatingOfficerName, sortable: true, align: 'text-left', width: "18%" },
      { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-center' },
      { name: "Division/Group", selector: (row) => row.empDivCode, sortable: true, align: 'text-center' },
      // { name: "Gender", selector: (row) => row.gen, sortable: true, align: 'text-center', width: "6%" },
      { name: "Title of the Course", selector: (row) => row.courseName, sortable: true, align: 'text-left', width: "15%" },
      // { name: "Req. Emerged through (TNI,RAC,LTPP,Open)", selector: (row) => row.sportsPerson, sortable: true, align: 'text-center', width: "12%" },
      // { name: "Areas (Tecgnical/MDP)", selector: (row) => row.directRecruitment, sortable: true, align: 'text-center', width: "10%" },
      { name: "Course Type", selector: (row) => row.courseType, sortable: true, align: 'text-center' },
      { name: "Course Level", selector: (row) => row.courseLevel, sortable: true, align: 'text-center' },
      { name: "Organizing Agency", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
      { name: "City", selector: (row) => row.venue, sortable: true, align: 'text-center' },
      { name: "Period (In days)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
      { name: "Registration Fee (Rs.)", selector: (row) => formatIndianRupee(row.registrationFee), sortable: true, align: 'text-end' },
    ],
    fetchUrl: "course-training",
  },

  "3": {
    fileName: "Training Report(s) (Seminar/Symposium/Conference/Workshop)",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center', width: "12%" },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center', width: "18%" },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center' },
      { name: "Employee Name", selector: (row) => row.initiatingOfficerName, sortable: true, align: 'text-left', width: "18%" },
      { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-center' },
      { name: "Division/Group", selector: (row) => row.empDivCode, sortable: true, align: 'text-center' },
      // { name: "Gender", selector: (row) => row.gen, sortable: true, align: 'text-center', width: "6%" },
      // { name: "Seminar/Symposia/Conferences/Workshop", selector: (row) => row.absenceDays, sortable: true, align: 'text-center' },
      { name: "Title of the Course", selector: (row) => row.courseName, sortable: true, align: 'text-left', width: "15%" },
      // { name: "International/National", selector: (row) => row.eolPg, sortable: true, align: 'text-center' },
      { name: "Course Type", selector: (row) => row.courseType, sortable: true, align: 'text-center' },
      { name: "Course Level", selector: (row) => row.courseLevel, sortable: true, align: 'text-center' },
      { name: "Organizing Agency", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
      { name: "City", selector: (row) => row.venue, sortable: true, align: 'text-center' },
      { name: "Period (In days)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
      { name: "Registration Fee (Rs.)", selector: (row) => formatIndianRupee(row.registrationFee), sortable: true, align: 'text-end' },
      // { name: "Nos. of Papers Presented", selector: (row) => row.deputation, sortable: true, align: 'text-center', width: "10%" },
    ],
    fetchUrl: "seminar-training",
  },

  "4": {
    fileName: "In-House CEP",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "Division/Group", selector: (row) => row.divisionCode, sortable: true, align: 'text-center' },
      { name: "Duration of CEP", selector: (row) => row.duration, sortable: true, align: 'text-center' },
      { name: "No of Participants", selector: (row) => row.noOfParticipants, sortable: true, align: 'text-center' },
      { name: "Total Amount (Rs.)", selector: (row) => formatIndianRupee(row.totalAmount), sortable: true, align: 'text-end', width: '15%' },
      { name: "Amount Spent (Rs.)", selector: (row) => formatIndianRupee(row.amountSpent), sortable: true, align: 'text-end', width: '15%' },
      { name: "Course Co-ordinator", selector: (row) => row.courseCoordinatorName, sortable: true, align: 'text-left' },
      { name: "Deputy Course Co-ordinator", selector: (row) => row.deputyCourseCoordinatorName, sortable: true, align: 'text-left' },
      { name: "Course Co-ordinator Feedback/Comments", selector: (row) => row.comments, sortable: true, align: 'text-left' },
    ],
    fetchUrl: "cep",
  },

  "5": {
    fileName: "Details of Sponsorship to Higher Degree M.Tech",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "R&T/Delegated Power", selector: (row) => row.delegatedPower, sortable: true, align: 'text-left' },
      { name: "Regular/Part Time", selector: (row) => row.discipline, sortable: true, align: 'text-left' },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center', width: "8%" },
      { name: "Employee Name", selector: (row) => row.employeeName, sortable: true, align: 'text-left', width: "15%" },
      { name: "Designation", selector: (row) => row.empDesigCode, sortable: true, align: 'text-center', width: "7%" },
      { name: "Division/Group", selector: (row) => row.empDivCode, sortable: true, align: 'text-center', width: "6%" },
      // { name: "Gender", selector: (row) => row.gender, sortable: true, align: 'text-center' },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center', width: "8%" },
      { name: "Subject/Branch", selector: (row) => row.subject, sortable: true, align: 'text-left' },
      { name: "University", selector: (row) => row.university, sortable: true, align: 'text-left' },
      { name: "India/Abroad", selector: (row) => row.preference, sortable: true, align: 'text-left' },
      { name: "City", selector: (row) => row.city, sortable: true, align: 'text-left' },
      { name: "Registration Year", selector: (row) => row.fromDate ? format(new Date(row.fromDate), 'yyyy') : "-", sortable: true, align: 'text-center' },
      { name: "Period", selector: (row) => row.period, sortable: true, align: 'text-center' },
      { name: "Expenditure (Rs.)", selector: (row) => formatIndianRupee(row.expenditure), sortable: true, align: 'text-end', width: "10%" },
    ],
    fetchUrl: "sponsor-mtech",
  },

  "6": {
    fileName: "Details of Sponsorship to Higher Degree Ph.D",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "R&T/Delegated Power", selector: (row) => row.delegatedPower, sortable: true, align: 'text-left' },
      { name: "Regular/Part Time", selector: (row) => row.discipline, sortable: true, align: 'text-left' },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-left', width: "8%" },
      { name: "Employee Name", selector: (row) => row.employeeName, sortable: true, align: 'text-left', width: "15%" },
      { name: "Designation", selector: (row) => row.empDesigCode, sortable: true, align: 'text-left', width: "7%" },
      { name: "Division/Group", selector: (row) => row.empDivCode, sortable: true, align: 'text-center', width: "6%" },
      // { name: "Gender", selector: (row) => row.gender, sortable: true, align: 'text-center' },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center', width: "8%" },
      { name: "Subject/Branch", selector: (row) => row.subject, sortable: true, align: 'text-left' },
      { name: "University", selector: (row) => row.university, sortable: true, align: 'text-left' },
      { name: "India/Abroad", selector: (row) => row.preference, sortable: true, align: 'text-left' },
      { name: "City", selector: (row) => row.city, sortable: true, align: 'text-left' },
      { name: "Registration Year", selector: (row) => row.fromDate ? format(new Date(row.fromDate), 'yyyy') : "-", sortable: true, align: 'text-center' },
      { name: "Period", selector: (row) => row.period, sortable: true, align: 'text-left' },
      { name: "Expenditure (Rs.)", selector: (row) => formatIndianRupee(row.expenditure), sortable: true, align: 'text-end', width: "10%" },
    ],
    fetchUrl: "sponsor-phd",
  },

  "7": {
    fileName: "HR Distribution Project Wise Tech/Non Tech Deployment of DRDS & DRTC",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-left' },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center' },
      { name: "Employee Name", selector: (row) => row.employeeName, sortable: true, align: 'text-left' },
      { name: "Division", selector: (row) => row.empDivCode, sortable: true, align: 'text-center' },
      { name: "Name of IO/AO", selector: (row) => row.aoOfficerName, sortable: true, align: 'text-left' },
      { name: "Name of RO Officer", selector: (row) => row.roOfficerName, sortable: true, align: 'text-left' },
      {
        name: "Project",
        selector: (row) => (
          <div className="d-flex flex-column">
            {row.roleDtoList?.map((r, index) => (
              <span key={index} className="py-1 border-bottom cs-140w">
                {r.projectCode}
              </span>
            ))}
          </div>
        ),
        align: "text-center",
      },
      {
        name: "Appointment",
        selector: (row) => (
          <div className="d-flex flex-column">
            {row.roleDtoList?.map((r, index) => (
              <span key={index} className="py-1 border-bottom cs-140w">
                {r.roleName}
              </span>
            ))}
          </div>
        ),
        align: "text-center"
      },
      { name: "Tech Activity Involved", selector: (row) => row.techActivity, sortable: true, align: 'text-left' },
      { name: "Non-Tech & Administrative Activity Involved", selector: (row) => row.nonTechActivity, sortable: true, align: 'text-left' },
    ],
    fetchUrl: "hr-distribution",
  },

  "8": {
    fileName: "Annual Training Report",
    columns: [],
    fetchUrl: "annual-training",
  },

  "9": {
    fileName: "Detailed of Research Paper in International Journals",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "International/National", selector: (row) => row.journalType === "N" ? "National" : "International", sortable: true, align: 'text-center' },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center' },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center' },
      { name: "Employee Name", selector: (row) => row.employeeName, sortable: true, align: 'text-left', width: "18%" },
      { name: "Title of Paper", selector: (row) => row.titleOfPaper, sortable: true, align: 'text-left' },
      { name: "Journal", selector: (row) => row.journalName, sortable: true, align: 'text-left' },
      { name: "Volume", selector: (row) => row.volume, sortable: true, align: 'text-center' },
      { name: "Impact factor of Journal", selector: (row) => row.impactFactor, sortable: true, align: 'text-center' },
      { name: "Publication Fee, if any (Rs.)", selector: (row) => formatIndianRupee(row.publicationFee), sortable: true, align: 'text-end' },
    ],
    fetchUrl: "research-paper-int",
  },

  "10": {
    fileName: "Detailed of Research Paper in Seminar/Symposium/Conference/Workshop",
    columns: [
      { name: "SN", selector: (row) => row.sn, sortable: false, align: 'text-center' },
      { name: "International/National", selector: (row) => row.courseLevel, sortable: true, align: 'text-center' },
      { name: "PIS No", selector: (row) => row.empNo, sortable: true, align: 'text-center' },
      { name: "Cadre", selector: (row) => row.desigCadre, sortable: true, align: 'text-center' },
      { name: "Employee Name", selector: (row) => row.initiatingOfficerName, sortable: true, align: 'text-left' },
      { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-left' },
      { name: "Title of Paper", selector: (row) => row.titleOfPaper, sortable: true, align: 'text-left' },
      { name: "Name of conference", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
      { name: "Organizing agency", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
      { name: "City", selector: (row) => row.venue, sortable: true, align: 'text-left' },
      { name: "Duration (In Days)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
      { name: "Registration Fee, if any (Rs.)", selector: (row) => formatIndianRupee(row.registrationFee), sortable: true, align: 'text-end' },
    ],
    fetchUrl: "research-paper",
  },

  "11": {
    fileName: "Budget Expenditure",
    columns: [],
    fetchUrl: "budget-expenditure",
  },

  "12": {
    fileName: "Gender Budgeting",
    columns: [],
    fetchUrl: "gender-budgeting",
  },

  "13": {
    fileName: "Training of SC/ST Employees",
    columns: [],
    fetchUrl: "training-scst",
  },

};