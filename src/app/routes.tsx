import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/doctor",
    Component: DoctorDashboard,
  },
  {
    path: "/patient",
    Component: PatientDashboard,
  },
]);
