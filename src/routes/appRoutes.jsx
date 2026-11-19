// src/routes/appRoutes.jsx
import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import ErpDashboard from "../pages/ErpDashboard/ErpDashboard";
import CropMap from "../pages/CropMap/CropMap";
import WholesaleBulk from "../pages/WholesaleBulk/WholesaleBulk";
import NotFound from "../pages/NotFound/NotFound";
import RouteError from "../pages/NotFound/RouteError";

export const appRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "erp", element: <ErpDashboard /> },
      { path: "crop-map", element: <CropMap /> },
      { path: "wholesale", element: <WholesaleBulk /> },
      { path: "wholesale-bulk", element: <Navigate to="/wholesale" replace /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];