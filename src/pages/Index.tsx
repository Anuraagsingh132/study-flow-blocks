
import { useNavigate, useEffect } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to Dashboard
    navigate("/");
  }, [navigate]);
  
  return null;
};

export default Index;
