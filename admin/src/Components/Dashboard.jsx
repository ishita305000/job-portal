
import React, { useEffect, useState } from "react";
import { dashboardStyles, statColors } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building,
  CheckCircle,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";

const Dashboard = () => {
  const s = dashboardStyles;

  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    closedJobs: 0,
    totalApplicants: 0,
    totalCompanies: 0,
  });

  const [toast, setToast] = useState(null);
  const [jobs, setJobs] = useState([]);

  const navigate = useNavigate();

  // Get authentication token
  const getToken = () => localStorage.getItem("token");

  // Common API headers
  const getHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Map jobs data
  const mapJobs = (jobsData) => {
    return (jobsData || []).map((j) => ({
      id: j._id,
      name: j.companyName,
      role: j.roleName,
      location: j.location,
      category: j.category,
      logo: j.companyLogo?.startsWith("http")
        ? j.companyLogo
        : `http://localhost:5000${j.companyLogo || ""}`,
      applicants: j.applicantsCount || 0,
      status: j.status || "active",
    }));
  };

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch stats
      const statsRes = await fetch(
        `${API}/job/admin/stats`,
        {
          headers: getHeaders(token),
        }
      );

      if (statsRes.status === 401 || statsRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!statsRes.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      const statsData = await statsRes.json();

      if (statsData.success) {
        setDashboardStats(statsData.stats);
      }

      // Fetch jobs
      const jobRes = await fetch(
        `${API}/job/admin/jobs`,
        {
          headers: getHeaders(token),
        }
      );

      if (jobRes.status === 401 || jobRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!jobRes.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await jobRes.json();

      if (jobsData.success) {
        setJobs(mapJobs(jobsData.jobs));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      setToast({
        message: error.message || "Failed to fetch dashboard data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast && !toast.confirm) {
      const timer = setTimeout(() => setToast(null), 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle close job
  const handleCloseJob = (jobId) => {
    setToast({
      message: "Are you sure you want to close this job?",
      type: "confirm",
      confirm: true,
      jobId,
    });
  };

  // Confirm close job
  const handleConfirmClose = async () => {
    if (!toast?.jobId) return;

    const jobId = toast.jobId;
    setToast(null);

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${API}/job/${jobId}/close`,
        {
          method: "PATCH",
          headers: getHeaders(token),
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({
          message: "Job closed successfully!",
          type: "success",
        });

        await fetchData();
      } else {
        setToast({
          message: data.message || "Failed to close job",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error closing job:", error);

      setToast({
        message: "Failed to close job",
        type: "error",
      });
    }
  };

  // Dashboard stats
  const stats = [
    {
      label: "Total Jobs",
      value: dashboardStats.totalJobs,
      icon: Briefcase,
      colors: statColors.blue,
    },
    {
      label: "Closed Jobs",
      value: dashboardStats.closedJobs,
      icon: Briefcase,
      colors: statColors.rose,
    },
    {
      label: "Total Applicants",
      value: dashboardStats.totalApplicants,
      icon: Users,
      colors: statColors.emerald,
    },
    {
      label: "Active Companies",
      value: dashboardStats.totalCompanies,
      icon: Building,
      colors: statColors.amber,
    },
  ];

  // Unique companies and roles
  const uniqueCompanies = [...new Set(jobs.map((job) => job.name))];
  const uniqueRoles = [...new Set(jobs.map((job) => job.role))];

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesCompany =
      companyFilter === "" || job.name === companyFilter;

    const matchesRole =
      roleFilter === "" || job.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;

    return matchesCompany && matchesRole && matchesStatus;
  });

  // Logo fallback
  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling?.classList.remove("hidden");
  };

  // Clear filters
  const clearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setStatusFilter("active");
  };

  return (
    <div className={s.container}>
      {/* Toast */}
      {toast && (
        <div className={s.toastWrapper}>
          <div
            className={`${s.toastBase} ${
              toast.type === "success"
                ? s.toastSuccess
                : toast.type === "error"
                ? s.toastError
                : s.toastDefault
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle
                size={20}
                className={s.toastIconSuccess}
              />
            ) : (
              <XCircle
                size={20}
                className={
                  toast.type === "error"
                    ? s.toastIconError
                    : s.toastIconDefault
                }
              />
            )}

            <div className={s.toastFlex}>
              <p className={s.toastMessage}>{toast.message}</p>

              {toast.confirm && (
                <div className={s.toastButtonContainer}>
                  <button
                    onClick={handleConfirmClose}
                    className={s.toastConfirmBtn}
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() => setToast(null)}
                    className={s.toastCancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!toast.confirm && (
              <button
                onClick={() => setToast(null)}
                className={s.toastCloseBtn}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className={s.contentWrapper}>
        {/* Header */}
        <div className={s.headerContainer}>
          <div>
            <h1 className={s.headerTitle}>
              Job Portal Dashboard
            </h1>

            <p className={s.headerSubtitle}>
              <TrendingUp className={s.headerIcon} />
              <span>
                Real-time overview of jobs and applicants
              </span>
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className={s.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className={s.statCard}>
                <div className={s.statCardOverlay}></div>

                <div className={s.statCardContent}>
                  <div className={s.statCardTextContainer}>
                    <p className={s.statCardLabel}>
                      {stat.label}
                    </p>

                    <p className={s.statCardValue}>
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`${s.statCardIconWrapper} ${stat.colors.bgLight} bg-linear-to-br ${stat.colors.gradient}`}
                  >
                    <Icon
                      className={s.statCardIcon}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className={s.filtersContainer}>
          <div className={s.filterHeader}>
            <div className={s.filtersTitleContainer}>
              <Filter className={s.filtersIcon} />
              <h2 className={s.filtersTitle}>Filters</h2>
            </div>

            {(companyFilter ||
              roleFilter ||
              statusFilter !== "active") && (
              <button
                onClick={clearFilters}
                className={s.filtersClearBtn}
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          <div className={s.filtersGrid}>
            {/* Company filter */}
            <div className={s.filterInputContainer}>
              <label className={s.filterLabel}>
                Filter by Company
              </label>

              <div className={s.filterInputWrapper}>
                <Search className={s.filterSearchIcon} />

                <select
                  value={companyFilter}
                  onChange={(e) =>
                    setCompanyFilter(e.target.value)
                  }
                  className={s.filterSelect}
                >
                  <option value="">All Companies</option>

                  {uniqueCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role filter */}
            <div className={s.filterInputContainer}>
              <label className={s.filterLabel}>
                Filter by Roles
              </label>

              <div className={s.filterInputWrapper}>
                <Search className={s.filterSearchIcon} />

                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value)
                  }
                  className={s.filterSelect}
                >
                  <option value="">All Roles</option>

                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs section */}
        <div className={s.jobsSection}>
          <div className={s.jobsHeader}>
            <h2 className={s.jobsTitle}>
              <Building className={s.jobsTitleIcon} />

              {statusFilter === "active"
                ? "Active Roles"
                : statusFilter === "closed"
                ? "Closed Roles"
                : "All Roles"}
            </h2>

            <div className={s.jobsFilterContainer}>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className={s.jobStatusSelect}
              >
                <option value="active">Active Jobs</option>
                <option value="closed">Closed Jobs</option>
                <option value="all">All Jobs</option>
              </select>

              <div className={s.jobsCount}>
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"}
              </div>
            </div>
          </div>

          {/* Job cards */}
          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loadingSpinner}></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className={s.jobsGrid}>
              {filteredJobs.map((job) => (
                <div key={job.id} className={s.jobCard}>
                  <div className={s.jobCardOverlay}></div>

                  <div className={s.jobCardContent}>
                    <div className={s.jobCardHeader}>
                      <div className={s.jobLogoContainer}>
                        <div className={s.jobLogoWrapper}>
                          <img
                            src={job.logo}
                            alt={job.name}
                            className={s.jobLogo}
                            onError={handleImageError}
                          />

                          <div
                            className={`${s.jobLogoFallback} hidden`}
                          >
                            <Building
                              className={s.jobLogoFallbackIcon}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={s.jobDetails}>
                        <h3 className={s.jobRole}>
                          {job.role}
                        </h3>

                        <p className={s.jobCompany}>
                          <Building
                            className={s.jobCompanyIcon}
                          />
                          {job.name}
                        </p>

                        <p className={s.jobLocation}>
                          <MapPin
                            className={s.jobLocationIcon}
                          />
                          {job.location}
                        </p>
                      </div>
                    </div>

                    <div className={s.jobMeta}>
                      <span className={s.jobCategory}>
                        {job.category}
                      </span>

                      <div className={s.jobApplicants}>
                        <Users
                          className={s.jobApplicationsIcon}
                        />

                        <span className={s.jobApplicantsCount}>
                          {job.applicants}
                        </span>

                        <span className={s.jobApplicantsLabel}>
                          applicants
                        </span>
                      </div>
                    </div>

                    {/* Job actions */}
                    <div className={s.jobActions}>
                      <button
                        onClick={() =>
                          navigate("/applicants", {
                            state: {
                              jobId: job.id,
                              role: job.role,
                              companyName: job.name,
                            },
                          })
                        }
                        className={s.viewApplicantsBtn}
                      >
                        View Applicants
                      </button>

                      {job.status === "active" && (
                        <button
                          onClick={() =>
                            handleCloseJob(job.id)
                          }
                          className={s.closeJobBtn}
                        >
                          Close Job
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={s.emptyState}>
              <Building className={s.emptyStateIcon} />

              <h3 className={s.emptyStateTitle}>
                No matching jobs found
              </h3>

              <p className={s.emptyStateText}>
                Try adjusting your filters
              </p>

              <button
                onClick={clearFilters}
                className={s.emptyStateBtn}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{s.animations}</style>
    </div>
  );
};

export default Dashboard;
