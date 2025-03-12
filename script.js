document.addEventListener("DOMContentLoaded", () => {
    // ✅ Ensure Timer & Message Appear on All Devices
    let timeContainer = document.getElementById("date-time-container");

    if (!timeContainer) {
        timeContainer = document.createElement("div");
        timeContainer.id = "date-time-container";

        const timeElement = document.createElement("span");
        timeElement.id = "date-time";

        const messageElement = document.createElement("span");
        messageElement.id = "custom-message";
        messageElement.textContent = "| MESSAGE HERE"; // Ensures correct formatting

        timeContainer.appendChild(timeElement);
        timeContainer.appendChild(messageElement);

        // ✅ Ensure it appears below the navbar, even on mobile
        document.body.prepend(timeContainer);
    }

    function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
        document.getElementById("date-time").textContent = formattedDateTime;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // ✅ 3D Rotation for Blog Image (Desktop + Mobile Swipe Support)
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

        // ✅ Mouse Drag (For Desktop)
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

        // ✅ Touch Swipe (For Mobile, Prevents Scrolling)
        blogImage3D.addEventListener("touchstart", (e) => {
            e.preventDefault(); // 🔥 Prevents page scrolling on touch start
            blogStartX = e.touches[0].clientX;
            blogStartY = e.touches[0].clientY;
            velocityX = 0;
            velocityY = 0;
        });

        blogImage3D.addEventListener("touchmove", (e) => {
            e.preventDefault(); // 🔥 Prevents vertical scrolling while swiping
            let moveX = e.touches[0].clientX;
            let moveY = e.touches[0].clientY;
            let deltaX = moveX - blogStartX;
            let deltaY = moveY - blogStartY;

            velocityX = deltaX * 0.5;
            velocityY = deltaY * 0.5;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            blogStartX = moveX;
            blogStartY = moveY;
        });

        blogImage3D.addEventListener("touchend", () => {
            requestAnimationFrame(applyMomentum);
        });

        // ✅ Apply Momentum Effect (Keeps Rotation Going Smoothly)
        function applyMomentum() {
            if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

            velocityX *= friction;
            velocityY *= friction;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            requestAnimationFrame(applyMomentum);
        }

        // 🔥 Prevent page scrolling when swiping on mobile
        document.body.addEventListener("touchmove", (e) => {
            if (blogDragging) e.preventDefault();
        }, { passive: false });
    }
});
