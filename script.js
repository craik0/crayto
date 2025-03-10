document.addEventListener("DOMContentLoaded", () => {
    // ✅ Timer Code (Now Works Alongside 3D)
    function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0'); // Day (DD)
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month (MM)
        const year = now.getFullYear(); // Year (YYYY)
        const hours = String(now.getHours()).padStart(2, '0'); // Hours (HH)
        const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutes (MM)
        const seconds = String(now.getSeconds()).padStart(2, '0'); // Seconds (SS)

        // Format: "DD MM YYYY HH:MM:SS"
        const formattedDateTime = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;

        // Update the HTML
        const dateTimeElement = document.getElementById('date-time');
        if (dateTimeElement) {
            dateTimeElement.textContent = formattedDateTime;
        }
    }

    // ✅ Update time every second (Runs Separately from 3D)
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Run once immediately

    // ✅ 3D Rotation for Blog Image with Smooth Movement and Momentum
    const blogImage3D = document.querySelector('.blog-3d');

    if (blogImage3D) {
        let blogDragging = false;
        let blogStartX = 0;
        let blogStartY = 0;
        let blogRotationX = 0;
        let blogRotationY = 0;
        let velocityX = 0;
        let velocityY = 0;
        let friction = 0.95;

        blogImage3D.addEventListener('mousedown', (e) => {
            e.preventDefault();
            blogDragging = true;
            blogStartX = e.clientX;
            blogStartY = e.clientY;
            velocityX = 0; 
            velocityY = 0; 
            blogImage3D.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!blogDragging) return;

            const deltaX = e.clientX - blogStartX;
            const deltaY = e.clientY - blogStartY;
            blogStartX = e.clientX;
            blogStartY = e.clientY;

            velocityX = deltaX * 0.5;
            velocityY = deltaY * 0.5;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;
        });

        window.addEventListener('mouseup', () => {
            blogDragging = false;
            blogImage3D.style.cursor = 'grab';
            requestAnimationFrame(applyMomentum);
        });

        function applyMomentum() {
            if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

            velocityX *= friction;
            velocityY *= friction;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            requestAnimationFrame(applyMomentum);
        }
    }
});

