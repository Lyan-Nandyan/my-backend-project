import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Register, Login, UploadImage, ExtractWatermark, Dashboard } from './pages';//jangan lupa tambah kalau ada page baru

// Definisikan routing
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/regis",
    element: <Register />,
  },
  {
    path: "/watermark",
    element: <UploadImage />,
  },
  {
    path: "/extract_watermark",
    element: <ExtractWatermark />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

// Render aplikasi dengan routing
ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);