document.addEventListener("DOMContentLoaded", () => {
    // Grab the existing timer element from your HTML
    const timerContainer = document.getElementById("date-time");
    if (!timerContainer) return; // Exit if the element isn't found

    async function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const defaultVideo = "https://youtu.be/1IPtOGj1_uA";
        const livestreamURL = "https://youtube.com/live/OpXwxrBJ9To?feature=share";
        let videoLink = defaultVideo;

        try {
            const res = await fetch("https://live-check-krn7.onrender.com/check-live");
            const isLive = await res.json();
            if (isLive) {
                videoLink = livestreamURL;
            }
        } catch (e) {
            console.error("Could not check live status:", e);
        }

        const label = (videoLink === livestreamURL)
            ? `<span style="color:red;font-weight:bold;">🔴 LIVE NOW</span> | <a id="custom-message" href="${videoLink}" target="_blank" rel="noopener noreferrer">Click to join the stream</a>`
            : `<a id="custom-message" href="${videoLink}" target="_blank" rel="noopener noreferrer">Bowser’s Fury Is Actually a Masterpiece. OUT NOW!!!</a>`;

        timerContainer.innerHTML = `${day} ${month} ${year} ${hours}:${minutes}:${seconds} | ${label}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 3D Rotation for Blog Image (Desktop + Mobile Swipe Support)
    const blogImage3D = document.querySelector(".blog-3d");

    if (blogImage3D) {
        let blogDragging = false;
        let blogStartX = 0;
        let blogStartY = 0;
        let blogRotationX = 0;
        let blogRotationY = 0;
        let velocityX = 0;
        let velocityY = 0;
        let friction = 0.95;

        // Mouse Drag (For Desktop)
        blogImage3D.addEventListener("mousedown", (e) => {
            e.preventDefault();
            blogDragging = true;
            blogStartX = e.clientX;
            blogStartY = e.clientY;
            velocityX = 0;
            velocityY = 0;
            blogImage3D.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
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

        window.addEventListener("mouseup", () => {
            blogDragging = false;
            blogImage3D.style.cursor = "grab";
            requestAnimationFrame(applyMomentum);
        });

        // Touch Swipe (For Mobile, Prevents Scrolling)
        blogImage3D.addEventListener("touchstart", (e) => {
            e.preventDefault();
            blogStartX = e.touches[0].clientX;
            blogStartY = e.touches[0].clientY;
            velocityX = 0;
            velocityY = 0;
        });

        blogImage3D.addEventListener("touchmove", (e) => {
            e.preventDefault();
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

        // Apply Momentum Effect (Keeps Rotation Going Smoothly)
        function applyMomentum() {
            if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

            velocityX *= friction;
            velocityY *= friction;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            requestAnimationFrame(applyMomentum);
        }

        // Restrict scroll-blocking only to the 3D image
        blogImage3D.addEventListener("touchmove", (e) => {
            if (blogDragging) e.preventDefault();
        }, { passive: false });
    }
});
