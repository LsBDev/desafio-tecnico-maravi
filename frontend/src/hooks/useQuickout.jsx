import { useContext, useEffect } from "react";
import AuthContext from "../contexts/AuthContext.js";
import UserContext from "../contexts/UserContext.js";
import { useNavigate } from "react-router-dom";


export default function useQuickOut() {
  const {user, setUser} = useContext(UserContext)
  const {token, setToken} = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if(!token || !user) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("last_agendamento_linha")
      localStorage.removeItem("last_agendamento_user_position")
      localStorage.removeItem("last_agendamento_bus_position")
      localStorage.removeItem("last_agendamento_dados_notificacao")
      setToken(null);
      setUser(null);
      navigate("/")
    }
  }, [token, user, navigate, setToken, setUser])
}