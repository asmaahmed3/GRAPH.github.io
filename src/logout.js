import "./index.css"

function Logout() {
    sessionStorage.removeItem('jwt');
    window.location.href = "/";
}
export default Logout;