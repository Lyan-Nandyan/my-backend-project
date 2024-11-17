import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Register, Login, Chat, UploadImage } from './pages';//jangan lupa tambah kalau ada page baru

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
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/watermark",
    element: <UploadImage />,
  },
]);

// Render aplikasi dengan routing
ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);