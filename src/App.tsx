import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import SetupPage from './pages/SetupPage';
import PartsPage from './pages/PartsPage';
import LevelsPage from './pages/LevelsPage';
import AnalysisPage from './pages/AnalysisPage';
import BracingPage from './pages/BracingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <SetupPage /> },
      { path: 'setup', element: <SetupPage /> },
      { path: 'parts', element: <PartsPage /> },
      { path: 'levels', element: <LevelsPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'bracing', element: <BracingPage /> },
    ],
  },
  ],
  {
    basename: '/StructToolKit',  // 👈 must match vite.config.ts base
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;