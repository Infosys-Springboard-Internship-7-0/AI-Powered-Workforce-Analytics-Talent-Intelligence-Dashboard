import { ArrowDown, ArrowUp, ArrowUpDown, Database, Download, Filter, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { dataAttributes } from '../data/site';
import { API_BASE_URL, apiFetch } from '../lib/api';

type RowData = Record<string, string | number | null>;

export function DataViewerPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort, Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [attritionFilter, setAttritionFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [overtimeFilter, setOvertimeFilter] = useState('ALL');

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ rows: RowData[] }>('/api/datasets/preview?limit=1500')
      .then((data) => {
        if (data.rows && data.rows.length > 0) {
          setRows(data.rows);
        } else {
          // Fallback mock sample
          setRows(generateMockRows());
        }
      })
      .catch(() => {
        setRows(generateMockRows());
      })
      .finally(() => setLoading(false));
  }, []);

  // Department options for filter
  const departments = useMemo(() => {
    const deps = new Set<string>();
    rows.forEach((r) => {
      if (r.Department) deps.add(String(r.Department));
    });
    return Array.from(deps);
  }, [rows]);

  // Filtered and Sorted Rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => val != null && String(val).toLowerCase().includes(q))
      );
    }

    if (departmentFilter !== 'ALL') {
      result = result.filter((row) => String(row.Department) === departmentFilter);
    }

    if (attritionFilter !== 'ALL') {
      result = result.filter((row) => String(row.Attrition).toLowerCase() === attritionFilter.toLowerCase());
    }

    if (genderFilter !== 'ALL') {
      result = result.filter((row) => String(row.Gender).toLowerCase() === genderFilter.toLowerCase());
    }

    if (overtimeFilter !== 'ALL') {
      result = result.filter((row) => String(row.OverTime).toLowerCase() === overtimeFilter.toLowerCase());
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, searchQuery, departmentFilter, attritionFilter, genderFilter, overtimeFilter, sortColumn, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // KPI Metrics calculated from dataset
  const stats = useMemo(() => {
    const total = filteredRows.length;
    const attrited = filteredRows.filter((r) => String(r.Attrition).toLowerCase() === 'yes').length;
    const attritionRate = total > 0 ? ((attrited / total) * 100).toFixed(1) : '0';
    const totalIncome = filteredRows.reduce((sum, r) => sum + (Number(r.MonthlyIncome) || 0), 0);
    const avgIncome = total > 0 ? Math.round(totalIncome / total) : 0;
    const totalAge = filteredRows.reduce((sum, r) => sum + (Number(r.Age) || 0), 0);
    const avgAge = total > 0 ? (totalAge / total).toFixed(1) : '0';

    return { total, attrited, attritionRate, avgIncome, avgAge };
  }, [filteredRows]);

  const handleDownloadCsv = () => {
    window.location.href = `${API_BASE_URL}/api/datasets/download`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow"><Database size={14} /> HR DATASET VIEWER</span>
        <h1>Workforce Dataset Preview & Analytics</h1>
        <p>Interactive tabular dataset viewer exposing all 32 HR workforce attributes with real-time filtering, column sorting, pagination, and CSV download.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-4">
        <div className="stat-card">
          <label>Total Employees</label>
          <div className="value">{stats.total}</div>
          <div className="subtext">Filtered Records</div>
        </div>
        <div className="stat-card">
          <label>Attrition Count</label>
          <div className="value" style={{ color: 'var(--danger)' }}>{stats.attrited}</div>
          <div className="subtext">{stats.attritionRate}% Attrition Rate</div>
        </div>
        <div className="stat-card">
          <label>Avg Monthly Income</label>
          <div className="value">${stats.avgIncome.toLocaleString()}</div>
          <div className="subtext">Filtered Population</div>
        </div>
        <div className="stat-card">
          <label>Average Age</label>
          <div className="value">{stats.avgAge} yrs</div>
          <div className="subtext">Workforce Demographic</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="panel" style={{ padding: '18px' }}>
        <div className="grid grid-4" style={{ gap: '12px' }}>
          <div className="form-group">
            <label><Search size={14} /> Search Dataset</label>
            <input
              className="input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Role, Dept, Income..."
            />
          </div>

          <div className="form-group">
            <label><Filter size={14} /> Department</label>
            <select
              className="select"
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Attrition Status</label>
            <select
              className="select"
              value={attritionFilter}
              onChange={(e) => { setAttritionFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Attrition</option>
              <option value="Yes">Yes (Attrited)</option>
              <option value="No">No (Retained)</option>
            </select>
          </div>

          <div className="form-group">
            <label>OverTime</label>
            <select
              className="select"
              value={overtimeFilter}
              onChange={(e) => { setOvertimeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All OverTime</option>
              <option value="Yes">OverTime Required</option>
              <option value="No">No OverTime</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Showing <strong>{paginatedRows.length}</strong> of <strong>{filteredRows.length}</strong> matching records
          </span>

          <button className="button button-primary" type="button" onClick={handleDownloadCsv}>
            <Download size={16} /> Download CSV Dataset
          </button>
        </div>
      </div>

      {/* Interactive Table Panel */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                {dataAttributes.map((attr) => (
                  <th key={attr} className="sortable" onClick={() => handleSort(attr)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{attr}</span>
                      {sortColumn === attr ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={10} style={{ opacity: 0.4 }} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={dataAttributes.length + 1} style={{ textAlign: 'center', padding: '32px' }}>
                    <Sparkles size={20} className="spin" style={{ color: 'var(--accent)' }} /> Loading workforce dataset...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={dataAttributes.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No matching records found. Try adjusting your search query or filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                    {dataAttributes.map((attr) => {
                      const val = row[attr];
                      const isAttrition = attr === 'Attrition';
                      return (
                        <td key={attr}>
                          {isAttrition ? (
                            <span className={String(val).toLowerCase() === 'yes' ? 'tag tag-danger' : 'tag tag-green'} style={{
                              background: String(val).toLowerCase() === 'yes' ? 'var(--danger-light)' : 'var(--success-light)',
                              color: String(val).toLowerCase() === 'yes' ? 'var(--danger)' : 'var(--success)',
                              borderColor: String(val).toLowerCase() === 'yes' ? '#fca5a5' : 'var(--success-border)',
                            }}>
                              {String(val ?? 'No')}
                            </span>
                          ) : (
                            String(val ?? '-')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Rows per page:</span>
            <select
              className="select"
              style={{ width: '80px', padding: '4px 8px', fontSize: '0.8rem' }}
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              className="button button-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span style={{ fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
            <button
              className="button button-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockRows(): RowData[] {
  return [
    { Age: 41, Attrition: 'Yes', BusinessTravel: 'Travel_Rarely', DailyRate: 1102, Department: 'Sales', DistanceFromHome: 1, Education: 2, EducationField: 'Life Sciences', EmployeeNumber: 1, EnvironmentSatisfaction: 2, Gender: 'Female', HourlyRate: 94, JobInvolvement: 3, JobLevel: 2, JobRole: 'Sales Executive', JobSatisfaction: 4, MaritalStatus: 'Single', MonthlyIncome: 5993, MonthlyRate: 19479, NumCompaniesWorked: 8, OverTime: 'Yes', PercentSalaryHike: 11, PerformanceRating: 3, RelationshipSatisfaction: 1, StockOptionLevel: 0, TotalWorkingYears: 8, TrainingTimesLastYear: 0, WorkLifeBalance: 1, YearsAtCompany: 6, YearsInCurrentRole: 4, YearsSinceLastPromotion: 0, YearsWithCurrManager: 5 },
    { Age: 49, Attrition: 'No', BusinessTravel: 'Travel_Frequently', DailyRate: 279, Department: 'Research & Development', DistanceFromHome: 8, Education: 1, EducationField: 'Life Sciences', EmployeeNumber: 2, EnvironmentSatisfaction: 3, Gender: 'Male', HourlyRate: 61, JobInvolvement: 2, JobLevel: 2, JobRole: 'Research Scientist', JobSatisfaction: 2, MaritalStatus: 'Married', MonthlyIncome: 5130, MonthlyRate: 24907, NumCompaniesWorked: 1, OverTime: 'No', PercentSalaryHike: 23, PerformanceRating: 4, RelationshipSatisfaction: 4, StockOptionLevel: 1, TotalWorkingYears: 10, TrainingTimesLastYear: 3, WorkLifeBalance: 3, YearsAtCompany: 10, YearsInCurrentRole: 7, YearsSinceLastPromotion: 1, YearsWithCurrManager: 7 },
    { Age: 37, Attrition: 'Yes', BusinessTravel: 'Travel_Rarely', DailyRate: 1373, Department: 'Research & Development', DistanceFromHome: 2, Education: 2, EducationField: 'Other', EmployeeNumber: 4, EnvironmentSatisfaction: 4, Gender: 'Male', HourlyRate: 92, JobInvolvement: 2, JobLevel: 1, JobRole: 'Laboratory Technician', JobSatisfaction: 3, MaritalStatus: 'Single', MonthlyIncome: 2090, MonthlyRate: 2396, NumCompaniesWorked: 6, OverTime: 'Yes', PercentSalaryHike: 15, PerformanceRating: 3, RelationshipSatisfaction: 2, StockOptionLevel: 0, TotalWorkingYears: 7, TrainingTimesLastYear: 3, WorkLifeBalance: 3, YearsAtCompany: 0, YearsInCurrentRole: 0, YearsSinceLastPromotion: 0, YearsWithCurrManager: 0 },
  ];
}
