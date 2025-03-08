document.addEventListener("DOMContentLoaded", function () {

    // Logout confirmation
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();

        const isConfirmed = confirm("Are you sure you want to log out?");
        if (isConfirmed) {
            window.location.href = '../J-Mab/HTML/sign-in.php'; // Redirect to login page
        }
    });
});