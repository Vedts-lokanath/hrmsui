import { format } from "date-fns";
import { useEffect, useState, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import Datatable from "../../datatable/Datatable";
import { getAuditStampingList, getUserManagerList } from "../../service/admin.service";
import Navbar from "../navbar/Navbar";


const AuditStampingList = () => {

  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [auditStampList, setAuditStampList] = useState([]);


  const today = new Date();
  const [fromDate, setFromDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [toDate, setToDate] = useState(today);
  
  const roleName = localStorage.getItem("roleName");
  const loginId = localStorage.getItem("loginId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (selectedUser && fromDate && toDate) {
      fetchAuditData(selectedUser, fromDate, toDate);
    }
  }, [selectedUser, fromDate, toDate]);


  const fetchAuditData = useCallback(async (user, from, to) => {
    if (!user?.value) return;
    try {
      const fornatFromDate = format(new Date(from), "yyyy-MM-dd");
      const fornatToDate = format(new Date(to), "yyyy-MM-dd");
      const data = await getAuditStampingList(user.value, fornatFromDate, fornatToDate);

      setAuditStampList(Array.isArray(data) ? data : []);
     
    } catch (err) {
      console.error("Failed to fetch audit data", err);
    }
  }, []);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userManagerList = await getUserManagerList();

        const allUsers = Array.isArray(userManagerList.data) ? userManagerList.data : [];

        const filteredData = roleName === "ROLE_ADMIN"
          ? allUsers
          : allUsers.filter((u) => String(u.loginId) === String(loginId));

     const options = filteredData.map((u) => ({
         value: u.username,
         label: u.employeeName
         ? `${u.username} (${u.employeeName})`
         : u.username
}));
        
        setUserList(options);


        if (!selectedUser && options.length > 0) {
          const defaultUser = roleName === "ROLE_ADMIN"
            ? (options.find((opt) => opt.value === username) || options[0])
            : options[0];
          setSelectedUser(defaultUser);
        }
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };
    fetchUsers();

  }, [roleName]);



  const columns = [
    { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center', width: '5%' },
    { name: "Login Date", selector: (row) => row.loginDate, sortable: true, align: 'text-center', width: '25%' },
    { name: "IP Address", selector: (row) => row.ipAddress, align: 'text-center', width: '25%' },
    { name: "Logout Type", selector: (row) => row.logoutType, align: 'text-center', width: '20%' },
    { name: "Logout Date", selector: (row) => row.logoutDateTime, align: 'text-center', width: '25%' },
  ];

  const mappedData = useMemo(() => {
    return auditStampList.map((item, index) => ({
      sn: index + 1,
      loginDate: item.loginDate ? format(new Date(item.loginDate), "dd-MM-yyyy HH:mm:ss") : "-",
      ipAddress: item.ipAddress || "-",
      logoutType: item.logoutType ? "Log out" : "Session Expired",
      logoutDateTime: item.logoutDateTime ? format(new Date(item.logoutDateTime), "dd-MM-yyyy HH:mm:ss") : "-",
    }));
  }, [auditStampList]);



  return (
    <div >
      <Navbar />
      <h3 className="fancy-heading mt-3">
        Audit Stamping List
        <span className="underline-glow">
          <span className="pulse-dot"></span>
          <span className="pulse-dot"></span>
          <span className="pulse-dot"></span>
        </span>
      </h3>

      <div className="row g-2 justify-content-end m-2 p-2">

        <div className="col-md-4 d-flex align-items-center text-start">
          <label className="form-label mb-0 text-white">Username: </label>
          <div className="w-100">
            <Select
              options={userList}
              value={selectedUser}
              onChange={setSelectedUser}
              isSearchable
              className="text-start"
            />
          </div>
        </div>


        <div className="col-md-2 d-flex align-items-center">
          <label className="form-label mb-0 text-white">From: </label>
          <DatePicker
            className="form-control"
            selected={fromDate}
            onChange={(d) => setFromDate(d)}
            dateFormat="dd-MM-yyyy"
            placeholderText="From Date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            onKeyDown={(e) => e.preventDefault()}
          />
        </div>


        <div className="col-md-2 d-flex align-items-center">
          <label className="form-label mb-0 text-white">To: </label>
          <DatePicker
            className="form-control"
            selected={toDate}
            onChange={(d) => setToDate(d)}
            dateFormat="dd-MM-yyyy"
            placeholderText="To Date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            minDate={fromDate}
            onKeyDown={(e) => e.preventDefault()}
          />
        </div>
      </div>

      <div id="card-body" className="p-2 mt-2">
        <Datatable columns={columns} data={mappedData} />
      </div>

    </div>
  );
};

export default AuditStampingList;
