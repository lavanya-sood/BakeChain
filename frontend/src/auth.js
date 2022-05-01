export default function getAuthToken() {
    const authToken = localStorage.getItem('_auth');
    return authToken ? authToken : '';
}