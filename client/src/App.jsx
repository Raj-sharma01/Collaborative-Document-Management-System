import Editor from "./components/Editor"
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';

function App() {

  return (
    <>
      {/* <Outlet /> */}
    </>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to={`/docs/${uuidv4()}`} />,

  },
  {
    path: '/docs/:id',
    element: <Editor />
  }
])


export default App
