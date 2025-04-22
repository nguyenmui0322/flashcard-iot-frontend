import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import WordGroups from "./pages/WordGroups";
import WordGroupDetail from "./pages/WordGroupDetail";
import AddEditWordGroup from "./pages/AddEditWordGroup";
import AddEditWord from "./pages/AddEditWord";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups"
            element={
              <PrivateRoute>
                <WordGroups />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups/add"
            element={
              <PrivateRoute>
                <AddEditWordGroup />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups/edit/:groupId"
            element={
              <PrivateRoute>
                <AddEditWordGroup />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups/:groupId"
            element={
              <PrivateRoute>
                <WordGroupDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups/:groupId/add-word"
            element={
              <PrivateRoute>
                <AddEditWord />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-groups/:groupId/edit-word/:wordId"
            element={
              <PrivateRoute>
                <AddEditWord />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
