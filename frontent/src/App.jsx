import { useState, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [fetchRecord, setFetchRecord] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("http://localhost:8080/fetchData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setFetchRecord(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <div>
        <Bar name={userName} isAuthenticated={isAuthenticated} />
      </div>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Enter setIsAuthenticated={setIsAuthenticated} setUserName={setUserName} />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserName={setUserName} />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
          <Route path="/about" element={<Todosave />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      <div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Landing() {
  const navigate = useNavigate();
  return (
    <div className='LandingPage'>
      <div><h1>Here Display an Image</h1></div>
      <div>
        <button className='loginbtn' onClick={() => navigate("/signup")}>Sign Up</button>
        <button className='loginbtn' onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  )
}

function NavigateButton({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className='setBAR'>
      <button onClick={() => navigate("/home")} disabled={!isAuthenticated}>
        Home
      </button>
      <button onClick={() => navigate("/about")}>About</button>
      <button onClick={() => navigate("/contact")}>Contact</button>
    </div>
  );
}

function Bar({ name, isAuthenticated }) {
  const navigate = useNavigate();
  return (
    <div className='navBar'>
      <div>Todo APP</div>
      <NavigateButton isAuthenticated={isAuthenticated} />
      <div className='navBar2'>
        <div>Hello, {name}</div>
        <button className='u cursor' onClick={() => navigate("/signup")}>SignUp/Login</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className='footer'>Thanks for giving your love</div>
  );
}

function Enter({ setIsAuthenticated }) {
  const [userfirstname, setuserfirstname] = useState('');
  const [userlastname, setuserlastname] = useState('');
  const [gmailId, setgmailId] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { userfirstname, userlastname, gmailId, password };

    try {
      const response = await fetch('http://localhost:8080/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json(); // Assuming the response contains the user's data
        setIsAuthenticated(true);
        setUserName(userData.firstName);
        navigate('/about');
      } else {
        const errorData = await response.text();
        console.error("Signup failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div>Welcome Sir, Are You Ready to Sign Up.</div>
      <form onSubmit={handleSubmit} className='form1'>
        <input type="text" placeholder='Enter Your First Name' value={userfirstname} onChange={(e) => setuserfirstname(e.target.value)} />
        <input type="text" placeholder='Enter Your Last Name' value={userlastname} onChange={(e) => setuserlastname(e.target.value)} />
        <input type="email" placeholder='Enter Your Email' value={gmailId} onChange={(e) => setgmailId(e.target.value)} />
        <input type="password" placeholder='Enter Your Password' value={password} onChange={(e) => setpassword(e.target.value)} />
        <button type="submit" className='loginbtn'>Sign Up</button>
        <button className='u cursor' onClick={() => navigate("/login")}>Login</button>
      </form>
    </div>
  );
}

function Todosave() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { title, description };

    try {
      const response = await fetch('http://localhost:8080/fetchData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Todo created successfully:', userData);
      } else {
        console.error('Todo creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <div>
      <div>Todo App</div>
      <form onSubmit={handleSubmit} className='form1'>
        <input type="text" placeholder='Title' onChange={(e) => settitle(e.target.value)} />
        <input type="text" placeholder='description' onChange={(e) => setdescription(e.target.value)} />
        <button type="submit" className='loginbtn'>Add</button>
      </form>
    </div>
  );
}

function Login({ setIsAuthenticated }) {
  const [gmailId, setgmailId] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { gmailId, password };

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        const userData = await response.json(); // Assuming the response contains the user's data
        setuserName(userData.firstName);
        navigate('/home');
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div>Welcome Sir, Are You Ready to Login.</div>
      <form onSubmit={handleSubmit} className='form1'>
        <input type="email" placeholder='Enter Your Email' value={gmailId} onChange={(e) => setgmailId(e.target.value)} />
        <input type="password" placeholder='Enter Your Password' value={password} onChange={(e) => setpassword(e.target.value)} />
        <button type="submit" className='loginbtn'>Login</button>
        <button className='u cursor' onClick={() => navigate("/signup")}>signup</button>
      </form>
    </div>
  );
}

function Contact() {
  return (
    <div className='contactContainer'>
      <div className='contactHeader'>Contact Page</div>
      <div className='formSection'>
        <form action="" className='contactForm'>
          <input type="text" placeholder='Name' />
          <input type="email" placeholder='Enter Your Email' />
          <textarea cols={50} />
          <button className='loginbtn'>send</button>
        </form>

      </div>
    </div>
  )
}
function About() {
  return (
    <div>
      <div className='contactHeader'>
        About
      </div>
      <pre>
        About Us

      </pre>
    </div>
  )
}

export default App;
