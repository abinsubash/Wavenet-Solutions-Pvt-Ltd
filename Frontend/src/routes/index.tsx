import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/common/Login';
import SuperAdminLogin from '../pages/superAdmin/Login';
import SuperAdminHome from '../pages/superAdmin/Home';
import AdminHome from '../pages/admin/AdminHome';
import UnitManagerHome from '../pages/unitManager/UnitManagerHome';
import UserHome from '../pages/user/UserHome';
import AuthGuard from './ProtectedRoute';
import GroupedUser from '../pages/unitManager/GroupedUser';
import GroupedAdmin from '../pages/admin/GroupedAdmin';
import ManageUser from '../pages/admin/ManageUser';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: 'login',
    element: <AuthGuard requireAuth={false} />,
    children: [
      {
        index: true,
        element: <Login />
      }
    ]
  },
  {
    path: 'super-admin',
    children: [
      {
        element: <AuthGuard requireAuth={false} allowedRoles={['superadmin']} />,
        children: [
          {
            path: 'login',
            element: <SuperAdminLogin />
          }
        ]
      },
      {
        element: <AuthGuard requireAuth={true} allowedRoles={['superadmin']} />,
        children: [
          {
            path: 'home',
            element: <SuperAdminHome />
          }
        ]
      }
    ]
  },
  {
    path: 'admin',
    children: [
      {
        element: <AuthGuard requireAuth={true} allowedRoles={['admin']} />,
        children: [
          {
            path: 'home',
            element: <AdminHome />
          },
          {
            path: 'grouped/:id',
            element: <GroupedAdmin />
          },
          {
            path: 'manage-users/:id',
            element: <ManageUser />
          }
        ]
      }
    ]
  },
  {
    path: 'unit-manager',
    children: [
      {
        element: <AuthGuard requireAuth={true} allowedRoles={['unitmanager','admin']} />,
        children: [
          {
            path: 'home',
            element: <UnitManagerHome />
          },
          {
            path: 'grouped/:id',
            element: <GroupedUser />
          }
        ]
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        element: <AuthGuard requireAuth={true} allowedRoles={['user']} />,
        children: [
          {
            path: 'home',
            element: <UserHome />
          }
        ]
      }
    ]
  },
  {
    path: 'unauthorized',
    element: <div>Unauthorized Access</div>
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);