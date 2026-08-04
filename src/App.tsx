import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminGuard } from './components/AdminGuard';
import { AppFrame } from './components/AppFrame';
import { useSharedDataSync } from './hooks/useSharedDataSync';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import TicketPage from './pages/TicketPage';

function PortHome() {
  if (window.location.port === '1666') {
    return <Navigate to="/admin" replace />;
  }

  return <CustomerMenuPage />;
}

export default function App() {
  useSharedDataSync();

  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<PortHome />} />
        <Route path="/orders" element={<CustomerOrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/ticket/:orderId" element={<TicketPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminOrdersPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <AdminGuard>
              <AdminMenuPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppFrame>
  );
}
