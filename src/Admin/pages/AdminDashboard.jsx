import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";
import AdminHeader from "../components/AdminHeader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [salesView, setSalesView] = useState("monthly");
  const [salesChartData, setSalesChartData] = useState([]);

  const [shipment, setShipment] = useState({
    placed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  });

  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [salesView]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminAccessToken");

      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/dashboard/?view=${salesView}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(res.data.stats);
      setShipment(res.data.shipment);
      setRecentOrders(res.data.recent_orders);
      setSalesChartData(res.data.sales_chart);
    } catch (error) {
      console.log(error);
    }
  };

  const totalShipments =
    shipment.placed +
    shipment.shipped +
    shipment.delivered +
    shipment.cancelled +
    shipment.returned || 1;

  const pPlaced = (shipment.placed / totalShipments) * 100;
  const pShipped = (shipment.shipped / totalShipments) * 100;
  const pDelivered = (shipment.delivered / totalShipments) * 100;
  const pCancelled = (shipment.cancelled / totalShipments) * 100;

  const handleDonutHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 80;
    const y = e.clientY - rect.top - 80;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 180;

    let start = 0;
    const ranges = [
      { label: "Placed", value: shipment.placed, percent: pPlaced },
      { label: "Shipped", value: shipment.shipped, percent: pShipped },
      { label: "Delivered", value: shipment.delivered, percent: pDelivered },
      { label: "Cancelled", value: shipment.cancelled, percent: pCancelled },
    ];

    for (let r of ranges) {
      if (angle >= start && angle < start + r.percent * 3.6) {
        setHoverInfo({ ...r, x: e.clientX, y: e.clientY });
        return;
      }
      start += r.percent * 3.6;
    }
    setHoverInfo(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return { bg: "#dcfce7", color: "#166534", label: "Delivered" };
      case "Shipped":
        return { bg: "#dbeafe", color: "#1e40af", label: "Shipped" };
      case "Cancelled":
        return { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" };
      default:
        return { bg: "#fef3c7", color: "#92400e", label: "Pending" };
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <main className="dashboard-main">
        <AdminHeader />

        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value={`₹${stats.revenue.toLocaleString()}`}
              icon="💰"
              trend="+12.5%"
              trendUp={true}
            />
            <StatCard
              title="Total Orders"
              value={stats.orders.toLocaleString()}
              icon="🧾"
              trend="+8.2%"
              trendUp={true}
            />
            <StatCard
              title="Products"
              value={stats.products.toLocaleString()}
              icon="📦"
              trend="+3.1%"
              trendUp={true}
            />
            <StatCard
              title="Active Users"
              value={stats.users.toLocaleString()}
              icon="👥"
              trend="-1.4%"
              trendUp={false}
            />
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Sales Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <div className="header-title">
                  <h3>Sales Overview</h3>
                  <p className="subtitle">Revenue performance over time</p>
                </div>
                <select
                  value={salesView}
                  onChange={(e) => setSalesView(e.target.value)}
                  className="select-clean"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="chart-container">
                {salesChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                      data={salesChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="salesGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "none",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                        itemStyle={{ color: "#fff", fontSize: "14px" }}
                        formatter={(value) => [`₹${value}`, "Sales"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#salesGradient)"
                        dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                        activeDot={{
                          r: 6,
                          stroke: "#6366f1",
                          strokeWidth: 3,
                          fill: "#fff",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Shipment Donut */}
            <div className="card chart-card">
              <div className="card-header">
                <div className="header-title">
                  <h3>Shipment Status</h3>
                  <p className="subtitle">Order fulfillment breakdown</p>
                </div>
              </div>

              <div className="donut-section">
                <div className="donut-wrapper">
                  <div
                    className="donut"
                    style={{
                      background: `
                        conic-gradient(
                          #fbbf24 0% ${pPlaced}%,
                          #3b82f6 ${pPlaced}% ${pPlaced + pShipped}%,
                          #22c55e ${pPlaced + pShipped}% ${
                        pPlaced + pShipped + pDelivered
                      }%,
                          #ef4444 ${
                            pPlaced + pShipped + pDelivered
                          }% 100%
                        )
                      `,
                    }}
                    onMouseMove={handleDonutHover}
                    onMouseLeave={() => setHoverInfo(null)}
                  >
                    <div className="donut-center">
                      <span className="donut-total">
                        {totalShipments.toLocaleString()}
                      </span>
                      <span className="donut-label">Total Orders</span>
                    </div>
                  </div>
                </div>

                {hoverInfo && (
                  <div
                    className="donut-tooltip"
                    style={{
                      top: hoverInfo.y + 12,
                      left: hoverInfo.x + 12,
                    }}
                  >
                    <span
                      className="tooltip-dot"
                      style={{
                        background:
                          hoverInfo.label === "Placed"
                            ? "#fbbf24"
                            : hoverInfo.label === "Shipped"
                            ? "#3b82f6"
                            : hoverInfo.label === "Delivered"
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    />
                    <span>
                      {hoverInfo.label}: {hoverInfo.percent.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="shipment-legend">
                  <LegendItem
                    label="Placed"
                    value={shipment.placed}
                    percent={pPlaced}
                    color="#fbbf24"
                  />
                  <LegendItem
                    label="Shipped"
                    value={shipment.shipped}
                    percent={pShipped}
                    color="#3b82f6"
                  />
                  <LegendItem
                    label="Delivered"
                    value={shipment.delivered}
                    percent={pDelivered}
                    color="#22c55e"
                  />
                  <LegendItem
                    label="Cancelled"
                    value={shipment.cancelled}
                    percent={pCancelled}
                    color="#ef4444"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card orders-card">
            <div className="card-header">
              <div className="header-title">
                <h3>Recent Orders</h3>
                <p className="subtitle">Latest customer transactions</p>
              </div>
              <button className="btn-text">View All</button>
            </div>

            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const statusStyle = getStatusStyle(o.status);
                    return (
                      <tr key={o.id}>
                        <td>
                          <span className="order-id">#{o.id}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {o.customerName?.charAt(0) || "?"}
                            </div>
                            <span className="customer-name">
                              {o.customerName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="text-right font-medium">
                          ₹{o.totalAmount?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-dashboard {
          display: flex;
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dashboard-main {
          margin-left: 260px;
          padding: 32px;
          width: 100%;
          max-width: 1400px;
        }

        .dashboard-content {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Cards */
        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .header-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .select-clean {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }

        .select-clean:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .select-clean:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .btn-text {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .btn-text:hover {
          background: #eef2ff;
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-container {
          width: 100%;
          min-height: 320px;
        }

        /* Donut Chart */
        .donut-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 8px 0;
        }

        .donut-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .donut {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          position: relative;
          cursor: crosshair;
          transition: transform 0.2s ease;
        }

        .donut:hover {
          transform: scale(1.02);
        }

        .donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.04);
        }

        .donut-total {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
        }

        .donut-label {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .donut-tooltip {
          position: fixed;
          background: #0f172a;
          color: #fff;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          pointer-events: none;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          animation: tooltipIn 0.15s ease;
        }

        @keyframes tooltipIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .shipment-legend {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          padding: 0 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
        }

        .legend-item:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .legend-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .legend-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
        }

        .legend-percent {
          font-size: 11px;
          color: #94a3b8;
          margin-left: auto;
          font-weight: 600;
          background: #fff;
          padding: 2px 8px;
          border-radius: 6px;
        }

        /* Orders Table */
        .orders-card {
          padding: 0;
          overflow: hidden;
        }

        .orders-card .card-header {
          padding: 24px 24px 0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .orders-table thead th {
          padding: 14px 24px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          background: #fafbfc;
        }

        .orders-table tbody tr {
          transition: background 0.15s ease;
        }

        .orders-table tbody tr:hover {
          background: #f8fafc;
        }

        .orders-table tbody td {
          padding: 16px 24px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .order-id {
          font-family: 'SF Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .customer-name {
          font-weight: 500;
          color: #0f172a;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .text-right {
          text-align: right;
        }

        .font-medium {
          font-weight: 600;
          color: #0f172a;
        }

        /* Scrollbar styling */
        .table-wrapper::-webkit-scrollbar {
          height: 6px;
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

const LegendItem = ({ label, value, percent, color }) => (
  <div className="legend-item">
    <div className="legend-color" style={{ background: color }} />
    <div className="legend-info">
      <span className="legend-label">{label}</span>
      <span className="legend-value">{value.toLocaleString()}</span>
    </div>
    <span className="legend-percent">{percent.toFixed(1)}%</span>
  </div>
);

export default AdminDashboard;