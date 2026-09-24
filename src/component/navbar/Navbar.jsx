import { useState, useEffect } from "react";
import { BiSolidExit } from "react-icons/bi";
import {
  FaEnvelopeOpenText,
  FaEye,
  FaHome,
  FaHSquare,
  FaProjectDiagram,
  FaRupeeSign,
  FaTimes,
  FaUserCircle,
  FaUserClock,
  FaUsersCog,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";
import { FaAddressCard, FaBell, FaCaretDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import {
  getHeaderModuleDetailList,
  getHeaderModuleList,
  getNotifiCount,
  getNotifiList,
  getUserManual,
  getWorkflow,
  updateNotification,
} from "../../service/admin.service";
import * as FaIcons from "react-icons/fa6";
import {
  checkUserProjectAccess,
  getReactAppUrls,
  getUserById,
} from "../../service/master.service";
import Swal from "sweetalert2";
import { BsFileEarmarkText, BsFillBoxSeamFill } from "react-icons/bs";
import {
  MdOutlineAccountTree,
  MdOutlineChangeCircle,
  MdOutlineFactCheck,
  MdOutlineFingerprint,
  MdOutlineMenuBook,
} from "react-icons/md";
import { IoAppsSharp } from "react-icons/io5";
import { Tooltip } from "bootstrap";
import { LuLayoutGrid } from "react-icons/lu";
import config from "../../environment/config";
import { logout } from "../../service/auth.service";
import { RiExchangeLine, RiLogoutCircleRLine } from "react-icons/ri";
import AlertConfirmation, {
  showAlert,
} from "../../common/AlertConfirmation.component";
import Select from "react-select";

const Navbar = () => {
  const navigate = useNavigate();
  const [headerModuleList, setHeaderModuleList] = useState([]);
  const [headerModuleDetailList, setHeaderModuleDetailList] = useState([]);
  const [notifiCount, setNotifiCount] = useState(0);
  const [notifiList, setNotifiList] = useState([]);

  const title = localStorage.getItem("title");
  const hindiTitle = localStorage.getItem("hindiTitle");
  const salutation = localStorage.getItem("salutation");
  const hindiSalutation = localStorage.getItem("hindiSalutation");
  const empName = localStorage.getItem("empName");
  const hindiEmpName = localStorage.getItem("hindiEmpName");
  const designationCode = localStorage.getItem("designationCode");
  const hindiEmpDesigName = localStorage.getItem("hindiEmpDesigName");
  const roleId = localStorage.getItem("roleId");
  const userName = localStorage.getItem("username") || "User";
  const roleName = localStorage.getItem("roleName");
  const hindiRoleName = localStorage.getItem("hindiRoleName");
  const loginId = localStorage.getItem("loginId");

  const user = JSON.parse(localStorage.getItem("user"));
  const encryptedUser = btoa(user.username);

  const currentRoleName = roleName.split("_").slice(1).join("-");

  const [selectedRole, setSelectedRole] = useState(null);

  const [appUrls, setAppUrls] = useState({});
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const translations = {
    en: {
      // Navbar
      home: "Home",
      logout: "Logout",
      notifications: "Notifications",
      noNotifications: "No Notifications",
      noActiveNotifications: "No active notifications",
      showAllAlerts: "Show All Alerts",

      // Language
      changeLanguage: "Change Language",

      // App Launcher
      accessDenied: "Access Denied",
      noAccess: "You do not have access to this application.",
      okay: "Okay",
      contactAdmin: "Contact System Admin if you need access.",

      // Alerts
      noOtherRoles: "No other roles available to change.",
      changeRoleBeforeSubmit: "Please change the Role Before Submit.",
      roleChangeConfirm: "Are you sure you want to change the role?",
      roleChangeSuccess: "Role changed successfully!",
      fetchRolesFailed: "Failed to fetch user roles. Please try again later.",

      // User Menu
      changeRole: "Change Role",
      changePassword: "Change Password",
      auditStamping: "Audit Stamping",
      userManual: "User Manual",
      workFlow: "Work Flow",

      // Notification Panel
      notificationPanel: "Notifications",
      noNotificationsAvailable: "No notifications available",
      viewDetails: "View Details",
      closePanel: "Close Panel",

      // Role Change Modal
      roleChange: "Role Change",
      close: "Close",
      loggedInRole: "Logged In Role",
      selectRole: "Change Role",
      change: "Change",
      roleChangeNote:
        "Note: If roles are changed, you will be redirected to the dashboard.",
    },

    hi: {
      // Navbar
      home: "होम",
      logout: "लॉगआउट",
      notifications: "सूचनाएँ",
      noNotifications: "कोई सूचना नहीं",
      noActiveNotifications: "कोई सक्रिय सूचना नहीं",
      showAllAlerts: "सभी सूचनाएँ देखें",

      // Language
      changeLanguage: "भाषा बदलें",

      // App Launcher
      accessDenied: "प्रवेश अस्वीकृत",
      noAccess: "आपको इस एप्लिकेशन का उपयोग करने की अनुमति नहीं है।",
      okay: "ठीक है",
      contactAdmin: "यदि आवश्यकता हो तो सिस्टम एडमिन से संपर्क करें।",

      // Alerts
      noOtherRoles: "बदलने के लिए कोई अन्य भूमिका उपलब्ध नहीं है।",
      changeRoleBeforeSubmit: "कृपया सबमिट करने से पहले भूमिका बदलें।",
      roleChangeConfirm: "क्या आप भूमिका बदलना चाहते हैं?",
      roleChangeSuccess: "भूमिका सफलतापूर्वक बदल दी गई।",
      fetchRolesFailed:
        "भूमिकाएँ प्राप्त नहीं हो सकीं। कृपया पुनः प्रयास करें।",

      // User Menu
      changeRole: "भूमिका बदलें",
      changePassword: "पासवर्ड बदलें",
      auditStamping: "लेखा-परीक्षण मुद्रांकन",
      userManual: "उपयोगकर्ता पुस्तिका",
      workFlow: "काम का तरीका",

      // Notification Panel
      notificationPanel: "सूचनाएँ",
      noNotificationsAvailable: "कोई सूचना उपलब्ध नहीं है",
      viewDetails: "विवरण देखें",
      closePanel: "पैनल बंद करें",

      // Role Change Modal
      roleChange: "भूमिका परिवर्तन",
      close: "बंद करें",
      loggedInRole: "वर्तमान भूमिका",
      selectRole: "भूमिका बदलें",
      change: "बदलें",
      roleChangeNote:
        "नोट: भूमिका बदलने के बाद आपको डैशबोर्ड पर पुनः भेज दिया जाएगा।",
    },
  };

  const t = translations[language];

  const handleShowAll = () => {
    setShowAll(true);
  };

  const handleClose = () => {
    setShowAll(false);
  };

  const handleRoleClose = () => {
    setShowRoleModal(false);
  };

  const LABCODE = config.LABCODE;

  const roles = JSON.parse(localStorage.getItem("roles") || []);
  const roleMap = JSON.parse(localStorage.getItem("hindiRoleMap"));


  const roleOptions = roles.map((item) => ({
    label: item,
    value: item,
  }));

  const defaultRole = roleOptions.find((item) => item.value === roleName);

  useEffect(() => {
    if (roleName) {
      fetchHeaderModuleList(roleName);
      fetchHeaderModuleDetailList(roleName);
    }
  }, [roleName]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout("L");
    // Save language
    const language = localStorage.getItem("language");
    localStorage.clear();
    // Restore language
    if (language) {
      localStorage.setItem("language", language);
    }
    navigate("/login");
  };

  const fetchHeaderModuleList = async (role) => {
    try {
      const moduleListResponse = await getHeaderModuleList(role);
      setHeaderModuleList(moduleListResponse);
    } catch (error) {
      console.error("Error fetching Header Module list:", error);
    }
  };

  const fetchHeaderModuleDetailList = async (role) => {
    try {
      const moduleDetailListResponse = await getHeaderModuleDetailList(role);
      setHeaderModuleDetailList(moduleDetailListResponse);
      const notifiCount = await getNotifiCount();
      const notifiList = await getNotifiList();
      setNotifiCount(notifiCount);
      setNotifiList(notifiList);
    } catch (error) {
      console.error("Error fetching Header Module Detail list:", error);
    }
  };

  const gotoNoti = async (event, item) => {
    event.preventDefault();

    try {
      const response = await updateNotification(item.notificationId);

      if (response.success) {
        const [notifiList, notifiCount] = await Promise.all([
          getNotifiList(),
          getNotifiCount()
        ]);

        setNotifiCount(notifiCount);
        setNotifiList(notifiList);

        const url = item.notificationUrl;
        navigate(`/${url}`);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };



  const formatName = () => {
    const cleanTitle = salutation && salutation !== "null" ? language === "en" ? salutation : hindiSalutation : title && title !== "null" ? language === "en" ? title : hindiTitle && hindiTitle != "null" ? hindiTitle : "" : "";
    const cleanName =
      empName && empName !== "null"
        ? language === "en"
          ? empName
          : hindiEmpName
        : "";
    const cleanDesignation =
      designationCode && designationCode !== "null"
        ? `, ${language === "en" ? designationCode : hindiEmpDesigName}`
        : "";

    return `${cleanTitle} ${cleanName}`.trim() + cleanDesignation;
  };

  const openUserManual = async () => {
    try {
      const blob = await getUserManual();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error('Error opening user manual:', error);
      Swal.fire({ icon: 'error', text: 'Failed to open user manual', confirmButtonText: 'OK' });
    }
  };


  const openWorkFlow = async () => {
    try {
      const blob = await getWorkflow();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error('Error opening workflow:', error);
      Swal.fire({ icon: 'error', text: 'Failed to open workflow', confirmButtonText: 'OK' });
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || selectedRole?.value === roleName) {
      showAlert("Please change the Role Before Submit.", null, "warning", null);
      return;
    }
    const confirm = await AlertConfirmation({
      title: "Are you Sure to change?",
      message: "",
    });
    if (confirm) {

      localStorage.setItem("roleName", selectedRole?.value);
      localStorage.setItem("hindiRoleName", roleMap[selectedRole.value]);
      navigate("/dashboard");
      showAlert(null, "Role Change Successfull!", "success", null);
      handleRoleClose();
    }
  };

  useEffect(() => {
    fetchAppUrls();
  }, []);

  const fetchAppUrls = async () => {
    try {
      const urls = await getReactAppUrls();
      const urlMap = {};
      urls.forEach(app => {
        if (app.isActive === 1) {
          urlMap[app.appCode] = app.appUrl;
        }
      });
      setAppUrls(urlMap);
    } catch (error) {
      console.error("Failed to fetch app URLs:", error);
    }
  };

  const apps = [
    {
      code: "PMS",
      name: "Project Management System",
      type: "jsp",
      icon: <FaProjectDiagram />,
      color: "#2196f3",
    },
    {
      code: "DMS",
      name: "Dak Management System",
      launchpath: "dashboard",
      icon: <FaEnvelopeOpenText />,
      action: "open",
      color: "#0d6efd",
    },
    {
      code: "IBAS",
      name: "Integrated Budget Accounting System",
      launchpath: "dashboard",
      icon: <FaRupeeSign />,
      action: "open",
      color: "#4caf50",
    },
    {
      code: "SIS",
      name: "Stores Inventory System",
      type: "jsp",
      icon: <BsFillBoxSeamFill />,
      color: "#17a2b8",
    },
    {
      code: "AMS",
      name: "Audit Management System",
      launchpath: "dashboard",
      icon: <MdOutlineFactCheck />,
      action: "open",
      color: "#dc3545",
    },
    // { code: 'HRMS', name: "Human Resource Management System", launchpath: 'dashboard', icon: <FaUsersCog />, action: 'open', color: '#20c997' },
    {
      code: "EMS",
      name: "Employee Management System",
      launchpath: "dashboard",
      icon: <FaUserTie />,
      action: "open",
      color: "#495057",
    },
    {
      code: "TMDS",
      name: "Top Management Dashboard System",
      launchpath: roleName === "ROLE_ADMIN" ? "maindashboard" : "userdashboard",
      icon: <IoAppsSharp />,
      action: "open",
      color: "#0d47a1",
    },
    {
      code: "PFTS",
      name: "Procurement File Tracking System",
      launchpath: "dashboard",
      icon: <BsFileEarmarkText />,
      action: "open",
      color: "#fd7e14",
    },
  ].map((app) => ({
    ...app,
    url:
      app.type === "jsp"
        ? appUrls[app.code] + `/TMDS?api_key=VTS_${encryptedUser}`
        : appUrls[app.code],
  }));

  const handleAppLaunch = async (app) => {
    setIsLauncherOpen(false);

    // Synchronous open prevents browser popup blockers
    const needsNewTab = app.action === 'open' || app.url !== '/under-development';
    const pendingWindow = needsNewTab ? window.open('', '_blank') : null;

    const hasAccess = await checkUserProjectAccess(app.code);
    if (!hasAccess) {
      pendingWindow?.close();
      Swal.fire({
        title: 'Access Denied',
        text: `You do not have access to ${app.code} application.`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Okay',
        footer: '<span>Contact System Admin if you need access.</span>',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      return;
    }

    const targetUrl = app.url;

    if (app.action === 'open') {
      const userData = localStorage.getItem("user");
      if (!userData) {
        pendingWindow?.close();
        return;
      }

      if (pendingWindow) {
        pendingWindow.location.href = `${targetUrl}/${app.launchpath}?${app.code.toLowerCase()}=true`;
      }

      // Handshake State (Scoped to this specific launch)
      let delivered = false;
      let attempts = 0;
      const maxAttempts = 10;
      let checkInterval;

      // 1. Listen for the child's acknowledgment
      const onAck = (event) => {
        // Security: Validate origin strictly
        if (event.origin !== new URL(targetUrl).origin) return;

        if (event.data?.type === "LOGIN_ACK") {
          delivered = true;
          clearInterval(checkInterval);
          window.removeEventListener("message", onAck);
        }
      };

      window.addEventListener("message", onAck);

      // 2. Poll the child window until acknowledged or timed out
      checkInterval = setInterval(() => {
        attempts++;

        if (delivered || attempts > maxAttempts || !pendingWindow || pendingWindow.closed) {
          clearInterval(checkInterval);
          window.removeEventListener("message", onAck);

          if (!delivered && attempts > maxAttempts) {
            Swal.fire({
              title: 'Sign-in Failed',
              text: `Could not complete sign-in to ${app.code}. Please try again.`,
              icon: 'error',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Okay',
              showClass: {
                popup: 'animate__animated animate__fadeInDown'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
              }
            });
            // showAuthError(`Could not complete sign-in to ${app.code}. Please try again.`);
          }
          return;
        }

        // 3. Send the payload
        try {
          pendingWindow.postMessage(
            { type: "LOGIN_SUCCESS", user: JSON.parse(userData) },
            targetUrl
          );
        } catch (e) {
          // Window may have been closed or navigating, safely ignore
        }
      }, 1000);
    } else if (targetUrl === '/under-development') {
      pendingWindow?.close();
      window.location.href = targetUrl;
    } else if (pendingWindow) {
      pendingWindow.opener = null;
      pendingWindow.location.href = app.url;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if the click is not on the launcher button or the dropdown
      if (isLauncherOpen && !event.target.closest(`.launcher-btn`) && !event.target.closest(`.app-launcher-dropdown`)) {
        setIsLauncherOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLauncherOpen]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if the click is not on the launcher button or the dropdown
      if (
        isLauncherOpen &&
        !event.target.closest(`.launcher-btn`) &&
        !event.target.closest(`.app-launcher-dropdown`)
      ) {
        setIsLauncherOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLauncherOpen]);

  const handleRoleChange = async () => {
    try {
      if (roleOptions.length <= 1) {
        showAlert("No other roles available to change.", null, "warning", null);
        return;
      }
      const userData = await getUserById(loginId);
      const roles = userData.data.roleNames || [];
      const hindiRoles = userData.data.hindiRoleNames || [];

      const hindiRoleMap = {};

      roles.forEach((role, i) => { hindiRoleMap[role] = hindiRoles[i]; });

      if (userData?.data) {
        localStorage.setItem("roles", JSON.stringify(userData.data.roleNames));
        localStorage.setItem("hindiRoleMap", JSON.stringify(hindiRoleMap));

        setShowRoleModal(true);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      showAlert(
        "Failed to fetch user roles. Please try again later.",
        null,
        "error",
        null,
      );
    }
  };

  return (
    <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark-new nav-ams">
      <div className="row w-100">
        <div className="container d-flex">
          <div className="col-md-4">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="/dashboard" className="nav-link p-0">
                  <div className="d-flex align-items-center gap-3 px-2 py-1">
                    <h3
                      className="mb-0 d-flex align-items-center ms-1"
                      style={{ fontWeight: 600 }}
                    >
                      <span className="neon-text">HRMS</span>
                    </h3>

                    <h6
                      className="mb-0 d-flex align-items-end login-name"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {formatName()} (
                      {language === "en" ? currentRoleName : hindiRoleName})
                    </h6>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-8 d-flex justify-content-end">
            <ul className="navbar-nav ms-auto">
              {LABCODE?.toLowerCase() === "cair" && (
                <li
                  className="nav-item position-relative"
                  style={{ listStyle: "none" }}
                  // onMouseEnter={() => setIsLauncherOpen(true)}
                  // onMouseLeave={() => setIsLauncherOpen(false)}
                  onClick={() => setIsLauncherOpen((prev) => !prev)}
                >
                  <button
                    className="nav-link border-0 "
                    style={{ color: "white" }}
                  >
                    <LuLayoutGrid size={22} />
                  </button>

                  {isLauncherOpen && (
                    <div className="app-launcher-dropdown">
                      <div className="app-grid">
                        {apps.map((app) => (
                          <div
                            key={app.code}
                            className="app-item"
                            onClick={() => handleAppLaunch(app)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content={app.name}
                          >
                            <div
                              className="app-icon"
                              style={{ color: app.color }}
                            >
                              {app.icon}
                            </div>
                            <span className="app-name">{app.code}</span>
                          </div>
                        ))}
                      </div>

                      {/* <Tooltip id="Tooltip" className="text-white tooltipName" /> */}
                    </div>
                  )}
                </li>
              )}

              <li>
                {" "}
                <div
                  className="language-tooltip-wrapper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "15px"
                  }}
                >
                  <span onClick={toggleLanguage} className="languageWrapper">
                    <svg className="svgBold" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none">
                      <path d="M37.6672 9.95973V31.9997H34.4272V9.95973H31.5071V7.11973H41.8271V9.95973H37.6672ZM22.5871 6.71973C24.6671 6.71973 26.2538 7.23973 27.3471 8.27973C28.4671 9.31973 29.0271 10.6264 29.0271 12.1997C29.0271 13.3464 28.7205 14.3864 28.1071 15.3197C27.5205 16.2264 26.6405 16.9464 25.4671 17.4797C24.2938 18.0131 22.8271 18.3064 21.0671 18.3597L20.8671 15.5597C22.6805 15.5064 23.9605 15.1864 24.7071 14.5997C25.4805 14.0131 25.8671 13.2264 25.8671 12.2397C25.8671 11.2797 25.5471 10.5864 24.9071 10.1597C24.2938 9.73306 23.5738 9.51973 22.7471 9.51973C21.7605 9.51973 20.8671 9.65306 20.0671 9.91973C19.2671 10.1864 18.4138 10.5464 17.5071 10.9997L16.5071 8.23973C17.2005 7.86639 18.0538 7.51973 19.0671 7.19973C20.1071 6.87973 21.2805 6.71973 22.5871 6.71973ZM29.4671 23.2797C29.4671 24.5064 29.1871 25.5331 28.6271 26.3597C28.0671 27.1864 27.3071 27.7997 26.3471 28.1997C25.4138 28.5997 24.3471 28.7997 23.1471 28.7997C21.6271 28.7997 20.2138 28.4264 18.9071 27.6797C17.6271 26.9331 16.4005 25.7464 15.2271 24.1197C14.0805 22.4931 12.9471 20.3731 11.8271 17.7597L14.6671 16.7197C15.4405 18.6131 16.2405 20.2531 17.0671 21.6397C17.9205 22.9997 18.8271 24.0531 19.7871 24.7997C20.7471 25.5197 21.7738 25.8797 22.8671 25.8797C23.8805 25.8797 24.7071 25.6531 25.3471 25.1997C25.9871 24.7197 26.3071 23.9597 26.3071 22.9197C26.3071 21.6397 25.8671 20.5331 24.9871 19.5997C24.1071 18.6664 23.0405 17.8131 21.7871 17.0397L24.1471 16.9197L25.8671 16.5597C26.2405 16.8797 26.6538 17.2664 27.1071 17.7197C27.5605 18.1731 27.9205 18.6264 28.1871 19.0797L28.3872 19.8397C28.7338 20.3464 29.0005 20.8797 29.1871 21.4397C29.3738 21.9997 29.4671 22.6131 29.4671 23.2797ZM30.1071 17.9997C31.3871 17.9997 32.4938 17.9064 33.4272 17.7197C34.3605 17.5064 35.4538 17.1731 36.7071 16.7197V19.5997C35.5605 20.1064 34.5205 20.4397 33.5871 20.5997C32.6805 20.7597 31.6805 20.8397 30.5871 20.8397C30.1871 20.8397 29.7205 20.8131 29.1871 20.7597C28.6538 20.6797 28.1471 20.5997 27.6671 20.5197C27.2138 20.4131 26.8805 20.3197 26.6671 20.2397L24.7871 17.9997L25.0271 17.3997C25.8005 17.5864 26.6138 17.7331 27.4671 17.8397C28.3205 17.9464 29.2005 17.9997 30.1071 17.9997Z" fill="#ffffff"></path>
                      <path d="M52.3467 58.6664L49.136 50.4158H38.5707L35.3973 58.6664H32L42.416 31.8984H45.44L55.8187 58.6664H52.3467ZM48.128 47.4291L45.1413 39.3651C45.0667 39.1659 44.9421 38.8051 44.768 38.2824C44.5939 37.7598 44.4195 37.2246 44.2453 36.6771C44.096 36.1046 43.9715 35.6691 43.872 35.3704C43.6728 36.1419 43.4613 36.9011 43.2373 37.6478C43.0381 38.3696 42.864 38.9419 42.7147 39.3651L39.6907 47.4291H48.128Z" fill="#ffffff"></path>
                    </svg>
                  </span>
                  <span className="language-tooltip">
                    {language === "en" ? "Change Language" : "भाषा बदलें"}
                  </span>
                </div>



              </li>

              <li className="nav-item dropdown">
                <a href="/dashboard" className="nav-link nav-animate">
                  <FaHome className="icon-name" />
                  {t.home}
                </a>
              </li>

              {headerModuleList.map((module, index) => {
                const filteredDetails = headerModuleDetailList.filter(
                  (detail) => detail.formModuleId === module.formModuleId,
                );

                return filteredDetails.length >= 1 ? (
                  <li key={index} className="nav-item dropdown">
                    <a className="nav-link nav-animate">
                      {(() => {
                        const IconComponent = FaIcons[module.moduleIcon];
                        return IconComponent ? (
                          <IconComponent className="icon-name" />
                        ) : null;
                      })()}

                      {language === "en"
                        ? module.formModuleName
                        : module.hindiFormModuleName}
                      <FaCaretDown className="arrow-down" />
                    </a>
                    <ul className="dropdown-menu mt-2">
                      {filteredDetails.map((detail, idx) => (
                        <li key={idx}>
                          <a
                            className="dropdown-item"
                            href={`/${detail?.formUrl}`}
                            onClick={() =>
                              localStorage.setItem(
                                "formDetailId",
                                detail.formDetailId,
                              )
                            }
                          >
                            {language === "en"
                              ? detail.formDispName
                              : detail.hindiFormDispName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={index} className="nav-item dropdown">
                    <a
                      href={`/${filteredDetails[0]?.formUrl ? filteredDetails[0]?.formUrl : "dashboard"}`}
                      className="nav-link nav-animate"
                      onClick={() =>
                        localStorage.setItem(
                          "formDetailId",
                          module.FormDetailId,
                        )
                      }
                    >
                      {module.formModuleName}
                    </a>
                  </li>
                );
              })}


              <li className="nav-item dropdown me-3">
                <a href="#" className="nav-link nav-animate">
                  <FaBell className="icon-name" />
                  <span className="notification-count">
                    {Number(notifiCount)}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-notification mt-2 dms-notification shadow-lg rounded p-0">
                  <li className="dropdown-header border-bottom text-dark employee-text py-2 bg-white sticky-top z-10 notificationStyles">
                    <strong className="fw-bold ">{t.notifications}</strong>
                  </li>

                  <div className="notifyStyles1">
                    {notifiList.length > 0 ? (
                      notifiList.map((item, index) => {
                        const formatMessage = (message) => {
                          if (message.length > 35) {
                            let splitPoint = message
                              .substring(0, 35)
                              .lastIndexOf(" ");
                            if (splitPoint === -1 || splitPoint < 15) {
                              splitPoint = 35;
                            }
                            const firstPart = message.substring(0, splitPoint);
                            const secondPart = message
                              .substring(splitPoint)
                              .trim();
                            return (
                              <>
                                {firstPart}
                                <br />
                                {secondPart}
                              </>
                            );
                          }
                          return message;
                        };

                        return (
                          <li key={index}>
                            <a
                              className="dropdown-item d-flex align-items-start gap-2 py-2 border-bottom"
                              href={item.notificationUrl}
                              onClick={(event) => gotoNoti(event, item)}
                            >
                              <span className="fs-14">
                                {formatMessage(item.notificationMessage)}
                              </span>
                            </a>
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-3 py-2 text-muted">
                        {t.noNotifications}
                      </li>
                    )}
                  </div>

                  {notifiList.length > 0 && (
                    <li className="dropdown-footer text-center py-2 bg-white sticky-bottom z-10 border-top">
                      <button
                        className="btn btn-link fs-14"
                        onClick={handleShowAll}
                      >
                        {t.showAllAlerts}
                      </button>
                    </li>
                  )}
                </ul>
              </li>
              <li className="nav-item dropdown position-relative ">
                <a
                  href="#"
                  className="nav-link dropdown-toggle "
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => e.preventDefault()}
                >
                  {userName}{" "}
                  <FaUserCircle
                    className="icon-name fa-user-circle"
                    size={30}
                  />
                </a>

                <ul
                  className="dropdown-menu mt-2"
                  style={{ right: 0, left: "auto" }}
                >
                  {roleOptions.length > 1 && (
                    <li className="dropdown-item">
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={handleRoleChange}
                      >
                        <RiExchangeLine className="ms-0 me-3" size={20} />{" "}
                        {t.changeRole}
                      </button>
                    </li>
                  )}
                  <li className="dropdown-item">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => navigate("/password-change")}
                    >
                      <MdOutlineChangeCircle className="ms-0 me-3" size={20} />{" "}
                      {t.changePassword}
                    </button>
                  </li>
                  <li className="dropdown-item">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => navigate("/audit-stamping")}
                    >
                      <MdOutlineFingerprint className="ms-0 me-3" size={20} />{" "}
                      {t.auditStamping}
                    </button>
                  </li>
                  <li className="dropdown-item">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={openUserManual}
                    >
                      <MdOutlineMenuBook className="ms-0 me-3" size={20} />
                      {t.userManual}
                    </button>
                  </li>

                  <li className="dropdown-item">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={openWorkFlow}
                    >
                      <MdOutlineAccountTree className="ms-0 me-3" size={20} />
                      {t.workFlow}
                    </button>
                  </li>
                  <li className="dropdown-item">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <RiLogoutCircleRLine className="ms-0 me-4" /> {t.logout}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>

            {showAll && (
              <>
                <div
                  className="notification-backdrop"
                  onClick={handleClose}
                ></div>

                <div className="notification-panel">
                  {/* Header Section */}
                  <div className="panel-header">
                    <div className="header-title">
                      <FaBell className="header-icon" />
                      <h5>{t.notificationPanel}</h5>
                      <span className="count-pill">{notifiList.length}</span>
                    </div>
                    <button
                      className="close-panel-btn"
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Body Section */}
                  <div className="panel-body">
                    {notifiList.length === 0 ? (
                      <div className="empty-state">
                        <p>{t.noNotificationsAvailable}</p>
                      </div>
                    ) : (
                      notifiList.map((notif) => (
                        <div
                          key={notif.notificationId}
                          className="notification-card"
                        >
                          {/* Left Side: Avatar */}
                          <div className="notification-left">
                            <div className="avatar-circle">
                              {notif.empName
                                ?.split(" ")
                                .filter((word) => word.length > 0)[1]
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>
                          </div>

                          {/* Right Side: Content */}
                          <div className="notification-content">
                            <div className="content-top">
                              <span className="emp-name">{notif.empName}</span>
                            </div>

                            <p className="notification-message">
                              {notif.notificationMessage}
                            </p>

                            {/* Footer Row: Button (Left) and Date (Right) */}
                            <div className="notification-footer-row">
                              {notif.notificationUrl ? (
                                <button
                                  onClick={(event) => gotoNoti(event, notif)}
                                  className="view-link-btn"
                                >
                                  <FaEye /> View Details
                                </button>
                              ) : (
                                <div className="spacer"></div>
                              )}
                              <span className="timestamp">
                                {notif.notificationDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bottom Footer */}
                  <div className="panel-footer-main">
                    <button onClick={handleClose} className="footer-close-btn">
                      Close Panel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showRoleModal && (
        <div
          className={`modern-modal-overlay ${showRoleModal ? "open" : ""}`}
          onClick={handleRoleClose}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <span className="modern-modal-title">Role Change</span>
              <span className="searchClose" onClick={handleRoleClose}>
                Close
              </span>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "26px",
                  borderRadius: "10px",
                  background: "#eef2ff",
                }}
              >
                <FaUserShield color="#4f46e5" size={22} />

                <span
                  style={{ fontSize: "18px", fontWeight: "600", color: "#555" }}
                >
                  Logged In Role:
                </span>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#4f46e5",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {currentRoleName}
                </span>
              </div>

              <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                <label className="form-label mb-0 fw-semibold">
                  Change Role:
                </label>

                <Select
                  className="w-30"
                  options={roleOptions}
                  value={selectedRole || defaultRole}
                  onChange={setSelectedRole}
                />
              </div>
              <div className="d-flex justify-content-center mt-5">
                <button className="btn-change" onClick={() => handleSubmit()}>
                  Change
                </button>
              </div>
            </div>
            <div className="d-flex justify-content-start p-4">
              <span className="info-text">
                Note: If roles are changed, you will be redirected to the
                dashboard.
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
